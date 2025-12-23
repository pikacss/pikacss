import { createEngine } from '@pikacss/core'
import { describe, expect, it } from 'vitest'
import { reset } from '../src'

describe('plugin-reset', () => {
	it('should add modern-normalize reset by default', async () => {
		const engine = await createEngine({
			plugins: [reset()],
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('box-sizing: border-box')
		expect(css)
			.toContain('tab-size: 4')
	})

	it('should add normalize reset', async () => {
		const engine = await createEngine({
			reset: 'normalize',
			plugins: [reset()],
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('line-height: 1.15')
		expect(css)
			.toContain('-webkit-text-size-adjust: 100%')
	})

	it('should add modern-normalize reset', async () => {
		const engine = await createEngine({
			reset: 'modern-normalize',
			plugins: [reset()],
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('box-sizing: border-box')
		expect(css)
			.toContain('tab-size: 4')
	})

	it('should add eric-meyer reset', async () => {
		const engine = await createEngine({
			reset: 'eric-meyer',
			plugins: [reset()],
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('margin: 0')
		expect(css)
			.toContain('padding: 0')
		expect(css)
			.toContain('border: 0')
	})

	it('should add andy-bell reset', async () => {
		const engine = await createEngine({
			reset: 'andy-bell',
			plugins: [reset()],
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('box-sizing: border-box')
		expect(css)
			.toContain('text-rendering: optimizeSpeed')
	})

	it('should add the-new-css-reset', async () => {
		const engine = await createEngine({
			reset: 'the-new-css-reset',
			plugins: [reset()],
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('all: unset')
		expect(css)
			.toContain('display: revert')
	})
})
