import type { InternalStyleDefinition } from './types'
import { describe, expect, it } from 'vitest'
import { createExtractFn, extract, normalizeSelectors, normalizeValue } from './extractor'

const defaultSelector = '.test'

const passthroughOptions = {
	defaultSelector,
	transformSelectors: async (s: string[]) => s,
	transformStyleItems: async (s: any[]) => s,
	transformStyleDefinitions: async (s: any[]) => s,
}

describe('normalizeSelectors', () => {
	it('should return selectors as-is when no placeholders are present', () => {
		const result = normalizeSelectors({ selectors: ['.foo'], defaultSelector: '.x' })
		expect(result)
			.toEqual(['.foo'])
	})

	it('should replace $ placeholder with defaultSelector', () => {
		const result = normalizeSelectors({ selectors: ['$.active'], defaultSelector: '.btn' })
		expect(result)
			.toEqual(['.btn.active'])
	})

	it('should replace multiple $ placeholders in a single selector', () => {
		const result = normalizeSelectors({ selectors: ['$ > $'], defaultSelector: '.item' })
		expect(result)
			.toEqual(['.item > .item'])
	})

	it('should preserve % (ATOMIC_STYLE_ID_PLACEHOLDER) in selectors', () => {
		const result = normalizeSelectors({ selectors: ['%.active'], defaultSelector: '.x' })
		expect(result)
			.toEqual(['%.active'])
	})

	it('should handle comma-separated selectors (normalize spacing)', () => {
		const result = normalizeSelectors({ selectors: ['$.a , $.b'], defaultSelector: '.c' })
		expect(result)
			.toEqual(['.c.a,.c.b'])
	})

	it('should handle comma-separated selectors with extra whitespace', () => {
		const result = normalizeSelectors({ selectors: ['$.a ,   $.b ,  $.c'], defaultSelector: '.d' })
		expect(result)
			.toEqual(['.d.a,.d.b,.d.c'])
	})

	it('should preserve $= (attribute suffix match) without replacing them', () => {
		const result = normalizeSelectors({ selectors: ['[data$=value]'], defaultSelector: '.x' })
		expect(result)
			.toEqual(['[data$=value]'])
	})

	it('should handle selectors with both $ placeholder and $= attribute suffix', () => {
		const result = normalizeSelectors({ selectors: ['$ [data$=value]'], defaultSelector: '.root' })
		expect(result)
			.toEqual(['.root [data$=value]'])
	})

	it('should handle multiple selectors in the array', () => {
		const result = normalizeSelectors({ selectors: ['$.a', '$.b'], defaultSelector: '.x' })
		expect(result)
			.toEqual(['.x.a', '.x.b'])
	})

	it('should handle empty selectors array', () => {
		const result = normalizeSelectors({ selectors: [], defaultSelector: '.x' })
		expect(result)
			.toEqual([])
	})

	it('should handle selector with only $ placeholder', () => {
		const result = normalizeSelectors({ selectors: ['$'], defaultSelector: '.main' })
		expect(result)
			.toEqual(['.main'])
	})

	it('should handle % placeholder split and rejoin correctly', () => {
		const result = normalizeSelectors({ selectors: ['%:hover'], defaultSelector: '.x' })
		expect(result)
			.toEqual(['%:hover'])
	})
})

describe('normalizeValue', () => {
	it('should return null as-is', () => {
		expect(normalizeValue(null))
			.toBeNull()
	})

	it('should return undefined as-is', () => {
		expect(normalizeValue(undefined))
			.toBeUndefined()
	})

	it('should wrap a string value in an array', () => {
		expect(normalizeValue('red'))
			.toEqual(['red'])
	})

	it('should wrap a numeric string in an array', () => {
		expect(normalizeValue('42'))
			.toEqual(['42'])
	})

	it('should wrap 0 string in an array', () => {
		expect(normalizeValue('0'))
			.toEqual(['0'])
	})

	it('should trim whitespace from string values', () => {
		expect(normalizeValue('  red  '))
			.toEqual(['red'])
	})

	it('should place fallback values before primary (CSS correct order)', () => {
		const input: [string, string[]] = ['red', ['red', 'blue']]
		const result = normalizeValue(input)
		expect(result)
			.toEqual(['blue', 'red'])
	})

	it('should place primary after fallbacks', () => {
		const input: [string, string[]] = ['1px', ['2px', '3px']]
		const result = normalizeValue(input)
		expect(result)
			.toEqual(['2px', '3px', '1px'])
	})

	it('should handle empty string', () => {
		expect(normalizeValue(''))
			.toEqual([''])
	})
})

describe('extract', () => {
	it('should extract a simple property', async () => {
		const styleDefinition: InternalStyleDefinition = {
			color: 'red',
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: [defaultSelector], property: 'color', value: ['red'] },
			])
	})

	it('should extract multiple properties', async () => {
		const styleDefinition: InternalStyleDefinition = {
			color: 'red',
			display: 'flex',
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: [defaultSelector], property: 'color', value: ['red'] },
				{ selector: [defaultSelector], property: 'display', value: ['flex'] },
			])
	})

	it('should convert camelCase properties to kebab-case', async () => {
		const styleDefinition: InternalStyleDefinition = {
			backgroundColor: 'blue',
			fontSize: '16px',
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: [defaultSelector], property: 'background-color', value: ['blue'] },
				{ selector: [defaultSelector], property: 'font-size', value: ['16px'] },
			])
	})

	it('should handle null value', async () => {
		const styleDefinition: InternalStyleDefinition = {
			color: null,
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: [defaultSelector], property: 'color', value: null },
			])
	})

	it('should handle undefined value', async () => {
		const styleDefinition: InternalStyleDefinition = {
			color: undefined,
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: [defaultSelector], property: 'color', value: undefined },
			])
	})

	it('should handle numeric string values', async () => {
		const styleDefinition: InternalStyleDefinition = {
			opacity: '0.5',
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: [defaultSelector], property: 'opacity', value: ['0.5'] },
			])
	})

	it('should handle nested style definitions (e.g. media queries)', async () => {
		const styleDefinition: InternalStyleDefinition = {
			'@media (min-width: 768px)': {
				color: 'blue',
			},
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: ['@media (min-width: 768px)', defaultSelector], property: 'color', value: ['blue'] },
			])
	})

	it('should preserve nested selectors in levels', async () => {
		const styleDefinition: InternalStyleDefinition = {
			'%:hover': {
				color: 'blue',
			},
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: ['%:hover'], property: 'color', value: ['blue'] },
			])
	})

	it('should skip string items in array style items', async () => {
		const styleDefinition: InternalStyleDefinition = {
			'%:hover': [
				'some-string-item',
				{ color: 'green' },
			],
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: ['%:hover'], property: 'color', value: ['green'] },
			])
	})

	it('should handle array style items with multiple objects', async () => {
		const styleDefinition: InternalStyleDefinition = {
			'%:hover': [
				{ color: 'red' },
				{ display: 'block' },
			],
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: ['%:hover'], property: 'color', value: ['red'] },
				{ selector: ['%:hover'], property: 'display', value: ['block'] },
			])
	})

	it('should handle deeply nested style definitions', async () => {
		const styleDefinition: InternalStyleDefinition = {
			'@media (min-width: 768px)': {
				'%:hover': {
					color: 'blue',
				},
			},
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([
				{ selector: ['@media (min-width: 768px)', '%:hover'], property: 'color', value: ['blue'] },
			])
	})

	it('should add defaultSelector when levels produce no % placeholder', async () => {
		const styleDefinition: InternalStyleDefinition = {
			'@media screen': {
				color: 'red',
			},
		}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		// '@media screen' does not contain %, so defaultSelector is appended
		expect(result[0]!.selector)
			.toContain(defaultSelector)
	})

	it('should use custom transformSelectors', async () => {
		const styleDefinition: InternalStyleDefinition = {
			'%:hover': {
				color: 'blue',
			},
		}
		const result = await extract({
			styleDefinition,
			defaultSelector,
			transformSelectors: async selectors => selectors.map(s => s.replace(':hover', ':focus')),
			transformStyleItems: async s => s,
			transformStyleDefinitions: async s => s,
		})
		expect(result)
			.toEqual([
				{ selector: ['%:focus'], property: 'color', value: ['blue'] },
			])
	})

	it('should use custom transformStyleDefinitions', async () => {
		const styleDefinition: InternalStyleDefinition = {
			color: 'red',
		}
		const result = await extract({
			styleDefinition,
			defaultSelector,
			transformSelectors: async s => s,
			transformStyleItems: async s => s,
			transformStyleDefinitions: async defs => defs.map(d => ({ ...d, display: 'flex' }) as InternalStyleDefinition),
		})
		expect(result)
			.toEqual([
				{ selector: [defaultSelector], property: 'color', value: ['red'] },
				{ selector: [defaultSelector], property: 'display', value: ['flex'] },
			])
	})

	it('should use custom transformStyleItems', async () => {
		const styleDefinition: InternalStyleDefinition = {
			'%:hover': [
				{ color: 'red' },
			],
		}
		const result = await extract({
			styleDefinition,
			defaultSelector,
			transformSelectors: async s => s,
			transformStyleItems: async items => [...items, { fontWeight: 'bold' }],
			transformStyleDefinitions: async s => s,
		})
		expect(result)
			.toEqual([
				{ selector: ['%:hover'], property: 'color', value: ['red'] },
				{ selector: ['%:hover'], property: 'font-weight', value: ['bold'] },
			])
	})

	it('should handle empty style definition', async () => {
		const styleDefinition: InternalStyleDefinition = {}
		const result = await extract({ styleDefinition, ...passthroughOptions })
		expect(result)
			.toEqual([])
	})

	it('should accumulate results into existing result array', async () => {
		const existing = [{ selector: ['.pre'], property: 'margin', value: ['0'] }]
		const styleDefinition: InternalStyleDefinition = { color: 'red' }
		const result = await extract({ styleDefinition, ...passthroughOptions, result: existing })
		expect(result)
			.toHaveLength(2)
		expect(result[0])
			.toEqual({ selector: ['.pre'], property: 'margin', value: ['0'] })
		expect(result[1])
			.toEqual({ selector: [defaultSelector], property: 'color', value: ['red'] })
		// Should be the same reference
		expect(result)
			.toBe(existing)
	})
})

describe('createExtractFn', () => {
	it('should create a function that extracts styles', async () => {
		const extractFn = createExtractFn(passthroughOptions)
		const result = await extractFn({ color: 'red' })
		expect(result)
			.toEqual([
				{ selector: [defaultSelector], property: 'color', value: ['red'] },
			])
	})

	it('should create an independent function for each call', async () => {
		const fn1 = createExtractFn({ ...passthroughOptions, defaultSelector: '.a' })
		const fn2 = createExtractFn({ ...passthroughOptions, defaultSelector: '.b' })
		const r1 = await fn1({ color: 'red' })
		const r2 = await fn2({ color: 'blue' })
		expect(r1[0]!.selector)
			.toEqual(['.a'])
		expect(r2[0]!.selector)
			.toEqual(['.b'])
	})

	it('should pass transform functions through to extract', async () => {
		const extractFn = createExtractFn({
			defaultSelector: '.x',
			transformSelectors: async s => s,
			transformStyleItems: async s => s,
			transformStyleDefinitions: async defs => defs.map(d => ({ ...d, display: 'none' }) as InternalStyleDefinition),
		})
		const result = await extractFn({ color: 'red' })
		expect(result)
			.toEqual([
				{ selector: ['.x'], property: 'color', value: ['red'] },
				{ selector: ['.x'], property: 'display', value: ['none'] },
			])
	})

	it('should handle complex nested definitions', async () => {
		const extractFn = createExtractFn(passthroughOptions)
		const result = await extractFn({
			'%:hover': {
				backgroundColor: 'yellow',
			},
		})
		expect(result)
			.toEqual([
				{ selector: ['%:hover'], property: 'background-color', value: ['yellow'] },
			])
	})
})
