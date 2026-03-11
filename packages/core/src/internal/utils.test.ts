/* eslint-disable no-template-curly-in-string */
import type { CSSStyleBlocks, ResolvedEngineConfig } from './types'
import { describe, expect, it, vi } from 'vitest'
import {
	addToSet,
	appendAutocomplete,
	createLogger,
	isNotNullish,
	isNotString,
	isPropertyValue,
	isString,
	log,
	numberToChars,
	renderCSSStyleBlocks,
	serialize,
	toKebab,
} from './utils'

describe('createLogger', () => {
	it('should create a logger with the given prefix', () => {
		const fn = vi.fn()
		const logger = createLogger('[Test]')
		logger.setInfoFn(fn)
		logger.info('hello')
		expect(fn)
			.toHaveBeenCalledWith('[Test][INFO]', 'hello')
	})

	it('should suppress debug messages by default', () => {
		const fn = vi.fn()
		const logger = createLogger('[Test]')
		logger.setDebugFn(fn)
		logger.debug('hidden')
		expect(fn).not.toHaveBeenCalled()
	})

	it('should emit debug messages after toggleDebug', () => {
		const fn = vi.fn()
		const logger = createLogger('[Test]')
		logger.setDebugFn(fn)
		logger.toggleDebug()
		logger.debug('visible')
		expect(fn)
			.toHaveBeenCalledWith('[Test][DEBUG]', 'visible')
	})

	it('should suppress debug messages again after double toggle', () => {
		const fn = vi.fn()
		const logger = createLogger('[Test]')
		logger.setDebugFn(fn)
		logger.toggleDebug()
		logger.toggleDebug()
		logger.debug('hidden again')
		expect(fn).not.toHaveBeenCalled()
	})

	it('should call info with prefix', () => {
		const fn = vi.fn()
		const logger = createLogger('[App]')
		logger.setInfoFn(fn)
		logger.info('msg', 42)
		expect(fn)
			.toHaveBeenCalledWith('[App][INFO]', 'msg', 42)
	})

	it('should call warn with prefix', () => {
		const fn = vi.fn()
		const logger = createLogger('[App]')
		logger.setWarnFn(fn)
		logger.warn('warning!')
		expect(fn)
			.toHaveBeenCalledWith('[App][WARN]', 'warning!')
	})

	it('should call error with prefix', () => {
		const fn = vi.fn()
		const logger = createLogger('[App]')
		logger.setErrorFn(fn)
		logger.error('err!', { detail: 1 })
		expect(fn)
			.toHaveBeenCalledWith('[App][ERROR]', 'err!', { detail: 1 })
	})

	it('should change prefix with setPrefix', () => {
		const fn = vi.fn()
		const logger = createLogger('[Old]')
		logger.setInfoFn(fn)
		logger.setPrefix('[New]')
		logger.info('test')
		expect(fn)
			.toHaveBeenCalledWith('[New][INFO]', 'test')
	})

	it('should allow replacing the debug function via setDebugFn', () => {
		const fn = vi.fn()
		const logger = createLogger('[X]')
		logger.setDebugFn(fn)
		logger.toggleDebug()
		logger.debug('a', 'b')
		expect(fn)
			.toHaveBeenCalledWith('[X][DEBUG]', 'a', 'b')
	})

	it('should allow replacing the info function via setInfoFn', () => {
		const fn = vi.fn()
		const logger = createLogger('[X]')
		logger.setInfoFn(fn)
		logger.info('data')
		expect(fn)
			.toHaveBeenCalledWith('[X][INFO]', 'data')
	})

	it('should allow replacing the warn function via setWarnFn', () => {
		const fn = vi.fn()
		const logger = createLogger('[X]')
		logger.setWarnFn(fn)
		logger.warn('w')
		expect(fn)
			.toHaveBeenCalledWith('[X][WARN]', 'w')
	})

	it('should allow replacing the error function via setErrorFn', () => {
		const fn = vi.fn()
		const logger = createLogger('[X]')
		logger.setErrorFn(fn)
		logger.error('e')
		expect(fn)
			.toHaveBeenCalledWith('[X][ERROR]', 'e')
	})

	it('should pass multiple arguments through', () => {
		const fn = vi.fn()
		const logger = createLogger('[Multi]')
		logger.setInfoFn(fn)
		logger.info(1, 2, 3, 'a', 'b')
		expect(fn)
			.toHaveBeenCalledWith('[Multi][INFO]', 1, 2, 3, 'a', 'b')
	})
})

describe('log (default instance)', () => {
	it('should be a logger with [PikaCSS] prefix', () => {
		const fn = vi.fn()
		log.setInfoFn(fn)
		log.info('test')
		expect(fn)
			.toHaveBeenCalledWith('[PikaCSS][INFO]', 'test')
		// Restore default
		// eslint-disable-next-line no-console
		log.setInfoFn(console.log)
	})
})

describe('numberToChars', () => {
	it('should return "a" for 0', () => {
		expect(numberToChars(0))
			.toBe('a')
	})

	it('should return "z" for 25', () => {
		expect(numberToChars(25))
			.toBe('z')
	})

	it('should return "A" for 26', () => {
		expect(numberToChars(26))
			.toBe('A')
	})

	it('should return "Z" for 51', () => {
		expect(numberToChars(51))
			.toBe('Z')
	})

	it('should return single chars for 0-51', () => {
		const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
		for (let i = 0; i < 52; i++) {
			expect(numberToChars(i))
				.toBe(chars[i])
		}
	})

	it('should return multi-char strings for values >= 52', () => {
		const result = numberToChars(52)
		expect(result.length)
			.toBeGreaterThan(1)
	})

	it('should return unique results for different inputs', () => {
		const results = new Set<string>()
		for (let i = 0; i < 200; i++) {
			results.add(numberToChars(i))
		}
		expect(results.size)
			.toBe(200)
	})

	it('should produce consistent results', () => {
		expect(numberToChars(100))
			.toBe(numberToChars(100))
		expect(numberToChars(999))
			.toBe(numberToChars(999))
	})

	it('should handle large numbers', () => {
		const result = numberToChars(10000)
		expect(typeof result)
			.toBe('string')
		expect(result.length)
			.toBeGreaterThan(1)
	})
})

describe('toKebab', () => {
	it('should convert camelCase to kebab-case', () => {
		expect(toKebab('backgroundColor'))
			.toBe('background-color')
	})

	it('should convert PascalCase to kebab-case', () => {
		expect(toKebab('BackgroundColor'))
			.toBe('-background-color')
	})

	it('should leave already kebab-case strings unchanged', () => {
		expect(toKebab('background-color'))
			.toBe('background-color')
	})

	it('should leave lowercase strings unchanged', () => {
		expect(toKebab('color'))
			.toBe('color')
	})

	it('should handle empty string', () => {
		expect(toKebab(''))
			.toBe('')
	})

	it('should handle strings with multiple consecutive uppercase letters', () => {
		expect(toKebab('borderTopLeftRadius'))
			.toBe('border-top-left-radius')
	})

	it('should handle single uppercase letter', () => {
		expect(toKebab('A'))
			.toBe('-a')
	})

	it('should convert webkitTransform', () => {
		expect(toKebab('webkitTransform'))
			.toBe('webkit-transform')
	})

	it('should handle strings with all uppercase', () => {
		expect(toKebab('ABC'))
			.toBe('-a-b-c')
	})

	it('should return CSS custom properties (starting with --) unchanged', () => {
		expect(toKebab('--my-var'))
			.toBe('--my-var')
	})

	it('should return CSS custom properties with camelCase suffix unchanged', () => {
		expect(toKebab('--myVarName'))
			.toBe('--myVarName')
	})
})

describe('isNotNullish', () => {
	it('should return false for null', () => {
		expect(isNotNullish(null))
			.toBe(false)
	})

	it('should return false for undefined', () => {
		expect(isNotNullish(undefined))
			.toBe(false)
	})

	it('should return true for 0', () => {
		expect(isNotNullish(0))
			.toBe(true)
	})

	it('should return true for empty string', () => {
		expect(isNotNullish(''))
			.toBe(true)
	})

	it('should return true for false', () => {
		expect(isNotNullish(false))
			.toBe(true)
	})

	it('should return true for truthy values', () => {
		expect(isNotNullish(1))
			.toBe(true)
		expect(isNotNullish('hello'))
			.toBe(true)
		expect(isNotNullish({}))
			.toBe(true)
		expect(isNotNullish([]))
			.toBe(true)
		expect(isNotNullish(true))
			.toBe(true)
	})
})

describe('isString', () => {
	it('should return true for string literals', () => {
		expect(isString('hello'))
			.toBe(true)
		expect(isString(''))
			.toBe(true)
	})

	it('should return false for number', () => {
		expect(isString(42))
			.toBe(false)
	})

	it('should return false for object', () => {
		expect(isString({}))
			.toBe(false)
	})

	it('should return false for null', () => {
		expect(isString(null))
			.toBe(false)
	})

	it('should return false for undefined', () => {
		expect(isString(undefined))
			.toBe(false)
	})

	it('should return false for boolean', () => {
		expect(isString(true))
			.toBe(false)
		expect(isString(false))
			.toBe(false)
	})

	it('should return false for array', () => {
		expect(isString([]))
			.toBe(false)
	})
})

describe('isNotString', () => {
	it('should return false for string literals', () => {
		expect(isNotString('hello'))
			.toBe(false)
		expect(isNotString(''))
			.toBe(false)
	})

	it('should return true for number', () => {
		expect(isNotString(42))
			.toBe(true)
	})

	it('should return true for object', () => {
		expect(isNotString({}))
			.toBe(true)
	})

	it('should return true for null', () => {
		expect(isNotString(null))
			.toBe(true)
	})

	it('should return true for undefined', () => {
		expect(isNotString(undefined))
			.toBe(true)
	})

	it('should return true for boolean', () => {
		expect(isNotString(true))
			.toBe(true)
		expect(isNotString(false))
			.toBe(true)
	})

	it('should return true for array', () => {
		expect(isNotString([]))
			.toBe(true)
	})
})

describe('isPropertyValue', () => {
	it('should return true for null', () => {
		expect(isPropertyValue(null as any))
			.toBe(true)
	})

	it('should return true for undefined', () => {
		expect(isPropertyValue(undefined as any))
			.toBe(true)
	})

	it('should return true for a string', () => {
		expect(isPropertyValue('red'))
			.toBe(true)
	})

	it('should return false for a number', () => {
		expect(isPropertyValue(42))
			.toBe(false)
	})

	it('should return false for a plain object', () => {
		expect(isPropertyValue({ color: 'red' }))
			.toBe(false)
	})

	it('should return false for an empty object', () => {
		expect(isPropertyValue({}))
			.toBe(false)
	})

	it('should return true for a valid tuple [value, fallbacks[]]', () => {
		expect(isPropertyValue(['red', ['blue', 'green']]))
			.toBe(true)
	})

	it('should return false for a tuple with numeric values', () => {
		expect(isPropertyValue([10, [20, 30]]))
			.toBe(false)
	})

	it('should return false for an array with wrong structure', () => {
		// 3 elements - not a valid tuple
		expect(isPropertyValue(['a', 'b', 'c'] as any))
			.toBe(false)
	})

	it('should return false for an array with 1 element', () => {
		expect(isPropertyValue(['a'] as any))
			.toBe(false)
	})

	it('should return false for an empty array', () => {
		expect(isPropertyValue([] as any))
			.toBe(false)
	})

	it('should return false for a tuple where second element is not an array', () => {
		expect(isPropertyValue(['red', 'blue'] as any))
			.toBe(false)
	})

	it('should return false for a tuple where fallbacks contain non-property values', () => {
		expect(isPropertyValue(['red', [{ invalid: true }]] as any))
			.toBe(false)
	})

	it('should return false for a tuple with null fallbacks', () => {
		expect(isPropertyValue(['red', [null]] as any))
			.toBe(false)
	})
})

describe('serialize', () => {
	it('should serialize objects', () => {
		expect(serialize({ a: 1, b: 'two' }))
			.toBe('{"a":1,"b":"two"}')
	})

	it('should serialize arrays', () => {
		expect(serialize([1, 2, 3]))
			.toBe('[1,2,3]')
	})

	it('should serialize strings', () => {
		expect(serialize('hello'))
			.toBe('"hello"')
	})

	it('should serialize numbers', () => {
		expect(serialize(42))
			.toBe('42')
	})

	it('should serialize null', () => {
		expect(serialize(null))
			.toBe('null')
	})

	it('should serialize booleans', () => {
		expect(serialize(true))
			.toBe('true')
		expect(serialize(false))
			.toBe('false')
	})

	it('should serialize nested objects', () => {
		expect(serialize({ a: { b: { c: 1 } } }))
			.toBe('{"a":{"b":{"c":1}}}')
	})
})

describe('addToSet', () => {
	it('should add a single value to the set', () => {
		const s = new Set<number>()
		addToSet(s, 1)
		expect(s.has(1))
			.toBe(true)
		expect(s.size)
			.toBe(1)
	})

	it('should add multiple values to the set', () => {
		const s = new Set<number>()
		addToSet(s, 1, 2, 3)
		expect(s.size)
			.toBe(3)
		expect(s.has(1))
			.toBe(true)
		expect(s.has(2))
			.toBe(true)
		expect(s.has(3))
			.toBe(true)
	})

	it('should not duplicate existing values', () => {
		const s = new Set<number>([1, 2])
		addToSet(s, 2, 3)
		expect(s.size)
			.toBe(3)
	})

	it('should handle adding no values', () => {
		const s = new Set<number>([1])
		addToSet(s)
		expect(s.size)
			.toBe(1)
	})

	it('should work with string sets', () => {
		const s = new Set<string>()
		addToSet(s, 'a', 'b', 'a')
		expect(s.size)
			.toBe(2)
	})
})

function createMockAutocompleteConfig(): Pick<ResolvedEngineConfig, 'autocomplete'> {
	return {
		autocomplete: {
			selectors: new Set<string>(),
			styleItemStrings: new Set<string>(),
			extraProperties: new Set<string>(),
			extraCssProperties: new Set<string>(),
			properties: new Map<string, string[]>(),
			cssProperties: new Map<string, string[]>(),
			patterns: {
				selectors: new Set<string>(),
				styleItemStrings: new Set<string>(),
				properties: new Map<string, string[]>(),
				cssProperties: new Map<string, string[]>(),
			},
		},
	}
}

describe('appendAutocomplete', () => {
	it('should append multiple autocomplete sections in one call', () => {
		const config = createMockAutocompleteConfig()
		appendAutocomplete(config, {
			selectors: ['.foo', '.bar'],
			styleItemStrings: 'text-red',
			extraProperties: '__test',
			cssProperties: {
				color: ['red', 'blue'],
			},
			patterns: {
				styleItemStrings: 'i-${string}:${string}',
			},
		})

		expect(config.autocomplete.selectors.has('.foo'))
			.toBe(true)
		expect(config.autocomplete.selectors.has('.bar'))
			.toBe(true)
		expect(config.autocomplete.styleItemStrings.has('text-red'))
			.toBe(true)
		expect(config.autocomplete.extraProperties.has('__test'))
			.toBe(true)
		expect(config.autocomplete.cssProperties.get('color'))
			.toEqual(['red', 'blue'])
		expect(config.autocomplete.patterns.styleItemStrings.has('i-${string}:${string}'))
			.toBe(true)
	})

	it('should normalize tuple-based property entries', () => {
		const config = createMockAutocompleteConfig()
		appendAutocomplete(config, {
			properties: [['variant', ['"solid"', '"ghost"']]],
			cssProperties: [['--brand-color', ['red', 'blue']]],
		})

		expect(config.autocomplete.properties.get('variant'))
			.toEqual(['"solid"', '"ghost"'])
		expect(config.autocomplete.cssProperties.get('--brand-color'))
			.toEqual(['red', 'blue'])
	})

	it('should report whether anything changed', () => {
		const config = createMockAutocompleteConfig()

		expect(appendAutocomplete(config, {}))
			.toBe(false)
		expect(appendAutocomplete(config, { selectors: '.foo' }))
			.toBe(true)
	})
})

describe('renderCSSStyleBlocks', () => {
	it('should render a single block with properties (formatted)', () => {
		const blocks: CSSStyleBlocks = new Map([
			['.foo', { properties: [{ property: 'color', value: 'red' }] }],
		])
		const result = renderCSSStyleBlocks(blocks, true)
		expect(result)
			.toBe('.foo {\n  color: red;\n}')
	})

	it('should render a single block with properties (unformatted)', () => {
		const blocks: CSSStyleBlocks = new Map([
			['.foo', { properties: [{ property: 'color', value: 'red' }] }],
		])
		const result = renderCSSStyleBlocks(blocks, false)
		expect(result)
			.toBe('.foo{color:red;}')
	})

	it('should render multiple properties', () => {
		const blocks: CSSStyleBlocks = new Map([
			['.bar', {
				properties: [
					{ property: 'color', value: 'red' },
					{ property: 'font-size', value: '16px' },
				],
			}],
		])
		const result = renderCSSStyleBlocks(blocks, true)
		expect(result)
			.toBe('.bar {\n  color: red;\n  font-size: 16px;\n}')
	})

	it('should skip empty blocks (no properties, no children)', () => {
		const blocks: CSSStyleBlocks = new Map([
			['.empty', { properties: [] }],
		])
		const result = renderCSSStyleBlocks(blocks, true)
		expect(result)
			.toBe('')
	})

	it('should skip blocks with empty properties and empty children', () => {
		const blocks: CSSStyleBlocks = new Map([
			['.empty', { properties: [], children: new Map() }],
		])
		const result = renderCSSStyleBlocks(blocks, true)
		expect(result)
			.toBe('')
	})

	it('should render nested blocks (formatted)', () => {
		const children: CSSStyleBlocks = new Map([
			['&:hover', { properties: [{ property: 'color', value: 'blue' }] }],
		])
		const blocks: CSSStyleBlocks = new Map([
			['.parent', {
				properties: [{ property: 'color', value: 'red' }],
				children,
			}],
		])
		const result = renderCSSStyleBlocks(blocks, true)
		expect(result)
			.toBe(
				'.parent {\n'
				+ '  color: red;\n'
				+ '  &:hover {\n'
				+ '    color: blue;\n'
				+ '  }\n'
				+ '}',
			)
	})

	it('should render nested blocks (unformatted)', () => {
		const children: CSSStyleBlocks = new Map([
			['&:hover', { properties: [{ property: 'color', value: 'blue' }] }],
		])
		const blocks: CSSStyleBlocks = new Map([
			['.parent', {
				properties: [{ property: 'color', value: 'red' }],
				children,
			}],
		])
		const result = renderCSSStyleBlocks(blocks, false)
		expect(result)
			.toBe('.parent{color:red;&:hover{color:blue;}}')
	})

	it('should render multiple top-level blocks', () => {
		const blocks: CSSStyleBlocks = new Map([
			['.a', { properties: [{ property: 'color', value: 'red' }] }],
			['.b', { properties: [{ property: 'color', value: 'blue' }] }],
		])
		const result = renderCSSStyleBlocks(blocks, true)
		expect(result)
			.toBe('.a {\n  color: red;\n}\n.b {\n  color: blue;\n}')
	})

	it('should render block with only children (no properties)', () => {
		const children: CSSStyleBlocks = new Map([
			['.child', { properties: [{ property: 'display', value: 'flex' }] }],
		])
		const blocks: CSSStyleBlocks = new Map([
			['@media (min-width: 768px)', { properties: [], children }],
		])
		const result = renderCSSStyleBlocks(blocks, true)
		expect(result)
			.toBe(
				'@media (min-width: 768px) {\n'
				+ '  .child {\n'
				+ '    display: flex;\n'
				+ '  }\n'
				+ '}',
			)
	})

	it('should render deeply nested blocks (formatted)', () => {
		const innerChildren: CSSStyleBlocks = new Map([
			['&:focus', { properties: [{ property: 'outline', value: 'none' }] }],
		])
		const children: CSSStyleBlocks = new Map([
			['&:hover', { properties: [{ property: 'color', value: 'blue' }], children: innerChildren }],
		])
		const blocks: CSSStyleBlocks = new Map([
			['.deep', { properties: [{ property: 'color', value: 'red' }], children }],
		])
		const result = renderCSSStyleBlocks(blocks, true)
		expect(result)
			.toBe(
				'.deep {\n'
				+ '  color: red;\n'
				+ '  &:hover {\n'
				+ '    color: blue;\n'
				+ '    &:focus {\n'
				+ '      outline: none;\n'
				+ '    }\n'
				+ '  }\n'
				+ '}',
			)
	})

	it('should handle empty blocks map', () => {
		const blocks: CSSStyleBlocks = new Map()
		expect(renderCSSStyleBlocks(blocks, true))
			.toBe('')
		expect(renderCSSStyleBlocks(blocks, false))
			.toBe('')
	})
})
