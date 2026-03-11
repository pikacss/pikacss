/* eslint-disable no-template-curly-in-string */
import type { AtomicStyle, ExtractedStyleContent, InternalStyleItem } from './types'
import { describe, expect, it, vi } from 'vitest'
import { ATOMIC_STYLE_ID_PLACEHOLDER, DEFAULT_ATOMIC_STYLE_ID_PREFIX } from './constants'
import {
	calcAtomicStyleRenderingWeight,
	createEngine,
	DEFAULT_LAYERS,
	DEFAULT_PREFLIGHTS_LAYER,
	DEFAULT_UTILITIES_LAYER,
	Engine,
	renderAtomicStyles,
	resolveEngineConfig,
	resolvePreflight,
	resolveStyleItemList,
	sortLayerNames,
} from './engine'

function withLayerSelector(layer: string, ...selector: string[]) {
	return [`@layer ${layer}`, ...selector]
}

// ─── sortLayerNames ──────────────────────────────────────────────────────────────────────

describe('sortLayerNames', () => {
	it('should return layer names sorted by their order number ascending', () => {
		expect(sortLayerNames({ utilities: 2, base: 0, components: 1 }))
			.toEqual(['base', 'components', 'utilities'])
	})

	it('should return a single layer name as a one-element array', () => {
		expect(sortLayerNames({ components: 0 }))
			.toEqual(['components'])
	})

	it('should return an empty array for an empty layers object', () => {
		expect(sortLayerNames({}))
			.toEqual([])
	})

	it('should sort alphabetically when order values are equal', () => {
		const result = sortLayerNames({ a: 0, b: 0, c: 0 })
		expect(result)
			.toEqual(['a', 'b', 'c'])
	})

	it('should sort alphabetically as tiebreaker for equal order values (reverse insertion)', () => {
		const result = sortLayerNames({ z: 0, m: 0, a: 0 })
		expect(result)
			.toEqual(['a', 'm', 'z'])
	})
})

// ─── calcAtomicStyleRenderingWeight ──────────────────────────────────────────

describe('calcAtomicStyleRenderingWeight', () => {
	const defaultSelector = `.${ATOMIC_STYLE_ID_PLACEHOLDER}`

	it('should return 0 for default selector', () => {
		const style: AtomicStyle = {
			id: 'a',
			content: { selector: [defaultSelector], property: 'color', value: ['red'] },
		}
		expect(calcAtomicStyleRenderingWeight(style, defaultSelector))
			.toBe(0)
	})

	it('should ignore encoded layer selector when computing default selector weight', () => {
		const style: AtomicStyle = {
			id: 'a',
			content: { selector: withLayerSelector('components', defaultSelector), property: 'color', value: ['red'] },
		}
		expect(calcAtomicStyleRenderingWeight(style, defaultSelector))
			.toBe(0)
	})

	it('should return selector.length for non-default selector', () => {
		const style: AtomicStyle = {
			id: 'a',
			content: { selector: ['&:hover', `.${ATOMIC_STYLE_ID_PLACEHOLDER}`], property: 'color', value: ['red'] },
		}
		expect(calcAtomicStyleRenderingWeight(style, defaultSelector))
			.toBe(2)
	})

	it('should return selector.length when selector has single non-default entry', () => {
		const style: AtomicStyle = {
			id: 'a',
			content: { selector: ['&:hover'], property: 'color', value: ['red'] },
		}
		expect(calcAtomicStyleRenderingWeight(style, defaultSelector))
			.toBe(1)
	})

	it('should return selector.length for multiple selectors', () => {
		const style: AtomicStyle = {
			id: 'a',
			content: { selector: ['@media (min-width:768px)', `.${ATOMIC_STYLE_ID_PLACEHOLDER}`], property: 'display', value: ['flex'] },
		}
		expect(calcAtomicStyleRenderingWeight(style, defaultSelector))
			.toBe(2)
	})

	it('should return 0 only when selector is exactly [defaultSelector]', () => {
		// Two entries that happen to contain defaultSelector → not the default case
		const style: AtomicStyle = {
			id: 'a',
			content: { selector: [defaultSelector, defaultSelector], property: 'color', value: ['red'] },
		}
		expect(calcAtomicStyleRenderingWeight(style, defaultSelector))
			.toBe(2)
	})
})

// ─── resolvePreflight ────────────────────────────────────────────────────────

describe('resolvePreflight', () => {
	it('should wrap a function in ResolvedPreflight with fn pointing to it', () => {
		const fn = () => 'body { margin: 0; }'
		const resolved = resolvePreflight(fn)
		expect(resolved.fn)
			.toBe(fn)
		expect(resolved.layer)
			.toBeUndefined()
	})

	it('should wrap a string in a ResolvedPreflight.fn that returns the string', async () => {
		const resolved = resolvePreflight('body { margin: 0; }')
		expect(typeof resolved.fn)
			.toBe('function')
		expect(await resolved.fn(null as unknown as Engine, false))
			.toBe('body { margin: 0; }')
		expect(resolved.layer)
			.toBeUndefined()
	})

	it('should wrap a PreflightDefinition in a ResolvedPreflight.fn that returns it', async () => {
		const def = { body: { margin: '0' } }
		const resolved = resolvePreflight(def)
		expect(typeof resolved.fn)
			.toBe('function')
		expect(await resolved.fn(null as unknown as Engine, false))
			.toEqual(def)
		expect(resolved.layer)
			.toBeUndefined()
	})

	it('should extract layer and fn from WithLayer<string>', async () => {
		const resolved = resolvePreflight({ layer: 'base', preflight: 'body { margin: 0; }' })
		expect(resolved.layer)
			.toBe('base')
		expect(await resolved.fn(null as unknown as Engine, false))
			.toBe('body { margin: 0; }')
	})

	it('should extract layer and fn from WithLayer<PreflightFn>', () => {
		const fn = () => 'body { margin: 0; }'
		const resolved = resolvePreflight({ layer: 'base', preflight: fn })
		expect(resolved.layer)
			.toBe('base')
		expect(resolved.fn)
			.toBe(fn)
	})

	it('should extract id from WithId<string>', async () => {
		const resolved = resolvePreflight({ id: 'my-preflight', preflight: 'body { margin: 0; }' })
		expect(resolved.id)
			.toBe('my-preflight')
		expect(resolved.layer)
			.toBeUndefined()
		expect(await resolved.fn(null as unknown as Engine, false))
			.toBe('body { margin: 0; }')
	})

	it('should extract id from WithId<PreflightFn>', () => {
		const fn = () => 'body { margin: 0; }'
		const resolved = resolvePreflight({ id: 'my-preflight', preflight: fn })
		expect(resolved.id)
			.toBe('my-preflight')
		expect(resolved.fn)
			.toBe(fn)
	})

	it('should extract both layer and id from WithLayer<WithId<string>>', async () => {
		const resolved = resolvePreflight({
			layer: 'base',
			preflight: { id: 'my-preflight', preflight: 'body { margin: 0; }' },
		})
		expect(resolved.layer)
			.toBe('base')
		expect(resolved.id)
			.toBe('my-preflight')
		expect(await resolved.fn(null as unknown as Engine, false))
			.toBe('body { margin: 0; }')
	})

	it('should have undefined id when no WithId wrapper is used', () => {
		const resolved = resolvePreflight('body { margin: 0; }')
		expect(resolved.id)
			.toBeUndefined()
	})
})

// ─── resolveEngineConfig ─────────────────────────────────────────────────────

describe('resolveEngineConfig', () => {
	it('should apply default values when no config is provided', async () => {
		const resolved = await resolveEngineConfig({})
		expect(resolved.prefix)
			.toBe(DEFAULT_ATOMIC_STYLE_ID_PREFIX)
		expect(resolved.defaultSelector)
			.toBe(`.${ATOMIC_STYLE_ID_PLACEHOLDER}`)
		expect(resolved.plugins)
			.toEqual([])
		expect(resolved.preflights)
			.toEqual([])
	})

	it('should preserve custom prefix', async () => {
		const resolved = await resolveEngineConfig({ prefix: 'pk-' })
		expect(resolved.prefix)
			.toBe('pk-')
	})

	it('should preserve custom defaultSelector', async () => {
		const resolved = await resolveEngineConfig({ defaultSelector: '[data-pika~="%"]' })
		expect(resolved.defaultSelector)
			.toBe('[data-pika~="%"]')
	})

	it('should resolve preflights into ResolvedPreflight objects', async () => {
		const resolved = await resolveEngineConfig({
			preflights: ['body { margin: 0; }'],
		})
		expect(resolved.preflights)
			.toHaveLength(1)
		expect(typeof resolved.preflights[0]!.fn)
			.toBe('function')
		expect(await resolved.preflights[0]!.fn(null as unknown as Engine, false))
			.toBe('body { margin: 0; }')
	})

	it('should initialise autocomplete with empty collections', async () => {
		const resolved = await resolveEngineConfig({})
		expect(resolved.autocomplete.selectors)
			.toBeInstanceOf(Set)
		expect(resolved.autocomplete.selectors.size)
			.toBe(0)
		expect(resolved.autocomplete.styleItemStrings)
			.toBeInstanceOf(Set)
		expect(resolved.autocomplete.styleItemStrings.size)
			.toBe(0)
		expect(resolved.autocomplete.extraProperties)
			.toBeInstanceOf(Set)
		expect(resolved.autocomplete.extraCssProperties)
			.toBeInstanceOf(Set)
		expect(resolved.autocomplete.properties)
			.toBeInstanceOf(Map)
		expect(resolved.autocomplete.cssProperties)
			.toBeInstanceOf(Map)
		expect(resolved.autocomplete.patterns.selectors)
			.toBeInstanceOf(Set)
		expect(resolved.autocomplete.patterns.styleItemStrings)
			.toBeInstanceOf(Set)
		expect(resolved.autocomplete.patterns.properties)
			.toBeInstanceOf(Map)
		expect(resolved.autocomplete.patterns.cssProperties)
			.toBeInstanceOf(Map)
	})

	it('should store rawConfig reference', async () => {
		const config = { prefix: 'x-' }
		const resolved = await resolveEngineConfig(config)
		expect(resolved.rawConfig)
			.toBe(config)
	})

	it('should handle multiple preflights', async () => {
		const fn = () => 'a'
		const resolved = await resolveEngineConfig({
			preflights: ['body{}', fn, { html: { boxSizing: 'border-box' } }],
		})
		expect(resolved.preflights)
			.toHaveLength(3)
		expect(resolved.preflights[1]!.fn)
			.toBe(fn)
	})
})

// ─── resolveStyleItemList ────────────────────────────────────────────────────

describe('resolveStyleItemList', () => {
	it('should put string items into the unknown set', async () => {
		const result = await resolveStyleItemList({
			itemList: ['unknown-class', 'another-class'],
			transformStyleItems: async items => items,
			extractStyleDefinition: async () => [],
		})
		expect(result.unknown)
			.toBeInstanceOf(Set)
		expect(result.unknown.has('unknown-class'))
			.toBe(true)
		expect(result.unknown.has('another-class'))
			.toBe(true)
		expect(result.contents)
			.toEqual([])
	})

	it('should extract object items via extractStyleDefinition', async () => {
		const extracted: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'color', value: ['red'] },
		]
		const result = await resolveStyleItemList({
			itemList: [{ color: 'red' }],
			transformStyleItems: async items => items,
			extractStyleDefinition: async () => extracted,
		})
		expect(result.unknown.size)
			.toBe(0)
		expect(result.contents)
			.toHaveLength(1)
		expect(result.contents[0]!.property)
			.toBe('color')
	})

	it('should handle mixed string and object items', async () => {
		const extracted: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'display', value: ['flex'] },
		]
		const result = await resolveStyleItemList({
			itemList: ['my-class', { display: 'flex' }],
			transformStyleItems: async items => items,
			extractStyleDefinition: async () => extracted,
		})
		expect(result.unknown.has('my-class'))
			.toBe(true)
		expect(result.contents)
			.toHaveLength(1)
	})

	it('should deduplicate string items', async () => {
		const result = await resolveStyleItemList({
			itemList: ['dup', 'dup', 'dup'],
			transformStyleItems: async items => items,
			extractStyleDefinition: async () => [],
		})
		expect(result.unknown.size)
			.toBe(1)
	})

	it('should apply transformStyleItems before processing', async () => {
		const transform = vi.fn(async (items: InternalStyleItem[]) => items.filter(i => typeof i !== 'string'))
		const result = await resolveStyleItemList({
			itemList: ['removed', { color: 'red' }],
			transformStyleItems: transform,
			extractStyleDefinition: async () => [
				{ selector: ['.%'], property: 'color', value: ['red'] },
			],
		})
		expect(transform)
			.toHaveBeenCalled()
		expect(result.unknown.size)
			.toBe(0)
		expect(result.contents)
			.toHaveLength(1)
	})

	it('should optimise extracted contents (later overrides earlier)', async () => {
		let callCount = 0
		const result = await resolveStyleItemList({
			itemList: [{ color: 'red' }, { color: 'blue' }],
			transformStyleItems: async items => items,
			extractStyleDefinition: async () => {
				callCount++
				if (callCount === 1)
					return [{ selector: ['.%'], property: 'color', value: ['red'] }]
				return [{ selector: ['.%'], property: 'color', value: ['blue'] }]
			},
		})
		// optimizeAtomicStyleContents should merge them
		expect(result.contents)
			.toHaveLength(1)
		expect(result.contents[0]!.value)
			.toEqual(['blue'])
	})

	it('should handle empty itemList', async () => {
		const result = await resolveStyleItemList({
			itemList: [],
			transformStyleItems: async items => items,
			extractStyleDefinition: async () => [],
		})
		expect(result.unknown.size)
			.toBe(0)
		expect(result.contents)
			.toEqual([])
	})

	it('should strip __layer from definition passed to extractStyleDefinition and encode layer into extracted selectors', async () => {
		let capturedDef: Record<string, unknown> = {}
		const result = await resolveStyleItemList({
			itemList: [{ __layer: 'components', color: 'red' } as unknown as InternalStyleItem],
			transformStyleItems: async items => items,
			extractStyleDefinition: async (def) => {
				capturedDef = def as Record<string, unknown>
				return [{ selector: ['.%'], property: 'color', value: ['red'] }]
			},
		})
		expect('__layer' in capturedDef)
			.toBe(false)
		expect(result.contents[0]?.selector)
			.toEqual(withLayerSelector('components', '.%'))
	})

	it('should not encode layer selector when __layer is absent', async () => {
		const result = await resolveStyleItemList({
			itemList: [{ color: 'red' }],
			transformStyleItems: async items => items,
			extractStyleDefinition: async () => [
				{ selector: ['.%'], property: 'color', value: ['red'] },
			],
		})
		expect(result.contents[0]?.selector)
			.toEqual(['.%'])
	})
})

// ─── renderAtomicStyles ──────────────────────────────────────────────────────

describe('renderAtomicStyles', () => {
	const defaultSelector = `.${ATOMIC_STYLE_ID_PLACEHOLDER}`

	it('should render a single atomic style (formatted)', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: [defaultSelector], property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: true,
			defaultSelector,
		})
		expect(result)
			.toBe('.a {\n  color: red;\n}')
	})

	it('should render a single atomic style (unformatted)', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: [defaultSelector], property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: false,
			defaultSelector,
		})
		expect(result)
			.toBe('.a{color:red;}')
	})

	it('should replace placeholder with id', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'myId', content: { selector: [defaultSelector], property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: false,
			defaultSelector,
		})
		expect(result)
			.toContain('.myId')
		expect(result).not.toContain(ATOMIC_STYLE_ID_PLACEHOLDER)
	})

	it('should keep placeholder in preview mode', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: [defaultSelector], property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: true,
			isFormatted: false,
			defaultSelector,
		})
		expect(result)
			.toContain(`.${ATOMIC_STYLE_ID_PLACEHOLDER}`)
	})

	it('should sort by weight: default selector first, then by selector length', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'b', content: { selector: ['@media (min-width:768px)', defaultSelector], property: 'display', value: ['flex'] } },
			{ id: 'a', content: { selector: [defaultSelector], property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: true,
			defaultSelector,
		})
		// Default selector style (.a) should come before media query style (.b)
		const posA = result.indexOf('.a')
		const posB = result.indexOf('.b')
		expect(posA)
			.toBeLessThan(posB)
	})

	it('should skip styles with selectors that do not contain the placeholder', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: ['.no-placeholder'], property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: false,
			defaultSelector,
		})
		expect(result)
			.toBe('')
	})

	it('should handle empty atomicStyles array', () => {
		const result = renderAtomicStyles({
			atomicStyles: [],
			isPreview: false,
			isFormatted: true,
			defaultSelector,
		})
		expect(result)
			.toBe('')
	})

	it('should render nested selectors correctly', () => {
		const atomicStyles: AtomicStyle[] = [
			{
				id: 'a',
				content: {
					selector: ['@media (min-width:768px)', `.${ATOMIC_STYLE_ID_PLACEHOLDER}`],
					property: 'display',
					value: ['flex'],
				},
			},
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: true,
			defaultSelector,
		})
		expect(result)
			.toContain('@media (min-width:768px)')
		expect(result)
			.toContain('.a')
		expect(result)
			.toContain('display: flex;')
	})

	it('should replace all placeholder occurrences in selector', () => {
		const atomicStyles: AtomicStyle[] = [
			{
				id: 'x',
				content: {
					selector: [`.${ATOMIC_STYLE_ID_PLACEHOLDER}.${ATOMIC_STYLE_ID_PLACEHOLDER}`],
					property: 'color',
					value: ['red'],
				},
			},
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: false,
			defaultSelector,
		})
		expect(result)
			.toContain('.x.x')
		expect(result).not.toContain(ATOMIC_STYLE_ID_PLACEHOLDER)
	})
})

// ─── createEngine ────────────────────────────────────────────────────────────

describe('createEngine', () => {
	it('should create an Engine instance with default config', async () => {
		const engine = await createEngine()
		expect(engine)
			.toBeInstanceOf(Engine)
		expect(engine.config.prefix)
			.toBe(DEFAULT_ATOMIC_STYLE_ID_PREFIX)
		expect(engine.config.defaultSelector)
			.toBe(`.${ATOMIC_STYLE_ID_PLACEHOLDER}`)
	})

	it('should create an Engine instance with custom prefix', async () => {
		const engine = await createEngine({ prefix: 'pk-' })
		expect(engine.config.prefix)
			.toBe('pk-')
	})

	it('should create an Engine instance with custom defaultSelector', async () => {
		const engine = await createEngine({ defaultSelector: '[data~="%"]' })
		expect(engine.config.defaultSelector)
			.toBe('[data~="%"]')
	})

	it('should include core plugins', async () => {
		const engine = await createEngine()
		// Core plugins (important, variables, keyframes, selectors, shortcuts) should be loaded
		expect(engine.config.plugins.length)
			.toBeGreaterThanOrEqual(5)
	})

	it('should have an empty store initially', async () => {
		const engine = await createEngine()
		expect(engine.store.atomicStyleIds.size)
			.toBe(0)
		expect(engine.store.atomicStyles.size)
			.toBe(0)
	})
})

// ─── Engine.use ──────────────────────────────────────────────────────────────

describe('engine.use', () => {
	it('should process style definitions and return atomic style IDs', async () => {
		const engine = await createEngine()
		const ids = await engine.use({ color: 'red' })
		expect(ids.length)
			.toBeGreaterThan(0)
		expect(typeof ids[0])
			.toBe('string')
	})

	it('should store generated atomic styles', async () => {
		const engine = await createEngine()
		const ids = await engine.use({ color: 'red' })
		expect(engine.store.atomicStyles.size)
			.toBeGreaterThan(0)
		// Each returned ID should exist in the store
		for (const id of ids) {
			expect(engine.store.atomicStyles.has(id))
				.toBe(true)
			expect(engine.store.atomicStyles.get(id)!.id)
				.toBe(id)
		}
	})

	it('should return the same IDs for the same style definitions', async () => {
		const engine = await createEngine()
		const ids1 = await engine.use({ color: 'red' })
		const ids2 = await engine.use({ color: 'red' })
		expect(ids1)
			.toEqual(ids2)
	})

	it('should reuse identical overlapping atomic styles across calls', async () => {
		const engine = await createEngine()
		const ids1 = await engine.use({ padding: '16px', paddingLeft: '8px' })
		const ids2 = await engine.use({ padding: '16px', paddingLeft: '8px' })
		expect(ids1)
			.toHaveLength(2)
		expect(ids2)
			.toHaveLength(2)
		expect(ids1)
			.toEqual(ids2)
	})

	it('should return different IDs for different style definitions', async () => {
		const engine = await createEngine()
		const ids1 = await engine.use({ color: 'red' })
		const ids2 = await engine.use({ color: 'blue' })
		expect(ids1).not.toEqual(ids2)
	})

	it('should not reuse later overlapping atomic styles across calls', async () => {
		const engine = await createEngine()
		const ids1 = await engine.use({ padding: '16px', paddingLeft: '8px' })
		const ids2 = await engine.use({ padding: '24px', paddingLeft: '8px' })
		expect(ids1)
			.toHaveLength(2)
		expect(ids2)
			.toHaveLength(2)
		expect(ids1[1]).not.toBe(ids2[1])
	})

	it('should reuse an overlapping atomic style once global order is already safe', async () => {
		const engine = await createEngine()
		const ids1 = await engine.use({ padding: '16px', paddingLeft: '8px' })
		const ids2 = await engine.use({ padding: '24px', paddingLeft: '8px' })
		const ids3 = await engine.use({ padding: '24px', paddingLeft: '8px' })
		expect(ids1)
			.toHaveLength(2)
		expect(ids2)
			.toHaveLength(2)
		expect(ids3)
			.toHaveLength(2)
		expect(ids3[0])
			.toBe(ids2[0])
		expect(ids3[1])
			.toBe(ids2[1])
		expect(engine.store.atomicStyles.size)
			.toBe(4)
	})

	it('should keep reusing identical non-overlapping atomic styles across calls', async () => {
		const engine = await createEngine()
		const ids1 = await engine.use({ margin: '16px', paddingLeft: '8px' })
		const ids2 = await engine.use({ margin: '24px', paddingLeft: '8px' })
		expect(ids1)
			.toHaveLength(2)
		expect(ids2)
			.toHaveLength(2)
		expect(ids1[1])
			.toBe(ids2[1])
	})

	it('should not reuse later chain declarations across calls', async () => {
		const engine = await createEngine()
		const ids1 = await engine.use({ borderTopWidth: '1px', borderTop: 'solid red', border: '2px solid blue' })
		const ids2 = await engine.use({ borderTopWidth: '4px', borderTop: 'solid red', border: '2px solid blue' })
		expect(ids1)
			.toHaveLength(3)
		expect(ids2)
			.toHaveLength(3)
		expect(ids1[1]).not.toBe(ids2[1])
		expect(ids1[2]).not.toBe(ids2[2])
	})

	it('should keep collision detection scoped by selector shape across calls', async () => {
		const engine = await createEngine()
		const ids1 = await engine.use({ 'padding': '16px', '&:hover': { paddingLeft: '8px' } })
		const ids2 = await engine.use({ 'padding': '24px', '&:hover': { paddingLeft: '8px' } })
		expect(ids1)
			.toHaveLength(2)
		expect(ids2)
			.toHaveLength(2)
		expect(ids1[1])
			.toBe(ids2[1])
	})

	it('should keep collision detection scoped by layer across calls', async () => {
		const engine = await createEngine()
		const ids1 = await engine.use({ padding: '16px', __layer: 'components' } as any, { paddingLeft: '8px' })
		const ids2 = await engine.use({ padding: '24px', __layer: 'components' } as any, { paddingLeft: '8px' })
		expect(ids1)
			.toHaveLength(2)
		expect(ids2)
			.toHaveLength(2)
		expect(ids1[1])
			.toBe(ids2[1])
	})

	it('should handle multiple properties in one call', async () => {
		const engine = await createEngine()
		const ids = await engine.use({ color: 'red', fontSize: '16px' })
		// Each property should produce a separate atomic style
		expect(ids.length)
			.toBeGreaterThanOrEqual(2)
	})

	it('should include unknown strings in the returned array', async () => {
		const engine = await createEngine()
		const ids = await engine.use('some-unknown-class' as any, { color: 'red' })
		expect(ids)
			.toContain('some-unknown-class')
	})

	it('should render stored atomic styles', async () => {
		const engine = await createEngine()
		await engine.use({ color: 'red' })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toContain('color:red;')
	})
})

// ─── Engine.addPreflight ─────────────────────────────────────────────────────

describe('engine.addPreflight', () => {
	it('should add a string preflight', async () => {
		const engine = await createEngine()
		engine.addPreflight('body { margin: 0; }')
		expect(engine.config.preflights.length)
			.toBeGreaterThan(0)
	})

	it('should add a function preflight', async () => {
		const engine = await createEngine()
		const fn = () => 'body { margin: 0; }'
		engine.addPreflight(fn)
		const last = engine.config.preflights[engine.config.preflights.length - 1]!
		expect(last.fn)
			.toBe(fn)
	})

	it('should render added preflights', async () => {
		const engine = await createEngine()
		engine.addPreflight('body { margin: 0; }')
		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('body { margin: 0; }')
	})
})

// ─── Engine autocomplete helpers ─────────────────────────────────────────────

describe('engine autocomplete helpers', () => {
	it('should merge autocomplete from engine config', async () => {
		const engine = await createEngine({
			autocomplete: {
				selectors: '.custom',
				styleItemStrings: 'btn-primary',
				properties: {
					variant: ['"solid"', '"ghost"'],
				},
				patterns: {
					styleItemStrings: 'icon-${string}',
				},
			},
		})

		expect(engine.config.autocomplete.selectors.has('.custom'))
			.toBe(true)
		expect(engine.config.autocomplete.styleItemStrings.has('btn-primary'))
			.toBe(true)
		expect(engine.config.autocomplete.properties.get('variant'))
			.toEqual(['"solid"', '"ghost"'])
		expect(engine.config.autocomplete.patterns.styleItemStrings.has('icon-${string}'))
			.toBe(true)
	})

	it('should append multiple autocomplete sections through canonical method', async () => {
		const engine = await createEngine()
		engine.appendAutocomplete({
			selectors: '.foo',
			styleItemStrings: 'txt-red',
			properties: { color: ['"red"', '"blue"'] },
			patterns: {
				selectors: 'screen-${number}',
			},
		})
		expect(engine.config.autocomplete.selectors.has('.foo'))
			.toBe(true)
		expect(engine.config.autocomplete.styleItemStrings.has('txt-red'))
			.toBe(true)
		expect(engine.config.autocomplete.properties.get('color'))
			.toEqual(['"red"', '"blue"'])
		expect(engine.config.autocomplete.patterns.selectors.has('screen-${number}'))
			.toBe(true)
	})
})

// ─── renderAtomicStyles with layers (standalone function) ────────────────────

describe('renderAtomicStyles with layers', () => {
	const defaultSelector = `.${ATOMIC_STYLE_ID_PLACEHOLDER}`

	it('should NOT output @layer when layers option is not provided', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: [defaultSelector], property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: false,
			defaultSelector,
		})
		expect(result).not.toContain('@layer')
	})

	it('should strip encoded layer selectors before rendering CSS blocks', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: withLayerSelector('components', defaultSelector), property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: false,
			defaultSelector,
		})
		expect(result)
			.toContain('.a{color:red;}')
		expect(result).not.toContain('@layer components')
	})

	it('should wrap styles in @layer block when layers is provided and style has matching layer', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: withLayerSelector('components', defaultSelector), property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: true,
			defaultSelector,
			layers: { components: 0 },
		})
		expect(result)
			.toContain('@layer components {')
		expect(result)
			.toContain('color: red;')
	})

	it('should NOT include @layer declaration line — use renderLayerOrderDeclaration for that', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: withLayerSelector('components', defaultSelector), property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: true,
			defaultSelector,
			layers: { utilities: 1, components: 0 },
		})
		expect(result).not.toContain('@layer components, utilities;')
		expect(result)
			.toContain('@layer components {')
	})

	it('should render layer blocks in the correct order (lower order number first)', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: withLayerSelector('utilities', defaultSelector), property: 'color', value: ['red'] } },
			{ id: 'b', content: { selector: withLayerSelector('components', defaultSelector), property: 'display', value: ['flex'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: true,
			defaultSelector,
			layers: { utilities: 1, components: 0 },
		})
		const componentBlockIdx = result.indexOf('@layer components {')
		const utilitiesBlockIdx = result.indexOf('@layer utilities {')
		expect(componentBlockIdx).not.toBe(-1)
		expect(utilitiesBlockIdx).not.toBe(-1)
		expect(componentBlockIdx)
			.toBeLessThan(utilitiesBlockIdx)
	})

	it('should group multiple styles with the same layer into a single @layer block', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: withLayerSelector('components', defaultSelector), property: 'color', value: ['red'] } },
			{ id: 'b', content: { selector: withLayerSelector('components', defaultSelector), property: 'display', value: ['flex'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: true,
			defaultSelector,
			layers: { components: 0 },
		})
		const matches = result.match(/@layer components \{/g)
		expect(matches)
			.toHaveLength(1)
		expect(result)
			.toContain('color: red;')
		expect(result)
			.toContain('display: flex;')
	})

	it('should NOT output @layer block for configured-but-empty layers', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: withLayerSelector('components', defaultSelector), property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: true,
			defaultSelector,
			layers: { utilities: 1, components: 0 },
		})
		expect(result).not.toMatch(/@layer utilities \{/)
		expect(result)
			.toContain('@layer components {')
	})

	it('should render styles without layer property inside the last @layer block when layers is configured', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: [defaultSelector], property: 'color', value: ['red'] } },
			{ id: 'b', content: { selector: withLayerSelector('components', defaultSelector), property: 'display', value: ['flex'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: true,
			defaultSelector,
			layers: { components: 0 },
		})
		expect(result)
			.toContain('color: red;')
		expect(result)
			.toContain('display: flex;')
		expect(result)
			.toContain('@layer components {')
		// Styles without a layer default to the last configured layer (components)
		const layerIdx = result.indexOf('@layer components {')
		const unlayeredIdx = result.indexOf('.a {')
		expect(unlayeredIdx).not.toBe(-1)
		expect(layerIdx).not.toBe(-1)
		expect(unlayeredIdx)
			.toBeGreaterThan(layerIdx)
	})

	it('should treat a style whose layer is not in the layers config as unlayered', () => {
		const atomicStyles: AtomicStyle[] = [
			{ id: 'a', content: { selector: withLayerSelector('unknown', defaultSelector), property: 'color', value: ['red'] } },
		]
		const result = renderAtomicStyles({
			atomicStyles,
			isPreview: false,
			isFormatted: true,
			defaultSelector,
			layers: { components: 0 },
		})
		// 'unknown' is not in the layers config so it falls through to unlayered output
		expect(result).not.toContain('@layer unknown {')
		expect(result).not.toContain('@layer components {')
		expect(result)
			.toContain('color: red;')
	})
})

// ─── resolveEngineConfig with layers ─────────────────────────────────────────

describe('resolveEngineConfig with layers', () => {
	it('should use DEFAULT_LAYERS when not provided', async () => {
		const resolved = await resolveEngineConfig({})
		expect(resolved.layers)
			.toEqual(DEFAULT_LAYERS)
	})

	it('should merge provided layers on top of DEFAULT_LAYERS', async () => {
		const layers = { components: 0, utilities: 1 }
		const resolved = await resolveEngineConfig({ layers })
		expect(resolved.layers)
			.toEqual({ ...DEFAULT_LAYERS, ...layers })
	})

	it('should set defaultPreflightsLayer to DEFAULT_PREFLIGHTS_LAYER when not provided', async () => {
		const resolved = await resolveEngineConfig({})
		expect(resolved.defaultPreflightsLayer)
			.toBe(DEFAULT_PREFLIGHTS_LAYER)
	})

	it('should use custom defaultPreflightsLayer when provided', async () => {
		const resolved = await resolveEngineConfig({ defaultPreflightsLayer: 'base' })
		expect(resolved.defaultPreflightsLayer)
			.toBe('base')
	})

	it('should set defaultUtilitiesLayer to DEFAULT_UTILITIES_LAYER when not provided', async () => {
		const resolved = await resolveEngineConfig({})
		expect(resolved.defaultUtilitiesLayer)
			.toBe(DEFAULT_UTILITIES_LAYER)
	})

	it('should use custom defaultUtilitiesLayer when provided', async () => {
		const resolved = await resolveEngineConfig({ defaultUtilitiesLayer: 'components' })
		expect(resolved.defaultUtilitiesLayer)
			.toBe('components')
	})
})

// ─── Engine with layers ───────────────────────────────────────────────────────

describe('engine with layers', () => {
	it('should store resolved layers (merged with DEFAULT_LAYERS) in engine.config.layers', async () => {
		const layers = { components: 0, utilities: 1 }
		const engine = await createEngine({ layers })
		expect(engine.config.layers)
			.toEqual({ ...DEFAULT_LAYERS, ...layers })
	})

	it('should output @layer utilities in CSS when layers not configured (uses DEFAULT_LAYERS)', async () => {
		const engine = await createEngine()
		await engine.use({ color: 'red' })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toContain('@layer utilities {')
	})

	it('__layer in StyleDefinition should encode layer into resulting AtomicStyle selector', async () => {
		const engine = await createEngine({ layers: { components: 0 } })
		const ids = await engine.use({ __layer: 'components', color: 'red' } as unknown as InternalStyleItem)
		const atomicStyleId = ids.find(id => engine.store.atomicStyles.has(id))
		expect(atomicStyleId)
			.toBeDefined()
		const atomicStyle = engine.store.atomicStyles.get(atomicStyleId!)
		expect(atomicStyle?.content.selector)
			.toEqual(withLayerSelector('components', '.%'))
	})

	it('__layer in StyleDefinition: styles without __layer should not encode a layer selector', async () => {
		const engine = await createEngine()
		const ids = await engine.use({ color: 'red' })
		const atomicStyleId = ids.find(id => engine.store.atomicStyles.has(id))
		expect(atomicStyleId)
			.toBeDefined()
		const atomicStyle = engine.store.atomicStyles.get(atomicStyleId!)
		expect(atomicStyle?.content.selector)
			.toEqual(['.%'])
	})

	it('__layer in StyleDefinition: same CSS in different layers should get different atomic IDs', async () => {
		const engine = await createEngine({ layers: { components: 0, utilities: 1 } })
		const ids1 = await engine.use({ __layer: 'components', color: 'red' } as unknown as InternalStyleItem)
		const ids2 = await engine.use({ __layer: 'utilities', color: 'red' } as unknown as InternalStyleItem)
		const atomicId1 = ids1.find(id => engine.store.atomicStyles.has(id))
		const atomicId2 = ids2.find(id => engine.store.atomicStyles.has(id))
		expect(atomicId1)
			.toBeDefined()
		expect(atomicId2)
			.toBeDefined()
		expect(atomicId1).not.toBe(atomicId2)
	})

	it('__layer in StyleDefinition: should render styles in correct @layer blocks', async () => {
		const engine = await createEngine({ layers: { components: 0 } })
		await engine.use({ __layer: 'components', color: 'red' } as unknown as InternalStyleItem)
		const css = await engine.renderAtomicStyles(true)
		expect(css)
			.toContain('@layer components {')
		expect(css)
			.toContain('color: red;')
	})

	it('engine.renderAtomicStyles should wrap styles in configured @layer blocks without a declaration line', async () => {
		const engine = await createEngine({ layers: { components: 0, utilities: 1 } })
		await engine.use({ __layer: 'components', color: 'red' } as unknown as InternalStyleItem)
		await engine.use({ __layer: 'utilities', display: 'flex' } as unknown as InternalStyleItem)
		const css = await engine.renderAtomicStyles(true)
		expect(css).not.toContain('@layer components, utilities;')
		expect(css)
			.toContain('@layer components {')
		expect(css)
			.toContain('@layer utilities {')
	})

	it('engine.renderLayerOrderDeclaration and renderAtomicStyles together produce the full @layer output', async () => {
		const engine = await createEngine({ layers: { components: 0, utilities: 1 } })
		await engine.use({ __layer: 'components', color: 'red' } as unknown as InternalStyleItem)
		await engine.use({ __layer: 'utilities', display: 'flex' } as unknown as InternalStyleItem)
		const layerDecl = engine.renderLayerOrderDeclaration()
		const css = await engine.renderAtomicStyles(true)
		const full = [layerDecl, css].filter(Boolean)
			.join('\n')
		// Merged layers include preflights from DEFAULT_LAYERS
		expect(full)
			.toContain('@layer components, preflights, utilities;')
		expect(full)
			.toContain('@layer components {')
		expect(full)
			.toContain('@layer utilities {')
	})
})

// ─── engine.renderPreflights ──────────────────────────────────────────────────

describe('engine.renderPreflights', () => {
	describe('with WithLayer', () => {
		it('should render a WithLayer preflight inside its specified @layer block', async () => {
			const engine = await createEngine({
				preflights: [{ layer: 'base', preflight: 'body { margin: 0; }' }],
			})
			const css = await engine.renderPreflights(true)
			expect(css)
				.toContain('@layer base {')
			expect(css)
				.toContain('body { margin: 0; }')
			const layerStart = css.indexOf('@layer base {')
			const contentIdx = css.indexOf('body { margin: 0; }')
			expect(contentIdx)
				.toBeGreaterThan(layerStart)
		})

		it('should render unlayered and WithLayer preflights in their respective blocks', async () => {
			const engine = await createEngine({
				preflights: [
					':root { --color: red }',
					{ layer: 'base', preflight: 'body { margin: 0; }' },
				],
				layers: { preflights: 0, base: 1 },
			})
			const css = await engine.renderPreflights(true)
			expect(css)
				.toContain('@layer preflights {')
			expect(css)
				.toContain(':root { --color: red }')
			expect(css)
				.toContain('@layer base {')
			expect(css)
				.toContain('body { margin: 0; }')
			const preflightsLayerStart = css.indexOf('@layer preflights {')
			const rootContentIdx = css.indexOf(':root { --color: red }')
			expect(rootContentIdx)
				.toBeGreaterThan(preflightsLayerStart)
			const baseLayerStart = css.indexOf('@layer base {')
			const bodyContentIdx = css.indexOf('body { margin: 0; }')
			expect(bodyContentIdx)
				.toBeGreaterThan(baseLayerStart)
		})

		it('should render explicitly-layered preflights in layers config order, not insertion order', async () => {
			const engine = await createEngine({
				preflights: [
					{ layer: 'utilities', preflight: 'a {}' },
					{ layer: 'base', preflight: 'b {}' },
				],
				layers: { base: 0, utilities: 1 },
			})
			const css = await engine.renderPreflights(true)
			const baseIdx = css.indexOf('@layer base {')
			const utilitiesIdx = css.indexOf('@layer utilities {')
			expect(baseIdx).not.toBe(-1)
			expect(utilitiesIdx).not.toBe(-1)
			expect(baseIdx)
				.toBeLessThan(utilitiesIdx)
		})
	})

	describe('with layers', () => {
		it('should wrap preflights in @layer preflights block when layers not explicitly configured (uses DEFAULT_LAYERS)', async () => {
			const engine = await createEngine({
				preflights: ['body { margin: 0; }'],
			})
			const css = await engine.renderPreflights(false)
			expect(css)
				.toContain('@layer preflights {')
			expect(css)
				.toContain('body { margin: 0; }')
		})

		it('should wrap ALL preflights in @layer preflights block when preflights key exists in layers config', async () => {
			const engine = await createEngine({
				preflights: ['body { margin: 0; }'],
				layers: { preflights: 0 },
			})
			const css = await engine.renderPreflights(true)
			expect(css)
				.toContain('@layer preflights {')
			expect(css)
				.toContain('body { margin: 0; }')
			const layerStart = css.indexOf('@layer preflights {')
			const contentIdx = css.indexOf('body { margin: 0; }')
			expect(contentIdx)
				.toBeGreaterThan(layerStart)
		})

		it('should still wrap preflights in @layer preflights even when only other layers are provided (preflights merged from DEFAULT_LAYERS)', async () => {
			const engine = await createEngine({
				preflights: ['body { margin: 0; }'],
				layers: { components: 0 },
			})
			const css = await engine.renderPreflights(false)
			// DEFAULT_LAYERS always injects 'preflights' layer, so unlayered preflights are wrapped
			expect(css)
				.toContain('@layer preflights {')
			expect(css)
				.toContain('body { margin: 0; }')
		})

		it('should leave preflights unlayered when defaultPreflightsLayer is not configured in layers', async () => {
			const engine = await createEngine({
				preflights: ['body { margin: 0; }'],
				layers: { components: 0 },
				defaultPreflightsLayer: 'base',
			})
			const css = await engine.renderPreflights(false)
			expect(css).not.toContain('@layer base {')
			expect(css)
				.toContain('body { margin: 0; }')
		})

		it('should fall back to the last configured layer when defaultUtilitiesLayer is missing', async () => {
			const engine = await createEngine({
				layers: { components: 0 },
				defaultUtilitiesLayer: 'base',
			})
			await engine.use({ color: 'red' })
			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('@layer utilities {')
			expect(css)
				.not.toContain('@layer base {')
		})
	})
})

// ─── engine.renderLayerOrderDeclaration ──────────────────────────────────────

describe('engine.renderLayerOrderDeclaration', () => {
	it('should return default @layer declaration when layers not explicitly configured', async () => {
		const engine = await createEngine()
		expect(engine.renderLayerOrderDeclaration())
			.toBe('@layer preflights, utilities;')
	})

	it('should return DEFAULT_LAYERS declaration when layers is an empty object (merged with DEFAULT_LAYERS)', async () => {
		const engine = await createEngine({ layers: {} })
		expect(engine.renderLayerOrderDeclaration())
			.toBe('@layer preflights, utilities;')
	})

	it('should return @layer declaration sorted by order number (merged with DEFAULT_LAYERS)', async () => {
		const engine = await createEngine({ layers: { utilities: 1, components: 0 } })
		// After merge: { preflights: 1, utilities: 1, components: 0 } → sorted: components(0), preflights(1), utilities(1)
		expect(engine.renderLayerOrderDeclaration())
			.toBe('@layer components, preflights, utilities;')
	})

	it('should include DEFAULT_LAYERS when a single custom layer is provided', async () => {
		const engine = await createEngine({ layers: { components: 0 } })
		// After merge: { preflights: 1, utilities: 10, components: 0 }
		expect(engine.renderLayerOrderDeclaration())
			.toBe('@layer components, preflights, utilities;')
	})
})
