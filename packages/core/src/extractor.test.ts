import { describe, expect, it, vi } from 'vitest'

import { createExtractFn, extract, normalizeSelectors, normalizeValue } from './extractor'

describe('normalizeSelectors', () => {
	it('normalizes selector commas and replaces default selector placeholders without breaking attribute suffix matches', () => {
		expect(normalizeSelectors({
			selectors: ['$:hover, [data-kind$="$"]', '% > $'],
			defaultSelector: '.pk-a',
		}))
			.toEqual(['.pk-a:hover,[data-kind$="$"]', '% > .pk-a'])
	})

	it('leaves quoted content untouched during comma and placeholder normalization', () => {
		expect(normalizeSelectors({
			selectors: ['[data-title="a, b"] $', '[data-price="$5"] $', '[data-x=\'50%\'] $'],
			defaultSelector: '.%',
		}))
			.toEqual(['[data-title="a, b"] .%', '[data-price="$5"] .%', '[data-x=\'50%\'] .%'])
	})

	it('treats digit-prefixed percent signs as literal percentages', () => {
		expect(normalizeSelectors({
			selectors: ['@supports (width: 50%)'],
			defaultSelector: '.%',
		}))
			.toEqual(['@supports (width: 50%)'])
	})

	it('treats escaped quotes outside quoted segments as literal characters', () => {
		expect(normalizeSelectors({
			selectors: ['.it\\\'s $', '.a\\"b $'],
			defaultSelector: '.%',
		}))
			.toEqual(['.it\\\'s .%', '.a\\"b .%'])
	})
})

describe('normalizeValue', () => {
	it('trims strings, preserves nullish values, and deduplicates fallback tuples', () => {
		expect(normalizeValue(null))
			.toBeNull()
		expect(normalizeValue(' red '))
			.toEqual(['red'])
		expect(normalizeValue([' 1rem ', [' 2rem ', '1rem', ' 2rem ']]))
			.toEqual(['2rem', '1rem'])
	})

	it('converts numeric values and numeric fallback tuples to strings', () => {
		expect(normalizeValue(0))
			.toEqual(['0'])
		expect(normalizeValue(['auto', [0]]))
			.toEqual(['0', 'auto'])
	})
})

describe('extract', () => {
	it('extracts property values from nested definitions, array items, and selectors without placeholders', async () => {
		const result = await extract({
			styleDefinition: {
				color: ' red ',
				hover: {
					backgroundColor: ' blue ',
				},
				variants: [
					'ignore-me',
					{ margin: [' 1rem ', [' 2rem ', '1rem']] },
				],
			},
			defaultSelector: '.pk-a',
			transformSelectors: async (selectors) => {
				if (selectors.length === 0)
					return []
				if (selectors[0] === 'hover')
					return ['%:hover']
				return ['.scope']
			},
			transformStyleItems: async styleItems => styleItems,
			transformStyleDefinitions: async styleDefinitions => styleDefinitions,
		})

		expect(result)
			.toEqual([
				{ selector: ['.pk-a'], property: 'color', value: ['red'] },
				{ selector: ['%:hover'], property: 'background-color', value: ['blue'] },
				{ selector: ['.scope', '.pk-a'], property: 'margin', value: ['2rem', '1rem'] },
			])
	})

	it('invokes transformSelectors once per scope instead of once per property', async () => {
		const transformSelectors = vi.fn(async (selectors: string[]) => selectors)

		const result = await extract({
			styleDefinition: {
				'color': 'red',
				'margin': '1px',
				'padding': '2px',
				'&:hover': {
					color: 'blue',
					background: 'green',
				},
			},
			defaultSelector: '.pk-a',
			transformSelectors,
			transformStyleItems: async styleItems => styleItems,
			transformStyleDefinitions: async styleDefinitions => styleDefinitions,
		})

		// One call for the root scope (3 sibling properties) and one for the
		// nested scope (2 sibling properties) — not one per property.
		expect(transformSelectors)
			.toHaveBeenCalledTimes(2)
		expect(result)
			.toHaveLength(5)
		expect(result.filter(content => content.selector.length === 1 && content.selector[0] === '.pk-a'))
			.toHaveLength(3)
		expect(result.filter(content => content.selector[0] === '&:hover'))
			.toHaveLength(2)
	})

	it('creates reusable extract functions with shared transform options', async () => {
		const extractFn = createExtractFn({
			defaultSelector: '.pk-a',
			transformSelectors: async () => ['.wrapper'],
			transformStyleItems: async styleItems => styleItems,
			transformStyleDefinitions: async styleDefinitions => [
				...styleDefinitions,
				{ paddingTop: '1rem' },
			],
		})

		expect(await extractFn({ color: 'red' }))
			.toEqual([
				{ selector: ['.wrapper', '.pk-a'], property: 'color', value: ['red'] },
				{ selector: ['.wrapper', '.pk-a'], property: 'padding-top', value: ['1rem'] },
			])
	})
})
