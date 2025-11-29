import { describe, expect, it } from 'vitest'
import { createEngine } from '../../../../src/internal/engine'

describe('plugin-important', () => {
	it('should not add !important by default', async () => {
		const engine = await createEngine()
		await engine.use({ color: 'red' })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{color:red;}')
	})

	it('should add !important when __important is true', async () => {
		const engine = await createEngine()
		await engine.use({ color: 'red', __important: true } as any)
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{color:red !important;}')
	})

	it('should add !important when configured by default', async () => {
		const engine = await createEngine({ important: { default: true } })
		await engine.use({ color: 'red' })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{color:red !important;}')
	})

	it('should not add !important when __important is false and configured by default', async () => {
		const engine = await createEngine({ important: { default: true } })
		await engine.use({ color: 'red', __important: false } as any)
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{color:red;}')
	})
})
