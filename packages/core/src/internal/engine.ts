import type { ExtractFn } from './extractor'
import type { AtomicStyle, CSSStyleBlockBody, CSSStyleBlocks, EngineConfig, ExtractedStyleContent, InternalStyleDefinition, InternalStyleItem, Preflight, PreflightDefinition, PreflightFn, ResolvedEngineConfig, ResolvedPreflight, StyleContent } from './types'
import { ATOMIC_STYLE_ID_PLACEHOLDER, ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL, DEFAULT_ATOMIC_STYLE_ID_PREFIX } from './constants'
import { createExtractFn, normalizeSelectors, normalizeValue } from './extractor'
import { hooks, resolvePlugins } from './plugin'
import { important } from './plugins/important'
import { keyframes } from './plugins/keyframes'
import { selectors } from './plugins/selectors'
import { shortcuts } from './plugins/shortcuts'
import { variables } from './plugins/variables'
import { appendAutocompleteCssPropertyValues, appendAutocompleteExtraCssProperties, appendAutocompleteExtraProperties,	appendAutocompletePropertyValues,	appendAutocompleteSelectors,	appendAutocompleteStyleItemStrings,	isNotNullish,	isPropertyValue,	log,	numberToChars,	renderCSSStyleBlocks,	serialize, toKebab } from './utils'

export const DEFAULT_PREFLIGHTS_LAYER = 'preflights'
export const DEFAULT_UTILITIES_LAYER = 'utilities'
export const DEFAULT_LAYERS: Record<string, number> = { [DEFAULT_PREFLIGHTS_LAYER]: 1, [DEFAULT_UTILITIES_LAYER]: 10 }

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
		resolvePlugins(config.plugins ?? []),
		config,
	)

	let resolvedConfig = await resolveEngineConfig(config)
	log.debug('Engine config resolved with prefix:', resolvedConfig.prefix)

	resolvedConfig = await hooks.configureResolvedConfig(
		resolvedConfig.plugins,
		resolvedConfig,
	)

	let engine = new Engine(resolvedConfig)

	engine.appendAutocompleteExtraProperties('__layer')
	engine.appendAutocompletePropertyValues('__layer', 'Autocomplete[\'Layer\']')

	log.debug('Engine instance created')
	engine = await hooks.configureEngine(
		engine.config.plugins,
		engine,
	)
	log.debug('Engine initialized successfully')

	return engine
}

export class Engine {
	config: ResolvedEngineConfig
	pluginHooks = hooks

	extract: ExtractFn

	store = {
		atomicStyleIds: new Map<string, string>(),
		atomicStyles: new Map<string, AtomicStyle>(),
	}

	constructor(config: ResolvedEngineConfig) {
		this.config = config

		this.extract = createExtractFn({
			defaultSelector: this.config.defaultSelector,
			transformSelectors: selectors => hooks.transformSelectors(this.config.plugins, selectors),
			transformStyleItems: styleItems => hooks.transformStyleItems(this.config.plugins, styleItems),
			transformStyleDefinitions: styleDefinitions => hooks.transformStyleDefinitions(this.config.plugins, styleDefinitions),
		})
	}

	notifyPreflightUpdated() {
		hooks.preflightUpdated(this.config.plugins)
	}

	notifyAtomicStyleAdded(atomicStyle: AtomicStyle) {
		hooks.atomicStyleAdded(this.config.plugins, atomicStyle)
	}

	notifyAutocompleteConfigUpdated() {
		hooks.autocompleteConfigUpdated(this.config.plugins)
	}

	appendAutocompleteSelectors(...selectors: string[]) {
		appendAutocompleteSelectors(this.config, ...selectors)
		this.notifyAutocompleteConfigUpdated()
	}

	appendAutocompleteStyleItemStrings(...styleItemStrings: string[]) {
		appendAutocompleteStyleItemStrings(this.config, ...styleItemStrings)
		this.notifyAutocompleteConfigUpdated()
	}

	appendAutocompleteExtraProperties(...properties: string[]) {
		appendAutocompleteExtraProperties(this.config, ...properties)
		this.notifyAutocompleteConfigUpdated()
	}

	appendAutocompleteExtraCssProperties(...properties: string[]) {
		appendAutocompleteExtraCssProperties(this.config, ...properties)
		this.notifyAutocompleteConfigUpdated()
	}

	appendAutocompletePropertyValues(property: string, ...tsTypes: string[]) {
		appendAutocompletePropertyValues(this.config, property, ...tsTypes)
		this.notifyAutocompleteConfigUpdated()
	}

	appendAutocompleteCssPropertyValues(property: string, ...values: string[]) {
		appendAutocompleteCssPropertyValues(this.config, property, ...values)
		this.notifyAutocompleteConfigUpdated()
	}

	addPreflight(preflight: Preflight) {
		log.debug('Adding preflight')
		this.config.preflights.push(resolvePreflight(preflight))
		log.debug(`Total preflights: ${this.config.preflights.length}`)
		this.notifyPreflightUpdated()
	}

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
		contents.forEach((content) => {
			const id = getAtomicStyleId({
				content,
				prefix: this.config.prefix,
				stored: this.store.atomicStyleIds,
			})
			resolvedIds.push(id)
			if (!this.store.atomicStyles.has(id)) {
				const atomicStyle: AtomicStyle = { id, content }
				this.store.atomicStyles.set(id, atomicStyle)
				log.debug(`Atomic style added: ${id}`)
				this.notifyAtomicStyleAdded(atomicStyle)
			}
		})
		log.debug(`Resolved ${resolvedIds.length} atomic styles, ${unknown.size} unknown items`)
		return [...unknown, ...resolvedIds]
	}

	async renderPreflights(isFormatted: boolean) {
		log.debug('Rendering preflights...')
		const lineEnd = isFormatted ? '\n' : ''

		const rendered: { layer?: string, css: string }[] = await Promise.all(
			this.config.preflights.map(async ({ layer, fn }) => {
				const result = await fn(this, isFormatted)
				const css = typeof result === 'string'
					? result
					: await renderPreflightDefinition({ engine: this, preflightDefinition: result, isFormatted })
				return { layer, css }
			}),
		)
		log.debug(`Rendered ${rendered.length} preflights`)

		const unlayeredParts: string[] = []
		const layerGroups = new Map<string, string[]>()
		for (const { layer, css } of rendered) {
			if (layer == null) {
				unlayeredParts.push(css)
			}
			else {
				if (!layerGroups.has(layer))
					layerGroups.set(layer, [])
				layerGroups.get(layer)!.push(css)
			}
		}

		const outputParts: string[] = []
		if (unlayeredParts.length > 0) {
			const unlayeredContent = unlayeredParts.join(lineEnd)
			const { defaultPreflightsLayer } = this.config
			// Unlayered preflights are automatically wrapped inside the defaultPreflightsLayer
			// when that layer name exists in the configured layers.
			if (defaultPreflightsLayer in this.config.layers)
				outputParts.push(`@layer ${defaultPreflightsLayer} {${lineEnd}${unlayeredContent}${lineEnd}}`)
			else
				outputParts.push(unlayeredContent)
		}
		const configLayerOrder = sortLayerNames(this.config.layers)
		const orderedLayerNames = [
			...configLayerOrder.filter(name => layerGroups.has(name)),
			...[...layerGroups.keys()].filter(name => !configLayerOrder.includes(name)),
		]
		for (const layerName of orderedLayerNames) {
			const cssList = layerGroups.get(layerName)!
			const content = cssList.join(lineEnd)
			outputParts.push(`@layer ${layerName} {${lineEnd}${content}${lineEnd}}`)
		}
		return outputParts.join(lineEnd)
	}

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

	renderLayerOrderDeclaration(): string {
		const { layers } = this.config
		if (Object.keys(layers).length === 0)
			return ''
		return `@layer ${sortLayerNames(layers)
			.join(', ')};`
	}
}

export function calcAtomicStyleRenderingWeight(style: AtomicStyle, defaultSelector: string) {
	const { selector } = style.content
	const isDefaultSelector = selector.length === 1 && selector[0]! === defaultSelector
	return isDefaultSelector ? 0 : selector.length
}

export function sortLayerNames(layers: Record<string, number>): string[] {
	return Object.entries(layers)
		.sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))
		.map(([name]) => name)
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

export async function resolveEngineConfig(config: EngineConfig): Promise<ResolvedEngineConfig> {
	const {
		prefix = DEFAULT_ATOMIC_STYLE_ID_PREFIX,
		defaultSelector = `.${ATOMIC_STYLE_ID_PLACEHOLDER}`,
		plugins = [],
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
		layers,
		defaultPreflightsLayer,
		defaultUtilitiesLayer,
		autocomplete: {
			selectors: new Set(),
			styleItemStrings: new Set(),
			extraProperties: new Set(),
			extraCssProperties: new Set(),
			properties: new Map(),
			cssProperties: new Map(),
		},
	}

	// process preflights
	const resolvedPreflights = preflights.map(resolvePreflight)
	resolvedConfig.preflights.push(...resolvedPreflights)
	log.debug(`Engine config resolved: ${resolvedPreflights.length} preflights processed`)

	return resolvedConfig
}

export function getAtomicStyleId({
	content,
	prefix,
	stored,
}: {
	content: StyleContent
	prefix: string
	stored: Map<string, string>
}) {
	const key = serialize([content.selector, content.property, content.value, content.layer])
	const cached = stored.get(key)
	if (cached != null) {
		log.debug(`Atomic style cached: ${cached}`)
		return cached
	}

	const num = stored.size
	const id = `${prefix}${numberToChars(num)}`
	stored.set(key, id)
	log.debug(`Generated new atomic style ID: ${id}`)
	return id
}

export function optimizeAtomicStyleContents(list: ExtractedStyleContent[]) {
	const map = new Map<string, StyleContent>()
	list.forEach((content) => {
		const key = serialize([content.selector, content.property, content.layer])

		map.delete(key)

		if (content.value == null)
			return

		map.set(key, { ...content } as StyleContent)
	})
	return [...map.values()]
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
			if (layer != null) {
				extracted.forEach(c => (c.layer = layer))
			}
			list.push(...extracted)
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
		.forEach(({ id, content: { selector, property, value } }) => {
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

export function renderAtomicStyles(payload: { atomicStyles: AtomicStyle[], isPreview: boolean, isFormatted: boolean, defaultSelector: string, layers?: Record<string, number>, defaultUtilitiesLayer?: string }): string {
	const { atomicStyles, isPreview, isFormatted, defaultSelector, layers, defaultUtilitiesLayer } = payload

	// Sort once up-front so each sub-render receives styles in correct order.
	const sortedStyles = sortAtomicStyles(atomicStyles, defaultSelector)

	if (layers == null) {
		return renderAtomicStylesCss({ atomicStyles: sortedStyles, isPreview, isFormatted })
	}

	const layerOrder = sortLayerNames(layers)
	const lineEnd = isFormatted ? '\n' : ''

	const unlayeredStyles: AtomicStyle[] = []
	const layerGroups = new Map<string, AtomicStyle[]>(layerOrder.map(name => [name, []]))
	const candidateDefaultLayer = defaultUtilitiesLayer ?? layerOrder[layerOrder.length - 1]
	const defaultLayer = (candidateDefaultLayer != null && layerGroups.has(candidateDefaultLayer))
		? candidateDefaultLayer
		: layerOrder[layerOrder.length - 1]

	for (const style of sortedStyles) {
		const layer = style.content.layer
		if (layer != null && layerGroups.has(layer)) {
			layerGroups.get(layer)!.push(style)
		}
		else if (layer != null) {
			log.warn(`Unknown layer "${layer}" encountered in atomic style; falling back to unlayered output.`)
			unlayeredStyles.push(style)
		}
		else if (defaultLayer != null) {
			layerGroups.get(defaultLayer)!.push(style)
		}
		else {
			unlayeredStyles.push(style)
		}
	}

	const parts: string[] = []

	if (unlayeredStyles.length > 0)
		parts.push(renderAtomicStylesCss({ atomicStyles: unlayeredStyles, isPreview, isFormatted }))

	for (const layerName of layerOrder) {
		const styles = layerGroups.get(layerName)!
		if (styles.length === 0)
			continue
		const innerCss = renderAtomicStylesCss({ atomicStyles: styles, isPreview, isFormatted })
		parts.push(`@layer ${layerName} {${lineEnd}${innerCss}${lineEnd}}`)
	}

	return parts.join(lineEnd)
}

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
