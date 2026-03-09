import { createEngine } from '@pikacss/core'
import { describe, expect, it } from 'vitest'
import { reset } from './index'
import andyBell from './resets/andy-bell'
import ericMeyer from './resets/eric-meyer'
import modernNormalize from './resets/modern-normalize'
import normalize from './resets/normalize'
import theNewCssReset from './resets/the-new-css-reset'

function expectResetPreflight(css: string, resetCss: string) {
	expect(css)
		.toContain('@layer reset {')
	expect(css)
		.toContain(resetCss.trim())
}

describe('reset plugin', () => {
	it('should have plugin name "reset"', () => {
		const plugin = reset()
		expect(plugin.name)
			.toBe('reset')
	})

	it('should have order "pre"', () => {
		const plugin = reset()
		expect(plugin.order)
			.toBe('pre')
	})

	it('should use "modern-normalize" as default reset style', async () => {
		const engine = await createEngine({
			plugins: [reset()],
		})
		const css = await engine.renderPreflights(false)
		expectResetPreflight(css, modernNormalize)
	})

	it('should apply "andy-bell" reset when configured', async () => {
		const engine = await createEngine({
			reset: 'andy-bell',
			plugins: [reset()],
		})
		const css = await engine.renderPreflights(false)
		expectResetPreflight(css, andyBell)
	})

	it('should apply "eric-meyer" reset when configured', async () => {
		const engine = await createEngine({
			reset: 'eric-meyer',
			plugins: [reset()],
		})
		const css = await engine.renderPreflights(false)
		expectResetPreflight(css, ericMeyer)
	})

	it('should apply "normalize" reset when configured', async () => {
		const engine = await createEngine({
			reset: 'normalize',
			plugins: [reset()],
		})
		const css = await engine.renderPreflights(false)
		expectResetPreflight(css, normalize)
	})

	it('should apply "the-new-css-reset" when configured', async () => {
		const engine = await createEngine({
			reset: 'the-new-css-reset',
			plugins: [reset()],
		})
		const css = await engine.renderPreflights(false)
		expectResetPreflight(css, theNewCssReset)
	})

	it('should add preflight containing the reset CSS', async () => {
		const engine = await createEngine({
			plugins: [reset()],
		})
		// Preflights should have been added by the plugin
		expect(engine.config.preflights.length)
			.toBeGreaterThan(0)
		const css = await engine.renderPreflights(false)
		expect(css.length)
			.toBeGreaterThan(0)
	})
})
