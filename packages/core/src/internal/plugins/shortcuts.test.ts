import { describe, expect, it } from 'vitest'

import { createEngine } from '../engine'

describe('shortcuts plugin', () => {
	it('resolves shortcut strings in style items and __shortcut definitions while exposing autocomplete metadata', async () => {
		const engine = await createEngine({
			shortcuts: {
				shortcuts: [
					'plain',
					['btn', { display: 'flex', alignItems: 'center' }],
					[/^m-(\d+)$/, matched => ({ margin: `${matched[1]}px` }), ['m-4']],
				],
			},
		})

		const ids = await engine.use('plain', 'm-4', { __shortcut: ['btn', 'plain'], color: 'red' })
		const css = await engine.renderAtomicStyles(false, { atomicStyleIds: ids })

		expect(ids)
			.toContain('plain')
		expect(css)
			.toContain('margin:4px;')
		expect(css)
			.toContain('display:flex;')
		expect(css)
			.toContain('align-items:center;')
		expect(css)
			.toContain('color:red;')
		expect(engine.config.autocomplete.extraProperties.has('__shortcut'))
			.toBe(true)
		expect(engine.config.autocomplete.shortcuts.has('m-4'))
			.toBe(true)
	})

	it('ignores invalid shortcut configs added at runtime', async () => {
		const engine = await createEngine()

		engine.shortcuts.add({ shortcut: 123, value: 'bad' } as any)
		engine.shortcuts.resolver.onResolved('btn', 'static', { value: [{ display: 'flex' }] as any })
		const firstIds = await engine.use({ color: 'red' })
		const secondIds = await engine.use({ __shortcut: null, color: 'blue' } as any)

		expect(firstIds)
			.toHaveLength(1)
		expect(await engine.renderAtomicStyles(false, { atomicStyleIds: firstIds }))
			.toContain('color:red;')
		expect(engine.config.autocomplete.shortcuts.has('btn'))
			.toBe(false)
		expect(secondIds)
			.toHaveLength(1)
		expect(await engine.renderAtomicStyles(false, { atomicStyleIds: secondIds }))
			.toContain('color:blue;')
	})
})
