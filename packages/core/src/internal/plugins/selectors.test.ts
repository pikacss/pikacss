import { describe, expect, it } from 'vitest'

import { createEngine } from '../engine'

describe('selectors plugin', () => {
	it('registers string, static, and dynamic selectors and records resolved dynamic selectors for autocomplete', async () => {
		const engine = await createEngine({
			selectors: {
				definitions: [
					'group',
					['hover', '$:hover'],
					[/^child-(\d+)$/, matched => `$:nth-child(${matched[1]})`, ['child-2']],
				],
			},
		})

		expect(engine.config.autocomplete.selectors.has('group'))
			.toBe(true)
		expect(engine.config.autocomplete.selectors.has('child-2'))
			.toBe(true)

		expect(await engine.pluginHooks.transformSelectors(engine.config.plugins, ['group', 'hover', 'child-3']))
			.toEqual(['group', '$:hover', '$:nth-child(3)'])
		expect(engine.config.autocomplete.selectors.has('child-3'))
			.toBe(true)
	})

	it('ignores invalid selector configs added at runtime', async () => {
		const engine = await createEngine()

		engine.selectors.add({ selector: 123, value: 'bad' } as any)
		engine.selectors.resolver.onResolved('hover', 'static', { value: ['$:hover'] })

		expect(await engine.pluginHooks.transformSelectors(engine.config.plugins, ['missing']))
			.toEqual(['missing'])
		expect(engine.config.autocomplete.selectors.has('hover'))
			.toBe(false)
	})
})
