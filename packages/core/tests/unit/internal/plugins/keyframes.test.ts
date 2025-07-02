import { describe, expect, it } from 'vitest'
import { createEngine } from '../../../../src/internal/engine'

describe('plugin-keyframes', () => {
	it('should add keyframes from config and render them as preflights', async () => {
		const engine = await createEngine({
			keyframes: {
				keyframes: [
					['fade', { from: { opacity: 0 }, to: { opacity: 1 } }],
				],
			},
		})
		await engine.use({ animation: 'fade 1s' })
		const css = await engine.renderPreflights(false)
		expect(css).toContain('@keyframes fade{from{opacity:0;}to{opacity:1;}}')
	})

	it('should add keyframes dynamically and render them as preflights', async () => {
		const engine = await createEngine()
		engine.keyframes.add(['slide', { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } }])
		await engine.use({ animation: 'slide 1s' })
		const css = await engine.renderPreflights(false)
		expect(css).toContain('@keyframes slide{from{transform:translateX(-100%);}to{transform:translateX(0);}}')
	})

	it('should handle string keyframe definition', async () => {
		const engine = await createEngine()
		engine.keyframes.add('bounce')
		await engine.use({ animation: 'bounce 1s' })
		// String keyframes don't have frames, so they won't be rendered as preflights
		const css = await engine.renderPreflights(false)
		expect(css).not.toContain('@keyframes bounce')
	})

	it('should prune unused keyframes by default', async () => {
		const engine = await createEngine({
			keyframes: {
				keyframes: [
					['unused', { from: { opacity: 0 }, to: { opacity: 1 } }],
				],
			},
		})
		const css = await engine.renderPreflights(false)
		expect(css).not.toContain('@keyframes unused')
	})

	it('should not prune unused keyframes when pruneUnused is false', async () => {
		const engine = await createEngine({
			keyframes: {
				keyframes: [
					['always-there', { from: { opacity: 0 }, to: { opacity: 1 } }, [], false],
				],
			},
		})
		await engine.use({ animation: 'always-there 1s' })
		const css = await engine.renderPreflights(false)
		expect(css).toContain('@keyframes always-there{from{opacity:0;}to{opacity:1;}}')
	})
})
