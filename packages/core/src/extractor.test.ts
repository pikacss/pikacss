import { describe, expect, it } from 'vitest'

import { createExtractFn, extract, normalizeSelectors, normalizeValue } from './extractor'

describe('normalizeSelectors', () => {
	it('normalizes selector commas and replaces default selector placeholders without breaking attribute suffix matches', () => {
		expect(normalizeSelectors({
			selectors: ['$:hover, [data-kind$="$"]', '% > $'],
			defaultSelector: '.pk-a',
		}))
			.toEqual(['.pk-a:hover,[data-kind$=".pk-a"]', '% > .pk-a'])
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
