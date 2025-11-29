import type { ResolvedEngineConfig } from '../../../src/internal/types'
import { describe, expect, it, vi } from 'vitest'
import { addToSet, appendAutocompleteCssPropertyValues, appendAutocompleteExtraCssProperties, appendAutocompleteExtraProperties, appendAutocompletePropertyValues, appendAutocompleteSelectors, appendAutocompleteStyleItemStrings, isNotNullish, isNotString, isPropertyValue, isString, numberToChars, renderCSSStyleBlocks, serialize, setWarnFn, toKebab, warn } from '../../../src/internal/utils'

describe('utils', () => {
	it('should warn', () => {
		const warnFn = vi.fn()
		setWarnFn(warnFn)
		warn('hello')
		expect(warnFn)
			.toHaveBeenCalledWith('hello')
	})

	it('should convert number to chars correctly', () => {
		expect(numberToChars(0))
			.toBe('a')
		expect(numberToChars(25))
			.toBe('z')
		expect(numberToChars(26))
			.toBe('A')
		expect(numberToChars(51))
			.toBe('Z')
		expect(numberToChars(52))
			.toBe('aa')
	})

	it('should convert string to kebab case', () => {
		expect(toKebab('backgroundColor'))
			.toBe('background-color')
		expect(toKebab('WebkitTransform'))
			.toBe('-webkit-transform')
		expect(toKebab('fontSize'))
			.toBe('font-size')
	})

	it('should correctly identify property values', () => {
		expect(isPropertyValue('red'))
			.toBe(true)
		expect(isPropertyValue(10))
			.toBe(true)
		expect(isPropertyValue(null))
			.toBe(true)
		expect(isPropertyValue(undefined))
			.toBe(true)
		expect(isPropertyValue(['red', 'blue']))
			.toBe(false)
		expect(isPropertyValue({ color: 'red' }))
			.toBe(false)
		expect(isPropertyValue(['prop', ['val1', 'val2']]))
			.toBe(true)
		expect(isPropertyValue(['prop', ['val1', { obj: 'val2' }]] as any))
			.toBe(false)
	})

	it('should correctly identify not nullish values', () => {
		expect(isNotNullish(null))
			.toBe(false)
		expect(isNotNullish(undefined))
			.toBe(false)
		expect(isNotNullish(0))
			.toBe(true)
		expect(isNotNullish(''))
			.toBe(true)
		expect(isNotNullish(false))
			.toBe(true)
	})

	it('should correctly identify string values', () => {
		expect(isString('hello'))
			.toBe(true)
		expect(isString(123))
			.toBe(false)
		expect(isString(null))
			.toBe(false)
		expect(isString(undefined))
			.toBe(false)
		expect(isString({}))
			.toBe(false)
	})

	it('should correctly identify not string values', () => {
		expect(isNotString('hello'))
			.toBe(false)
		expect(isNotString(123))
			.toBe(true)
		expect(isNotString(null))
			.toBe(true)
		expect(isNotString(undefined))
			.toBe(true)
		expect(isNotString({}))
			.toBe(true)
	})

	it('should serialize value', () => {
		expect(serialize({ a: 1 }))
			.toBe('{"a":1}')
	})

	it('should add to set', () => {
		const set = new Set()
		addToSet(set, 1, 2, 3)
		expect(set)
			.toEqual(new Set([1, 2, 3]))
	})

	it('should append autocomplete selectors', () => {
		const config = { autocomplete: { selectors: new Set() } } as unknown as ResolvedEngineConfig
		appendAutocompleteSelectors(config, 'a', 'b')
		expect(config.autocomplete.selectors)
			.toEqual(new Set(['a', 'b']))
	})

	it('should append autocomplete style item strings', () => {
		const config = { autocomplete: { styleItemStrings: new Set() } } as unknown as ResolvedEngineConfig
		appendAutocompleteStyleItemStrings(config, 'a', 'b')
		expect(config.autocomplete.styleItemStrings)
			.toEqual(new Set(['a', 'b']))
	})

	it('should append autocomplete extra properties', () => {
		const config = { autocomplete: { extraProperties: new Set() } } as unknown as ResolvedEngineConfig
		appendAutocompleteExtraProperties(config, 'a', 'b')
		expect(config.autocomplete.extraProperties)
			.toEqual(new Set(['a', 'b']))
	})

	it('should append autocomplete extra css properties', () => {
		const config = { autocomplete: { extraCssProperties: new Set() } } as unknown as ResolvedEngineConfig
		appendAutocompleteExtraCssProperties(config, 'a', 'b')
		expect(config.autocomplete.extraCssProperties)
			.toEqual(new Set(['a', 'b']))
	})

	it('should append autocomplete property values', () => {
		const config = { autocomplete: { properties: new Map() } } as unknown as ResolvedEngineConfig
		appendAutocompletePropertyValues(config, 'color', 'red', 'blue')
		expect(config.autocomplete.properties.get('color'))
			.toEqual(['red', 'blue'])
	})

	it('should append autocomplete css property values', () => {
		const config = { autocomplete: { cssProperties: new Map() } } as unknown as ResolvedEngineConfig
		appendAutocompleteCssPropertyValues(config, 'color', 'red', 'blue')
		expect(config.autocomplete.cssProperties.get('color'))
			.toEqual(['red', 'blue'])
	})

	it('should render css style blocks', () => {
		const blocks = new Map([
			['.a', { properties: [{ property: 'color', value: 'red' }], children: new Map() }],
			['.b', { properties: [{ property: 'color', value: 'blue' }], children: new Map() }],
		])
		expect(renderCSSStyleBlocks(blocks, true))
			.toBe('.a {\n  color: red;\n}\n.b {\n  color: blue;\n}')
		expect(renderCSSStyleBlocks(blocks, false))
			.toBe('.a{color:red;}.b{color:blue;}')
	})
})
