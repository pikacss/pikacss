import { describe, expect, it, vi } from 'vitest'

import {
	addToSet,
	appendAutocomplete,
	appendAutocompleteEntries,
	appendAutocompleteRecordEntries,
	createLogger,
	isNotNullish,
	isNotString,
	isPropertyValue,
	isString,
	numberToChars,
	renderCSSStyleBlocks,
	serialize,
	toKebab,
} from './utils'

describe('createLogger', () => {
	it('respects debug toggling, custom prefixes, and output handlers', () => {
		const debug = vi.fn()
		const info = vi.fn()
		const warn = vi.fn()
		const error = vi.fn()
		const logger = createLogger('[Test]')

		logger.setDebugFn(debug)
		logger.setInfoFn(info)
		logger.setWarnFn(warn)
		logger.setErrorFn(error)

		logger.debug('hidden')
		expect(debug)
			.not.toHaveBeenCalled()

		logger.toggleDebug()
		logger.debug('visible')
		logger.setPrefix('[Next]')
		logger.info('info')
		logger.warn('warn')
		logger.error('error')

		expect(debug)
			.toHaveBeenCalledWith('[Test][DEBUG]', 'visible')
		expect(info)
			.toHaveBeenCalledWith('[Next][INFO]', 'info')
		expect(warn)
			.toHaveBeenCalledWith('[Next][WARN]', 'warn')
		expect(error)
			.toHaveBeenCalledWith('[Next][ERROR]', 'error')
	})
})

describe('basic utilities', () => {
	it('handles string conversion and predicate helpers across edge cases', () => {
		expect(numberToChars(0))
			.toBe('a')
		expect(numberToChars(51))
			.toBe('Z')
		expect(numberToChars(52))
			.toBe('aa')

		expect(toKebab('backgroundColor'))
			.toBe('background-color')
		expect(toKebab('--token'))
			.toBe('--token')

		expect(isNotNullish('value'))
			.toBe(true)
		expect(isNotNullish(null))
			.toBe(false)
		expect(isString('value'))
			.toBe(true)
		expect(isString(1))
			.toBe(false)
		expect(isNotString('value'))
			.toBe(false)
		expect(isNotString({}))
			.toBe(true)

		expect(isPropertyValue(['1rem', ['2rem']]))
			.toBe(true)
		expect(isPropertyValue(['1rem']))
			.toBe(false)
		expect(isPropertyValue(null))
			.toBe(true)
		expect(isPropertyValue('red'))
			.toBe(true)
		expect(isPropertyValue({ color: 'red' }))
			.toBe(false)

		expect(serialize({ color: 'red' }))
			.toBe('{"color":"red"}')
	})

	it('appends autocomplete literals and record entries while skipping empty or missing values', () => {
		const config = {
			autocomplete: {
				selectors: new Set<string>(),
				shortcuts: new Set<string>(),
				extraProperties: new Set<string>(),
				extraCssProperties: new Set<string>(),
				properties: new Map<string, string[]>(),
				cssProperties: new Map<string, string[]>(),
				patterns: {
					selectors: new Set<string>(),
					shortcuts: new Set<string>(),
					properties: new Map<string, string[]>(),
					cssProperties: new Map<string, string[]>(),
				},
			},
		}

		expect(addToSet(config.autocomplete.selectors, 'hover', 'hover'))
			.toBe(true)
		expect(addToSet(config.autocomplete.selectors, 'hover'))
			.toBe(false)
		expect(appendAutocompleteEntries(config.autocomplete.shortcuts, ['m-4', 'm-8']))
			.toBe(true)
		expect(appendAutocompleteEntries(config.autocomplete.shortcuts))
			.toBe(false)
		expect(appendAutocompleteRecordEntries(config.autocomplete.properties, { __layer: 'string', empty: [] }))
			.toBe(true)
		expect(config.autocomplete.properties.get('empty'))
			.toBeUndefined()
		expect(appendAutocompleteRecordEntries(config.autocomplete.properties))
			.toBe(false)

		expect(appendAutocomplete(config as any, {
			selectors: 'focus',
			shortcuts: ['btn'],
			extraProperties: '__shortcut',
			extraCssProperties: '--brand',
			properties: [['__important', 'boolean']],
			cssProperties: { color: ['var(--brand)'] },
			patterns: {
				selectors: ['^group-'],
				shortcuts: ['^space-'],
				properties: { __size: ['number'] },
				cssProperties: { backgroundColor: 'var(--brand)' },
			},
		}))
			.toBe(true)

		expect(config.autocomplete.selectors)
			.toEqual(new Set(['hover', 'focus']))
		expect(config.autocomplete.properties.get('__important'))
			.toEqual(['boolean'])
		expect(config.autocomplete.patterns.cssProperties.get('backgroundColor'))
			.toEqual(['var(--brand)'])
	})

	it('renders nested CSS blocks and skips empty selectors', () => {
		const blocks = new Map([
			['.empty', { properties: [], children: new Map() }],
			['.card', {
				properties: [{ property: 'color', value: 'red' }],
				children: new Map([
					['&:hover', {
						properties: [{ property: 'color', value: 'blue' }],
					}],
				]),
			}],
		]) as any

		expect(renderCSSStyleBlocks(blocks, false))
			.toBe('.card{color:red;&:hover{color:blue;}}')
		expect(renderCSSStyleBlocks(blocks, true))
			.toBe('.card {\n  color: red;\n  &:hover {\n    color: blue;\n  }\n}')
	})
})
