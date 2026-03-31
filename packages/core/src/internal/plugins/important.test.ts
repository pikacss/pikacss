import { describe, expect, it } from 'vitest'

import { important } from './important'

describe('important plugin', () => {
	it('registers the __important autocomplete contract during engine configuration', async () => {
		const plugin = important()
		const contributions: unknown[] = []

		await plugin.configureEngine?.({
			appendAutocomplete(contribution: unknown) {
				contributions.push(contribution)
			},
		} as any)

		expect(contributions)
			.toEqual([
				{
					extraProperties: '__important',
					properties: { __important: 'boolean' },
				},
			])
	})

	it('leaves style definitions unchanged when important is disabled by default', () => {
		const plugin = important()
		plugin.rawConfigConfigured?.({})

		const styleDefinitions = [
			{ color: 'red', nested: { color: 'blue' } },
		]

		expect(plugin.transformStyleDefinitions?.(styleDefinitions as any))
			.toEqual(styleDefinitions)
	})

	it('appends !important to string, tuple, and nullish property values when the global default is enabled', () => {
		const plugin = important()
		plugin.rawConfigConfigured?.({ important: { default: true } })

		const styleDefinitions = [
			{
				color: 'red',
				margin: ['1rem', ['2rem', '3rem']],
				padding: null,
				nested: { color: 'blue' },
			},
		]

		expect(plugin.transformStyleDefinitions?.(styleDefinitions as any))
			.toEqual([
				{
					color: 'red !important',
					margin: ['1rem !important', ['2rem !important', '3rem !important']],
					padding: null,
					nested: { color: 'blue' },
				},
			])
	})

	it('lets a style definition opt out of the global default with __important set to false', () => {
		const plugin = important()
		plugin.rawConfigConfigured?.({ important: { default: true } })

		expect(plugin.transformStyleDefinitions?.([
			{ color: 'red', __important: false },
		] as any))
			.toEqual([
				{ color: 'red' },
			])
	})

	it('adds !important for one style definition when __important is true even if the global default is disabled', () => {
		const plugin = important()
		plugin.rawConfigConfigured?.({ important: { default: false } })

		expect(plugin.transformStyleDefinitions?.([
			{ color: 'red', __important: true },
		] as any))
			.toEqual([
				{ color: 'red !important' },
			])
	})

	it('does not duplicate !important markers that are already present in property values', () => {
		const plugin = important()
		plugin.rawConfigConfigured?.({ important: { default: true } })

		expect(plugin.transformStyleDefinitions?.([
			{ color: 'red !important', margin: ['1rem !important', ['2rem !important']] },
		] as any))
			.toEqual([
				{ color: 'red !important', margin: ['1rem !important', ['2rem !important']] },
			])
	})
})
