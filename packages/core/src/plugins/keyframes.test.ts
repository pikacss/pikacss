import { describe, expect, it } from 'vitest'

import { createEngine } from '../engine'

describe('keyframes plugin', () => {
	it('registers tuple keyframes for autocomplete and renders them when animation values use the name', async () => {
		const engine = await createEngine({
			keyframes: {
				definitions: [
					['fade', { from: { opacity: '0' }, to: { opacity: '1' } }, ['1s ease-in']],
				],
			},
		})

		await engine.use({ animation: 'fade 1s ease-in' })

		expect(engine.config.autocomplete.cssProperties.get('animationName'))
			.toContain('fade')
		expect(engine.config.autocomplete.cssProperties.get('animation'))
			.toEqual(expect.arrayContaining(['fade ', '1s ease-in']))
		expect(await engine.renderPreflights(false))
			.toContain('@keyframes fade{from{opacity:0;}to{opacity:1;}}')
	})

	it('emits all keyframes referenced by a comma-separated animation-name value', async () => {
		const engine = await createEngine({
			keyframes: {
				definitions: [
					['fade', { from: { opacity: '0' }, to: { opacity: '1' } }],
					['spin', { from: { rotate: '0deg' }, to: { rotate: '360deg' } }],
				],
			},
		})

		await engine.use({ animationName: 'fade, spin' })

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('@keyframes fade')
		expect(css)
			.toContain('@keyframes spin')
	})

	it('scopes keyframes pruning to usedAtomicStyleIds when provided', async () => {
		const engine = await createEngine({
			keyframes: {
				definitions: [
					['spin', { from: { rotate: '0deg' }, to: { rotate: '360deg' } }],
					['fade', { from: { opacity: '0' }, to: { opacity: '1' } }],
				],
			},
		})

		const usedIds = await engine.use({ animationName: 'spin' })
		await engine.use({ animationName: 'fade' })

		const scoped = await engine.renderPreflights(false, { usedAtomicStyleIds: usedIds })
		expect(scoped)
			.toContain('@keyframes spin')
		expect(scoped)
			.not.toContain('@keyframes fade')

		// Without the option the whole store is still considered.
		const full = await engine.renderPreflights(false)
		expect(full)
			.toContain('@keyframes fade')
	})

	it('accepts runtime string keyframes as autocomplete-only entries without registering frames', async () => {
		const engine = await createEngine()

		engine.keyframes.add('spin')
		await engine.use({ animationName: 'spin' })

		expect(engine.keyframes.store.size)
			.toBe(0)
		expect(engine.config.autocomplete.cssProperties.get('animationName'))
			.toContain('spin')
		expect(await engine.renderPreflights(false))
			.toBe('')
	})

	it('keeps object-style keyframes when pruning is disabled globally', async () => {
		const engine = await createEngine({
			keyframes: {
				pruneUnused: false,
				definitions: [
					{
						name: 'pulse',
						frames: { '50%': { opacity: '0.5' } },
						autocomplete: ['0.5s linear'],
					},
				],
			},
		})

		expect(await engine.renderPreflights(false))
			.toContain('@keyframes pulse{50%{opacity:0.5;}}')
		expect(engine.keyframes.store.get('pulse'))
			.toEqual({
				name: 'pulse',
				frames: { '50%': { opacity: '0.5' } },
				pruneUnused: false,
				autocomplete: ['0.5s linear'],
			})
	})
})
