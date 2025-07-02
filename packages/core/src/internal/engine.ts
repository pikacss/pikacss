import type { AtomicStyle, CSSStyleBlockBody, CSSStyleBlocks, EngineConfig, ExtractedStyleContent, Preflight, PreflightDefinition, PreflightFn, ResolvedEngineConfig, StyleContent, StyleDefinition, StyleItem } from './types'
import { ATOMIC_STYLE_ID_PLACEHOLDER, ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL } from './constants'
import { createExtractFn, type ExtractFn, normalizeSelectors, normalizeValue } from './extractor'
import { hooks, resolvePlugins } from './plugin'
import { important } from './plugins/important'
import { keyframes } from './plugins/keyframes'
import { selectors } from './plugins/selectors'
import { shortcuts } from './plugins/shortcuts'
import { variables } from './plugins/variables'
import { appendAutocompleteCssPropertyValues, appendAutocompleteExtraCssProperties, appendAutocompleteExtraProperties,	appendAutocompletePropertyValues,	appendAutocompleteSelectors,	appendAutocompleteStyleItemStrings,	isNotNullish,	isPropertyValue,	numberToChars,	renderCSSStyleBlocks,	serialize, toKebab } from './utils'

// Only for type inference without runtime effect
/* c8 ignore start */
export function defineEngineConfig(config: EngineConfig): EngineConfig {
	return config as any
}
/* c8 ignore end */

export async function createEngine(config: EngineConfig = {}): Promise<Engine> {
	const corePlugins = [
		important(),
		variables(),
		keyframes(),
		selectors(),
		shortcuts(),
	]
	const plugins = resolvePlugins([...corePlugins, ...(config.plugins || [])])
	config.plugins = plugins

	config = await hooks.configureRawConfig(
		config.plugins,
		config,
	)

	hooks.rawConfigConfigured(
		resolvePlugins(config.plugins || []),
		config,
	)

	let resolvedConfig = await resolveEngineConfig(config)

	resolvedConfig = await hooks.configureResolvedConfig(
		resolvedConfig.plugins,
		resolvedConfig,
	)

	let engine = new Engine(resolvedConfig)
	engine = await hooks.configureEngine(
		engine.config.plugins,
		engine,
	)

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

	appendAutocompleteCssPropertyValues(property: string, ...values: (string | number)[]) {
		appendAutocompleteCssPropertyValues(this.config, property, ...values)
		this.notifyAutocompleteConfigUpdated()
	}

	addPreflight(preflight: Preflight) {
		this.config.preflights.push(resolvePreflight(preflight))
		this.notifyPreflightUpdated()
	}

	async use(...itemList: StyleItem[]): Promise<string[]> {
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
				this.notifyAtomicStyleAdded(atomicStyle)
			}
		})
		return [...unknown, ...resolvedIds]
	}

	async renderPreflights(isFormatted: boolean) {
		const lineEnd = isFormatted ? '\n' : ''
		return (await Promise.all(this.config.preflights.map(async (p) => {
			const result = await p(this, isFormatted)
			if (typeof result === 'string')
				return result

			return renderPreflightDefinition({
				engine: this,
				preflightDefinition: result,
				isFormatted,
			})
		}))).join(lineEnd)
	}

	async renderAtomicStyles(isFormatted: boolean, options: { atomicStyleIds?: string[], isPreview?: boolean } = {}) {
		const { atomicStyleIds = null, isPreview = false } = options

		const atomicStyles = atomicStyleIds == null ? [...this.store.atomicStyles.values()] : atomicStyleIds.map(id => this.store.atomicStyles.get(id)).filter(isNotNullish)
		return renderAtomicStyles({
			atomicStyles,
			isPreview,
			isFormatted,
			defaultSelector: this.config.defaultSelector,
		})
	}
}

export function calcAtomicStyleRenderingWeight(style: AtomicStyle, defaultSelector: string) {
	const { selector } = style.content
	const isDefaultSelector = selector.length === 1 && selector[0]! === defaultSelector
	return isDefaultSelector ? 0 : selector.length
}

export function resolvePreflight(preflight: Preflight): PreflightFn {
	return typeof preflight === 'function' ? preflight : () => preflight
}

export async function resolveEngineConfig(config: EngineConfig): Promise<ResolvedEngineConfig> {
	const {
		prefix = '',
		defaultSelector = `.${ATOMIC_STYLE_ID_PLACEHOLDER}`,
		plugins = [],
		preflights = [],
	} = config

	const resolvedConfig: ResolvedEngineConfig = {
		rawConfig: config,
		plugins: resolvePlugins(plugins),
		prefix,
		defaultSelector,
		preflights: [],
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
	const key = serialize([content.selector, content.property, content.value])
	const cached = stored.get(key)
	if (cached != null)
		return cached

	const num = stored.size
	const id = `${prefix}${numberToChars(num)}`
	stored.set(key, id)
	return id
}

export function optimizeAtomicStyleContents(list: ExtractedStyleContent[]) {
	const map = new Map<string, StyleContent>()
	list.forEach((content) => {
		const key = serialize([content.selector, content.property])

		map.delete(key)

		if (content.value == null)
			return

		map.set(key, content as StyleContent)
	})
	return [...map.values()]
}

export async function resolveStyleItemList({
	itemList,
	transformStyleItems,
	extractStyleDefinition,
}: {
	itemList: StyleItem[]
	transformStyleItems: (styleItems: StyleItem[]) => Promise<StyleItem[]>
	extractStyleDefinition: (styleObj: StyleDefinition) => Promise<ExtractedStyleContent[]>
}) {
	const unknown = new Set<string>()
	const list: ExtractedStyleContent[] = []
	for (const styleItem of await transformStyleItems(itemList)) {
		if (typeof styleItem === 'string')
			unknown.add(styleItem)
		else
			list.push(...await extractStyleDefinition(styleItem))
	}
	return {
		unknown,
		contents: optimizeAtomicStyleContents(list),
	}
}

export function renderAtomicStyles(payload: { atomicStyles: AtomicStyle[], isPreview: boolean, isFormatted: boolean, defaultSelector: string }) {
	const { atomicStyles, isPreview, isFormatted, defaultSelector } = payload
	const blocks: CSSStyleBlocks = new Map()
	Array.from(atomicStyles)
		// sort by selector:
		// 1. default selector first
		// 2. then by selector levels
		.sort((a, b) => {
			const weightA = calcAtomicStyleRenderingWeight(a, defaultSelector)
			const weightB = calcAtomicStyleRenderingWeight(b, defaultSelector)
			return weightA - weightB
		})
		.forEach(({ id, content: { selector, property, value } }) => {
			const isValidSelector = selector.some(s => s.includes(ATOMIC_STYLE_ID_PLACEHOLDER))
			if (isValidSelector === false || value == null)
				return

			const renderObject = {
				selector: isPreview
				// keep the placeholder
					? selector
				// replace the placeholder with the real id
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
		}).filter(Boolean)
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
