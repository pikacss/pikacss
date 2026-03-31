import type { EngineStore } from './atomic-style'
import type { ExtractFn } from './extractor'
import type { AtomicStyle, AutocompleteContribution, CSSStyleBlockBody, CSSStyleBlocks, EngineConfig, ExtractedStyleContent, InternalStyleDefinition, InternalStyleItem, Preflight, PreflightDefinition, PreflightFn, ResolvedEngineConfig, ResolvedPreflight } from './types'
import { createEngineStore, getAtomicStyleBaseKey, optimizeAtomicStyleContents, resolveAtomicStyle } from './atomic-style'
import { ATOMIC_STYLE_ID_PLACEHOLDER, ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL, DEFAULT_ATOMIC_STYLE_ID_PREFIX, LAYER_SELECTOR_PREFIX } from './constants'
import { createExtractFn, normalizeSelectors, normalizeValue } from './extractor'
import { hooks, resolvePlugins } from './plugin'
import { important } from './plugins/important'
import { keyframes } from './plugins/keyframes'
import { selectors } from './plugins/selectors'
import { shortcuts } from './plugins/shortcuts'
import { variables } from './plugins/variables'
import {
	appendAutocomplete,
	isNotNullish,
	isPropertyValue,
	log,
	renderCSSStyleBlocks,
	toKebab,
} from './utils'

/**
 * Default CSS layer name for preflight styles.
 * @internal
 *
 * @remarks Used as the layer name wrapping all unlayered preflight output when the layer exists in `config.layers`.
 *
 * @example
 * ```ts
 * // 'preflights'
 * ```
 */
export const DEFAULT_PREFLIGHTS_LAYER = 'preflights'
/**
 * Default CSS layer name for utility (atomic) styles.
 * @internal
 *
 * @remarks Atomic styles without an explicit layer are placed into this layer when it exists in `config.layers`.
 *
 * @example
 * ```ts
 * // 'utilities'
 * ```
 */
export const DEFAULT_UTILITIES_LAYER = 'utilities'
/**
 * Default layer ordering map: `preflights` at weight 1, `utilities` at weight 10.
 * @internal
 *
 * @remarks Merged with any user-supplied `config.layers` during engine config resolution. Numeric weights determine the `@layer` declaration order.
 *
 * @example
 * ```ts
 * // { preflights: 1, utilities: 10 }
 * ```
 */
export const DEFAULT_LAYERS: Record<string, number> = { [DEFAULT_PREFLIGHTS_LAYER]: 1, [DEFAULT_UTILITIES_LAYER]: 10 }

export { getAtomicStyleId, optimizeAtomicStyleContents } from './atomic-style'

/**
 * Creates and initializes a PikaCSS engine with the given configuration.
 *
 * @param config - The engine configuration, including plugins, selectors, shortcuts, variables, keyframes, preflights, and layer settings.
 * @returns A fully initialized `Engine` instance.
 *
 * @remarks Core plugins (`important`, `variables`, `keyframes`, `selectors`, `shortcuts`) are prepended automatically. The function resolves plugins, runs all configuration hooks in sequence, and returns the ready-to-use engine.
 *
 * @example
 * ```ts
 * const engine = await createEngine({ prefix: 'pk-', plugins: [myPlugin()] })
 * ```
 */
export async function createEngine(config: EngineConfig = {}): Promise<Engine> {
	log.debug('Creating engine with config:', config)
	const corePlugins = [
		important(),
		variables(),
		keyframes(),
		selectors(),
		shortcuts(),
	]
	log.debug('Core plugins loaded:', corePlugins.length)
	const plugins = resolvePlugins([...corePlugins, ...(config.plugins || [])])
	config = { ...config, plugins }
	log.debug(`Total plugins resolved: ${plugins.length}`)

	config = await hooks.configureRawConfig(
		config.plugins!,
		config,
	)

	hooks.rawConfigConfigured(
		resolvePlugins(config.plugins!),
		config,
	)

	let resolvedConfig = await resolveEngineConfig(config)
	log.debug('Engine config resolved with prefix:', resolvedConfig.prefix)

	resolvedConfig = await hooks.configureResolvedConfig(
		resolvedConfig.plugins,
		resolvedConfig,
	)

	let engine = new Engine(resolvedConfig)

	engine.appendAutocomplete({
		extraProperties: '__layer',
		properties: { __layer: 'Autocomplete[\'Layer\']' },
	})

	log.debug('Engine instance created')
	engine = await hooks.configureEngine(
		engine.config.plugins,
		engine,
	)
	log.debug('Engine initialized successfully')

	return engine
}

/**
 * The PikaCSS engine: manages atomic style resolution, rendering, preflights, and plugin hooks.
 *
 * @remarks Constructed via `createEngine()`. Holds the resolved configuration, the atomic style store, and exposes methods for processing style items (`use`), rendering CSS output (`renderPreflights`, `renderAtomicStyles`, `renderLayerOrderDeclaration`), and managing runtime extensions (`addPreflight`, `appendAutocomplete`, `appendCssImport`).
 *
 * @example
 * ```ts
 * const engine = await createEngine({ prefix: 'pk-' })
 * const ids = await engine.use({ color: 'red' })
 * const css = await engine.renderAtomicStyles(true)
 * ```
 */
export class Engine {
	/** The fully resolved engine configuration. */
	config: ResolvedEngineConfig
	/** Reference to the plugin hook dispatcher for invoking lifecycle hooks. */
	pluginHooks = hooks

	/** The extraction function that decomposes style definitions into atomic style contents. */
	extract: ExtractFn

	/** The engine's runtime store holding registered atomic styles and their ID mappings. */
	store: EngineStore = createEngineStore()

	/**
	 * Creates an engine instance from a resolved configuration.
	 *
	 * @param config - The fully resolved engine configuration.
	 *
	 * @remarks Initializes the `extract` function by wiring it to the plugin hook pipeline for selectors, style items, and style definitions.
	 *
	 * @example
	 * ```ts
	 * const engine = new Engine(resolvedConfig)
	 * ```
	 */
	constructor(config: ResolvedEngineConfig) {
		this.config = config

		this.extract = createExtractFn({
			defaultSelector: this.config.defaultSelector,
			transformSelectors: selectors => hooks.transformSelectors(this.config.plugins, selectors),
			transformStyleItems: styleItems => hooks.transformStyleItems(this.config.plugins, styleItems),
			transformStyleDefinitions: styleDefinitions => hooks.transformStyleDefinitions(this.config.plugins, styleDefinitions),
		})
	}

	/**
	 * Fires the `preflightUpdated` hook to notify plugins that preflight content has changed.
	 *
	 *
	 * @remarks Called automatically after `addPreflight` or when plugins modify preflight-contributing state (e.g. variables, keyframes).
	 *
	 * @example
	 * ```ts
	 * engine.notifyPreflightUpdated()
	 * ```
	 */
	notifyPreflightUpdated() {
		hooks.preflightUpdated(this.config.plugins)
	}

	/**
	 * Fires the `atomicStyleAdded` hook to notify plugins that a new atomic style was registered.
	 *
	 * @param atomicStyle - The atomic style that was just added to the store.
	 *
	 * @remarks Called automatically by `use()` when a previously unseen atomic style is resolved.
	 *
	 * @example
	 * ```ts
	 * engine.notifyAtomicStyleAdded(atomicStyle)
	 * ```
	 */
	notifyAtomicStyleAdded(atomicStyle: AtomicStyle) {
		hooks.atomicStyleAdded(this.config.plugins, atomicStyle)
	}

	/**
	 * Fires the `autocompleteConfigUpdated` hook to notify plugins that autocomplete entries changed.
	 *
	 *
	 * @remarks Called automatically after `appendAutocomplete` when the contribution modifies the resolved autocomplete config.
	 *
	 * @example
	 * ```ts
	 * engine.notifyAutocompleteConfigUpdated()
	 * ```
	 */
	notifyAutocompleteConfigUpdated() {
		hooks.autocompleteConfigUpdated(this.config.plugins)
	}

	/**
	 * Merges an autocomplete contribution into the resolved autocomplete config.
	 *
	 * @param contribution - The autocomplete entries to append (selectors, properties, CSS properties, etc.).
	 *
	 * @remarks Delegates to the `appendAutocomplete` utility and fires `autocompleteConfigUpdated` if the config was actually modified.
	 *
	 * @example
	 * ```ts
	 * engine.appendAutocomplete({ selectors: 'hover', cssProperties: { color: 'red' } })
	 * ```
	 */
	appendAutocomplete(contribution: AutocompleteContribution) {
		if (appendAutocomplete(this.config, contribution))
			this.notifyAutocompleteConfigUpdated()
	}

	/**
	 * Appends a CSS `@import` statement to the preflight output.
	 *
	 * @param cssImport - The raw `@import` string (a trailing semicolon is appended if missing).
	 *
	 * @remarks Deduplicates imports. Fires `preflightUpdated` when a new import is added.
	 *
	 * @example
	 * ```ts
	 * engine.appendCssImport('@import url("https://fonts.googleapis.com/css2?family=Inter")')
	 * ```
	 */
	appendCssImport(cssImport: string) {
		const normalized = normalizeCssImport(cssImport)
		if (normalized == null || this.config.cssImports.includes(normalized))
			return

		this.config.cssImports.push(normalized)
		this.notifyPreflightUpdated()
	}

	/**
	 * Registers a new preflight that will be rendered before atomic styles.
	 *
	 * @param preflight - A preflight definition: a function, a static string/object, or a wrapper with `layer`/`id` metadata.
	 *
	 * @remarks The preflight is resolved into a `ResolvedPreflight` (extracting optional `layer` and `id`) and appended to `config.preflights`. Fires `preflightUpdated` so plugins and the integration layer know to re-render.
	 *
	 * @example
	 * ```ts
	 * engine.addPreflight({ layer: 'base', preflight: '*, *::before { box-sizing: border-box; }' })
	 * ```
	 */
	addPreflight(preflight: Preflight) {
		log.debug('Adding preflight')
		this.config.preflights.push(resolvePreflight(preflight))
		log.debug(`Total preflights: ${this.config.preflights.length}`)
		this.notifyPreflightUpdated()
	}

	/**
	 * Processes style items through the plugin pipeline and registers the resulting atomic styles in the store.
	 *
	 * @param itemList - Style items to process: string references (shortcuts) and/or style definition objects.
	 * @returns An array of atomic style IDs (and unresolved string references) in insertion order.
	 *
	 * @remarks Runs `transformStyleItems` and `extractStyleDefinition` hooks, resolves each extracted content into an atomic style, deduplicates by base key, and fires `atomicStyleAdded` for new entries.
	 *
	 * @example
	 * ```ts
	 * const ids = await engine.use({ color: 'red' }, { padding: '1rem' })
	 * ```
	 */
	async use(...itemList: InternalStyleItem[]): Promise<string[]> {
		log.debug(`Processing ${itemList.length} style items`)
		const {
			unknown,
			contents,
		} = await resolveStyleItemList({
			itemList,
			transformStyleItems: styleItems => hooks.transformStyleItems(this.config.plugins, styleItems),
			extractStyleDefinition: styleDefinition => this.extract(styleDefinition),
		})
		const resolvedIds: string[] = []
		const resolvedIdsByBaseKey = new Map<string, string>()
		for (const content of contents) {
			const { id, atomicStyle } = resolveAtomicStyle({
				content,
				prefix: this.config.prefix,
				store: this.store,
				resolvedIdsByBaseKey,
			})
			resolvedIds.push(id)
			resolvedIdsByBaseKey.set(getAtomicStyleBaseKey(content), id)
			if (atomicStyle != null) {
				log.debug(`Atomic style added: ${id}`)
				this.notifyAtomicStyleAdded(atomicStyle)
			}
		}
		log.debug(`Resolved ${resolvedIds.length} atomic styles, ${unknown.size} unknown items`)
		return [...unknown, ...resolvedIds]
	}

	/**
	 * Renders all registered preflight definitions into a CSS string.
	 *
	 * @param isFormatted - Whether to produce human-readable CSS with newlines and indentation.
	 * @returns The rendered preflight CSS, including `@import` statements, optional `@layer` wrappers, and all preflight content.
	 *
	 * @remarks Evaluates each preflight function, groups output by layer, wraps unlayered preflights in the default preflights layer (when present), and respects configured layer ordering.
	 *
	 * @example
	 * ```ts
	 * const css = await engine.renderPreflights(true)
	 * ```
	 */
	async renderPreflights(isFormatted: boolean) {
		log.debug('Rendering preflights...')
		const lineEnd = isFormatted ? '\n' : ''

		const rendered: { layer?: string, css: string }[] = (await Promise.all(
			this.config.preflights.map(async ({ layer, fn }) => {
				const result = await fn(this, isFormatted)
				const css = (
					typeof result === 'string'
						? result
						: await renderPreflightDefinition({ engine: this, preflightDefinition: result, isFormatted })
				).trim()
				return { layer, css }
			}),
		)).filter(r => r.css)
		log.debug(`Rendered ${rendered.length} preflights`)

		const { unlayeredParts, layerGroups } = groupRenderedPreflightsByLayer(rendered)

		const outputParts: string[] = []
		if (this.config.cssImports.length > 0)
			outputParts.push(...this.config.cssImports)
		if (unlayeredParts.length > 0) {
			const { defaultPreflightsLayer } = this.config
			// Unlayered preflights are automatically wrapped inside the defaultPreflightsLayer
			// when that layer name exists in the configured layers.
			if (defaultPreflightsLayer in this.config.layers) {
				const unlayeredContent = unlayeredParts
					.map(
						part => part.trim()
							.split('\n')
							.map(line => `  ${line}`)
							.join(lineEnd),
					)
					.join(lineEnd)
				outputParts.push(`@layer ${defaultPreflightsLayer} {${lineEnd}${unlayeredContent}${lineEnd}}`)
			}
			else {
				const unlayeredContent = unlayeredParts.join(lineEnd)
				outputParts.push(unlayeredContent)
			}
		}
		outputParts.push(...renderLayerBlocks({
			layerGroups,
			layerOrder: sortLayerNames(this.config.layers),
			isFormatted,
			render: cssList => cssList.join(lineEnd),
		}))
		return outputParts.join(lineEnd)
	}

	/**
	 * Renders atomic styles into a CSS string, optionally filtered by ID and grouped by layer.
	 *
	 * @param isFormatted - Whether to produce human-readable CSS with newlines and indentation.
	 * @param options - Optional filtering: `atomicStyleIds` to render a subset, `isPreview` to use placeholder IDs.
	 * @returns The rendered atomic-style CSS.
	 *
	 * @remarks Styles are sorted by rendering weight (selector specificity depth), grouped into configured `@layer` blocks, and rendered. When `isPreview` is true, atomic style IDs remain as placeholders for tooling previews.
	 *
	 * @example
	 * ```ts
	 * const css = await engine.renderAtomicStyles(true)
	 * ```
	 */
	async renderAtomicStyles(isFormatted: boolean, options: { atomicStyleIds?: string[], isPreview?: boolean } = {}) {
		log.debug('Rendering atomic styles...')
		const { atomicStyleIds = null, isPreview = false } = options

		const atomicStyles = atomicStyleIds == null
			? [...this.store.atomicStyles.values()]
			: atomicStyleIds.map(id => this.store.atomicStyles.get(id))
					.filter(isNotNullish)
		log.debug(`Rendering ${atomicStyles.length} atomic styles (preview: ${isPreview})`)
		return renderAtomicStyles({
			atomicStyles,
			isPreview,
			isFormatted,
			defaultSelector: this.config.defaultSelector,
			layers: this.config.layers,
			defaultUtilitiesLayer: this.config.defaultUtilitiesLayer,
		})
	}

	/**
	 * Renders the CSS `@layer` order declaration for all configured layers.
	 *
	 * @returns A `@layer` statement listing layer names in weight order, or an empty string if no layers are configured.
	 *
	 * @remarks Ensures the browser applies the intended cascade priority for `preflights`, `utilities`, and any user-defined layers.
	 *
	 * @example
	 * ```ts
	 * engine.renderLayerOrderDeclaration()
	 * // '@layer preflights, utilities;'
	 * ```
	 */
	renderLayerOrderDeclaration(): string {
		const { layers } = this.config
		if (Object.keys(layers).length === 0)
			return ''
		return `@layer ${sortLayerNames(layers)
			.join(', ')};`
	}
}

/**
 * Computes a numeric rendering weight for an atomic style based on its selector depth.
 * @internal
 *
 * @param style - The atomic style to weigh.
 * @param defaultSelector - The engine's default selector pattern.
 * @returns `0` for styles using only the default selector; otherwise the number of selector segments.
 *
 * @remarks Used to sort atomic styles so that simpler selectors appear before more specific ones in the CSS output, preserving deterministic cascade ordering.
 *
 * @example
 * ```ts
 * calcAtomicStyleRenderingWeight(style, '.pk-__PLACEHOLDER__')
 * ```
 */
export function calcAtomicStyleRenderingWeight(style: AtomicStyle, defaultSelector: string) {
	const { selector } = splitLayerSelector(style.content.selector)
	const isDefaultSelector = selector.length === 1 && selector[0]! === defaultSelector
	return isDefaultSelector ? 0 : selector.length
}

/**
 * Sorts layer names by their numeric weight, then alphabetically for ties.
 *
 * @param layers - A record mapping layer names to numeric weights.
 * @returns An array of layer names in ascending weight order.
 *
 * @remarks Used to produce the `@layer` declaration order and to order layer group rendering.
 *
 * @example
 * ```ts
 * sortLayerNames({ utilities: 10, preflights: 1 })
 * // ['preflights', 'utilities']
 * ```
 */
export function sortLayerNames(layers: Record<string, number>): string[] {
	return Object.entries(layers)
		.sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
		.map(([name]) => name)
}

function appendLayerGroupItem<T>(layerGroups: Map<string, T[]>, layer: string, item: T) {
	if (!layerGroups.has(layer))
		layerGroups.set(layer, [])
	layerGroups.get(layer)!.push(item)
}

function getOrderedLayerNamesForGroups<T>(layerGroups: Map<string, T[]>, layerOrder: string[]) {
	return [
		...layerOrder.filter(name => (layerGroups.get(name)?.length ?? 0) > 0),
		...[...layerGroups.keys()].filter(name => !layerOrder.includes(name) && layerGroups.get(name)!.length > 0),
	]
}

function renderLayerBlocks<T>({
	layerGroups,
	layerOrder,
	isFormatted,
	render,
}: {
	layerGroups: Map<string, T[]>
	layerOrder: string[]
	isFormatted: boolean
	render: (items: T[]) => string
}) {
	const lineEnd = isFormatted ? '\n' : ''
	return getOrderedLayerNamesForGroups(layerGroups, layerOrder)
		.map((layerName) => {
			const items = layerGroups.get(layerName)!
			const content = isFormatted
				? render(items)
						.trim()
						.split('\n')
						.map(line => `  ${line}`)
						.join('\n')
				: render(items)
			return `@layer ${layerName} {${lineEnd}${content}${lineEnd}}`
		})
}

function normalizeCssImport(cssImport: string) {
	const normalized = cssImport.trim()
	if (normalized.length === 0)
		return null
	return normalized.endsWith(';') ? normalized : `${normalized};`
}

function groupRenderedPreflightsByLayer(rendered: { layer?: string, css: string }[]) {
	const unlayeredParts: string[] = []
	const layerGroups = new Map<string, string[]>()
	for (const { layer, css } of rendered) {
		if (layer == null) {
			unlayeredParts.push(css)
			continue
		}
		appendLayerGroupItem(layerGroups, layer, css)
	}
	return { unlayeredParts, layerGroups }
}

function splitLayerSelector(selector: string[]) {
	const [first, ...rest] = selector
	if (first == null || first.startsWith(LAYER_SELECTOR_PREFIX) === false)
		return { layer: undefined, selector }

	const layer = first.slice(LAYER_SELECTOR_PREFIX.length)
		.trim()
	if (layer.length === 0)
		return { layer: undefined, selector }

	return {
		layer,
		selector: rest,
	}
}

function prependLayerSelector(selector: string[], layer: string) {
	return [`${LAYER_SELECTOR_PREFIX}${layer}`, ...selector]
}

function groupAtomicStylesByLayer({
	styles,
	layerOrder,
	defaultUtilitiesLayer,
}: {
	styles: AtomicStyle[]
	layerOrder: string[]
	defaultUtilitiesLayer?: string
}) {
	const unlayeredStyles: AtomicStyle[] = []
	const layerGroups = new Map<string, AtomicStyle[]>(layerOrder.map(name => [name, []]))
	const candidateDefaultLayer = defaultUtilitiesLayer ?? layerOrder[layerOrder.length - 1]
	const defaultLayer = (candidateDefaultLayer != null && layerGroups.has(candidateDefaultLayer))
		? candidateDefaultLayer
		: layerOrder[layerOrder.length - 1]

	for (const style of styles) {
		const { layer } = splitLayerSelector(style.content.selector)
		if (layer != null && layerGroups.has(layer)) {
			layerGroups.get(layer)!.push(style)
			continue
		}
		if (layer != null) {
			log.warn(`Unknown layer "${layer}" encountered in atomic style; falling back to unlayered output.`)
			unlayeredStyles.push(style)
			continue
		}
		if (defaultLayer != null) {
			layerGroups.get(defaultLayer)!.push(style)
			continue
		}
		unlayeredStyles.push(style)
	}

	return { unlayeredStyles, layerGroups }
}

function isWithLayer(p: unknown): p is { layer: string, preflight: unknown } {
	if (typeof p !== 'object' || p === null)
		return false
	const record = p as { layer?: unknown, preflight?: unknown }
	return typeof record.layer === 'string' && record.preflight !== undefined
}

function isWithId(p: unknown): p is { id: string, preflight: unknown } {
	if (typeof p !== 'object' || p === null)
		return false
	const record = p as { id?: unknown, preflight?: unknown }
	return typeof record.id === 'string' && record.preflight !== undefined
}

/**
 * Normalizes a `Preflight` input into a `ResolvedPreflight` by extracting optional `layer` and `id` wrappers.
 * @internal
 *
 * @param preflight - A preflight value: a function, a static string/`PreflightDefinition`, or a wrapper with `layer`/`id` metadata.
 * @returns A `ResolvedPreflight` with separated `layer`, `id`, and `fn`.
 *
 * @remarks Handles nested wrappers: a `{ layer, preflight: { id, preflight: fn } }` shape is unwrapped in order.
 *
 * @example
 * ```ts
 * resolvePreflight({ layer: 'base', id: 'reset', preflight: '* { margin: 0 }' })
 * ```
 */
export function resolvePreflight(preflight: Preflight): ResolvedPreflight {
	let layer: string | undefined
	let id: string | undefined

	// Peel off WithLayer wrapper
	if (isWithLayer(preflight)) {
		layer = preflight.layer
		preflight = preflight.preflight as Preflight
	}

	// Peel off WithId wrapper
	if (isWithId(preflight)) {
		id = preflight.id
		preflight = preflight.preflight as Preflight
	}

	const fn: PreflightFn = typeof preflight === 'function' ? preflight : () => preflight as string | PreflightDefinition
	return { layer, id, fn }
}

/**
 * Resolves a raw `EngineConfig` into a fully normalized `ResolvedEngineConfig`.
 * @internal
 *
 * @param config - The raw engine configuration.
 * @returns A `ResolvedEngineConfig` with defaults applied, plugins sorted, preflights resolved, and autocomplete initialized.
 *
 * @remarks Merges `DEFAULT_LAYERS`, normalizes CSS imports, resolves preflight definitions, and initializes the empty autocomplete sets/maps.
 *
 * @example
 * ```ts
 * const resolved = await resolveEngineConfig({ prefix: 'pk-' })
 * ```
 */
export async function resolveEngineConfig(config: EngineConfig): Promise<ResolvedEngineConfig> {
	const {
		prefix = DEFAULT_ATOMIC_STYLE_ID_PREFIX,
		defaultSelector = `.${ATOMIC_STYLE_ID_PLACEHOLDER}`,
		plugins = [],
		cssImports = [],
		preflights = [],
	} = config
	const layers: Record<string, number> = Object.assign({}, DEFAULT_LAYERS, config.layers)
	const defaultPreflightsLayer = config.defaultPreflightsLayer ?? DEFAULT_PREFLIGHTS_LAYER
	const defaultUtilitiesLayer = config.defaultUtilitiesLayer ?? DEFAULT_UTILITIES_LAYER
	log.debug(`Resolving engine config with prefix: "${prefix}", plugins: ${plugins.length}, preflights: ${preflights.length}`)

	const resolvedConfig: ResolvedEngineConfig = {
		rawConfig: config,
		plugins: resolvePlugins(plugins),
		prefix,
		defaultSelector,
		preflights: [],
		cssImports: [...new Set(
			cssImports.map(normalizeCssImport)
				.filter(isNotNullish),
		)],
		layers,
		defaultPreflightsLayer,
		defaultUtilitiesLayer,
		autocomplete: {
			selectors: new Set(),
			shortcuts: new Set(),
			extraProperties: new Set(),
			extraCssProperties: new Set(),
			properties: new Map(),
			cssProperties: new Map(),
			patterns: {
				selectors: new Set(),
				shortcuts: new Set(),
				properties: new Map(),
				cssProperties: new Map(),
			},
		},
	}

	appendAutocomplete(resolvedConfig, config.autocomplete ?? {})

	// process preflights
	const resolvedPreflights = preflights.map(resolvePreflight)
	resolvedConfig.preflights.push(...resolvedPreflights)
	log.debug(`Engine config resolved: ${resolvedPreflights.length} preflights processed`)

	return resolvedConfig
}

function extractLayerFromStyleItem(item: InternalStyleDefinition): { layer: string | undefined, definition: InternalStyleDefinition } {
	const record = item as Record<string, unknown>
	const layer = typeof record.__layer === 'string' ? record.__layer : undefined
	if (layer == null) {
		return { layer: undefined, definition: item }
	}
	const { __layer: _, ...rest } = record
	return { layer, definition: rest as InternalStyleDefinition }
}

/**
 * Transforms and extracts a list of style items into deduplicated atomic style contents.
 * @internal
 *
 * @param options - An object containing:
 *   - `itemList` — the raw style items to process.
 *   - `transformStyleItems` — the plugin hook for transforming style items.
 *   - `extractStyleDefinition` — the function that decomposes a style definition into extracted contents.
 * @returns An object with `unknown` (unresolved string references) and `contents` (optimized extracted style contents).
 *
 * @remarks String items that survive the `transformStyleItems` hook are collected into the `unknown` set. Object items are extracted, optionally layer-prepended, and optimized for duplicate property merging.
 *
 * @example
 * ```ts
 * const { unknown, contents } = await resolveStyleItemList({ itemList, transformStyleItems, extractStyleDefinition })
 * ```
 */
export async function resolveStyleItemList({
	itemList,
	transformStyleItems,
	extractStyleDefinition,
}: {
	itemList: InternalStyleItem[]
	transformStyleItems: (styleItems: InternalStyleItem[]) => Promise<InternalStyleItem[]>
	extractStyleDefinition: (styleObj: InternalStyleDefinition) => Promise<ExtractedStyleContent[]>
}) {
	const unknown = new Set<string>()
	const list: ExtractedStyleContent[] = []
	for (const styleItem of await transformStyleItems(itemList)) {
		if (typeof styleItem === 'string') {
			unknown.add(styleItem)
		}
		else {
			const { layer, definition } = extractLayerFromStyleItem(styleItem)
			const extracted = await extractStyleDefinition(definition)
			list.push(...(layer == null
				? extracted
				: extracted.map(content => ({
						...content,
						selector: prependLayerSelector(content.selector, layer),
					}))))
		}
	}
	return {
		unknown,
		contents: optimizeAtomicStyleContents(list),
	}
}

function sortAtomicStyles(styles: AtomicStyle[], defaultSelector: string): AtomicStyle[] {
	return [...styles].sort(
		(a, b) => calcAtomicStyleRenderingWeight(a, defaultSelector) - calcAtomicStyleRenderingWeight(b, defaultSelector),
	)
}

function renderAtomicStylesCss({ atomicStyles, isPreview, isFormatted }: {
	atomicStyles: AtomicStyle[]
	isPreview: boolean
	isFormatted: boolean
}): string {
	const blocks: CSSStyleBlocks = new Map()
	atomicStyles
		.forEach(({ id, content: { selector: rawSelector, property, value } }) => {
			const { selector } = splitLayerSelector(rawSelector)
			const isValidSelector = selector.some(s => s.includes(ATOMIC_STYLE_ID_PLACEHOLDER))
			if (isValidSelector === false || value == null)
				return

			const renderObject = {
				selector: isPreview
					? selector
					: selector.map(s => s.replace(ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL, id)),
				properties: value.map(v => ({ property, value: v })),
			}

			let currentBlocks = blocks
			for (let i = 0; i < renderObject.selector.length; i++) {
				const s = renderObject.selector[i]!
				const blockBody = currentBlocks.get(s) || { properties: [] }

				const isLastSelector = i === renderObject.selector.length - 1
				if (isLastSelector)
					blockBody.properties.push(...renderObject.properties)
				else
					blockBody.children ||= new Map()

				currentBlocks.set(s, blockBody)

				if (isLastSelector === false)
					currentBlocks = blockBody.children!
			}
		})
	return renderCSSStyleBlocks(blocks, isFormatted)
}

/**
 * Standalone function that renders atomic styles into CSS with layer grouping.
 * @internal
 *
 * @param payload - An object containing `atomicStyles`, `isPreview`, `isFormatted`, `defaultSelector`, and optional `layers`/`defaultUtilitiesLayer`.
 * @returns The rendered CSS string.
 *
 * @remarks Sorts styles by rendering weight, groups them into `@layer` blocks when layers are configured, and renders each group. Used by both the `Engine.renderAtomicStyles` method and external consumers.
 *
 * @example
 * ```ts
 * const css = renderAtomicStyles({ atomicStyles, isPreview: false, isFormatted: true, defaultSelector: '.pk-__ID__', layers: { utilities: 10 } })
 * ```
 */
export function renderAtomicStyles(payload: { atomicStyles: AtomicStyle[], isPreview: boolean, isFormatted: boolean, defaultSelector: string, layers?: Record<string, number>, defaultUtilitiesLayer?: string }): string {
	const { atomicStyles, isPreview, isFormatted, defaultSelector, layers, defaultUtilitiesLayer } = payload

	// Sort once up-front so each sub-render receives styles in correct order.
	const sortedStyles = sortAtomicStyles(atomicStyles, defaultSelector)

	if (layers == null) {
		return renderAtomicStylesCss({ atomicStyles: sortedStyles, isPreview, isFormatted })
	}

	const layerOrder = sortLayerNames(layers)
	const lineEnd = isFormatted ? '\n' : ''
	const { unlayeredStyles, layerGroups } = groupAtomicStylesByLayer({
		styles: sortedStyles,
		layerOrder,
		defaultUtilitiesLayer,
	})

	const parts: string[] = []

	if (unlayeredStyles.length > 0)
		parts.push(renderAtomicStylesCss({ atomicStyles: unlayeredStyles, isPreview, isFormatted }))

	parts.push(...renderLayerBlocks({
		layerGroups,
		layerOrder,
		isFormatted,
		render: styles => renderAtomicStylesCss({ atomicStyles: styles, isPreview, isFormatted }),
	}))

	return parts.join(lineEnd)
}

/**
 * Recursively converts a `PreflightDefinition` object tree into CSS style blocks.
 * @internal
 *
 * @param options - An object containing:
 *   - `engine` — the engine instance (used for selector transformation).
 *   - `preflightDefinition` — the nested object tree of selectors and CSS properties.
 *   - `blocks` — accumulator map for the resulting CSS blocks.
 * @returns The accumulated `CSSStyleBlocks` map.
 *
 * @remarks Each key in the definition is either a CSS property (when its value is a property value) or a nested selector scope (when its value is an object). Selector keys are expanded through `hooks.transformSelectors`. The resulting blocks map is consumable by `renderCSSStyleBlocks`.
 *
 * @example
 * ```ts
 * const blocks = await _renderPreflightDefinition({ engine, preflightDefinition: { ':root': { '--color': 'red' } } })
 * ```
 */
export async function _renderPreflightDefinition({
	engine,
	preflightDefinition,
	blocks = new Map(),
}: {
	engine: Engine
	preflightDefinition: PreflightDefinition
	blocks?: CSSStyleBlocks
}) {
	for (const [selector, propertiesOrDefinition] of Object.entries(preflightDefinition)) {
		if (propertiesOrDefinition == null)
			continue

		const selectors = normalizeSelectors({
			selectors: await hooks.transformSelectors(engine.config.plugins, [selector]),
			defaultSelector: '',
		})
			.filter(Boolean)
		if (selectors.length === 0)
			continue
		let currentBlocks = blocks
		let currentBlockBody: CSSStyleBlockBody = null!
		selectors.forEach((s, i) => {
			const isLast = i === selectors.length - 1
			currentBlocks.set(s, currentBlocks.get(s) || { properties: [] })
			if (isLast) {
				currentBlockBody = currentBlocks.get(s)!
				return
			}
			currentBlocks = currentBlocks.get(s)!.children ||= new Map()
		})

		for (const [k, v] of Object.entries(propertiesOrDefinition)) {
			if (isPropertyValue(v)) {
				const property = toKebab(k)
				const normalizedValue = normalizeValue(v)
				if (normalizedValue != null) {
					normalizedValue.forEach(value => currentBlockBody.properties.push({ property, value }))
				}
			}
			else {
				currentBlockBody.children ||= new Map()
				currentBlockBody.children.set(k, currentBlockBody.children.get(k) || { properties: [] })
				await _renderPreflightDefinition({
					engine,
					preflightDefinition: { [k]: v } as PreflightDefinition,
					blocks: currentBlockBody.children,
				})
			}
		}
	}
	return blocks
}

/**
 * Renders a `PreflightDefinition` into a CSS string via the engine's selector pipeline.
 * @internal
 *
 * @param payload - An object with the `engine`, the `preflightDefinition` to render, and `isFormatted` flag.
 * @returns The rendered CSS string.
 *
 * @remarks A convenience wrapper that calls `_renderPreflightDefinition` and pipes the result through `renderCSSStyleBlocks`.
 *
 * @example
 * ```ts
 * const css = await renderPreflightDefinition({ engine, preflightDefinition: { ':root': { color: 'red' } }, isFormatted: true })
 * ```
 */
export async function renderPreflightDefinition(payload: {
	engine: Engine
	preflightDefinition: PreflightDefinition
	isFormatted: boolean
}): Promise<string> {
	const { engine, preflightDefinition, isFormatted } = payload
	const blocks = await _renderPreflightDefinition({
		engine,
		preflightDefinition,
	})
	return renderCSSStyleBlocks(blocks, isFormatted)
}
