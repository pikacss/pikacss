import { describe, expect, it } from 'vitest'
import { createExtractFn, normalizeSelectors, normalizeValue } from '../../../src/internal/extractor'

describe('extractor', () => {
	it('should normalize selectors with default placeholder', async () => {
		const selectors = ['$']
		const defaultSelector = '.test'
		const normalized = normalizeSelectors({ selectors, defaultSelector })
		expect(normalized).toEqual(['.test'])
	})

	it('should normalize selectors with attribute suffix match', async () => {
		const selectors = ['div$=$']
		const defaultSelector = '.test'
		const normalized = normalizeSelectors({ selectors, defaultSelector })
		expect(normalized).toEqual(['div$=.test'])
	})

	it('should normalize value with null', () => {
		const value = null
		const normalized = normalizeValue(value)
		expect(normalized).toBeNull()
	})

	it('should normalize value with undefined', () => {
		const value = undefined
		const normalized = normalizeValue(value)
		expect(normalized).toBeUndefined()
	})

	it('should normalize value with array and flatten', () => {
		const value = ['1', ['2', '3']] as [string, string[]]
		const normalized = normalizeValue(value)
		expect(normalized).toEqual(['1', '2', '3'])
	})

	it('should normalize value with duplicates and trim', () => {
		const value = [' 1 ', ['2', ' 1 ']] as [string, string[]]
		const normalized = normalizeValue(value)
		expect(normalized).toEqual(['1', '2'])
	})

	it('should normalize selectors with ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL', () => {
		const selectors = ['pika-css-placeholder']
		const defaultSelector = '.test'
		const normalized = normalizeSelectors({ selectors, defaultSelector })
		expect(normalized).toEqual(['pika-css-placeholder'])
	})

	it('should normalize selectors with RE_SPLIT', () => {
		const selectors = ['a,b']
		const defaultSelector = '.test'
		const normalized = normalizeSelectors({ selectors, defaultSelector })
		expect(normalized).toEqual(['a,b'])
	})

	it('should extract styles from array values', async () => {
		const extract = createExtractFn({
			defaultSelector: '.%',
			transformSelectors: async s => s,
			transformStyleItems: async s => s,
			transformStyleDefinitions: async s => s,
		})
		const result = await extract({ color: ['red', ['blue']] })
		expect(result).toEqual([
			{ selector: ['.%'], property: 'color', value: ['red', 'blue'] },
		])
	})

	it('should extract styles from nested objects', async () => {
		const extract = createExtractFn({
			defaultSelector: '.%',
			transformSelectors: async s => s,
			transformStyleItems: async s => s,
			transformStyleDefinitions: async s => s,
		})
		const result = await extract({ div: { color: 'red' } })
		expect(result).toEqual([
			{ selector: ['div', '.%'], property: 'color', value: ['red'] },
		])
	})

	it('should extract styles from array of style items', async () => {
		const extract = createExtractFn({
			defaultSelector: '.%',
			transformSelectors: async s => s,
			transformStyleItems: async s => s,
			transformStyleDefinitions: async s => s,
		})
		const result = await extract({ $: [{ color: 'red' }, { backgroundColor: 'blue' }] })
		expect(result).toEqual([
			{ selector: ['.%'], property: 'color', value: ['red'] },
			{ selector: ['.%'], property: 'background-color', value: ['blue'] },
		])
	})

	it('should extract styles from nested style definitions', async () => {
		const extract = createExtractFn({
			defaultSelector: '.%',
			transformSelectors: async s => s,
			transformStyleItems: async s => s,
			transformStyleDefinitions: async s => s,
		})
		const result = await extract({ div: { span: { color: 'green' } } })
		expect(result).toEqual([
			{ selector: ['div', 'span', '.%'], property: 'color', value: ['green'] },
		])
	})
})
