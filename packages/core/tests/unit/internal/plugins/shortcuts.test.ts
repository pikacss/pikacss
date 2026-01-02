import { describe, expect, it } from 'vitest'
import { createEngine } from '../../../../src/internal/engine'

describe('plugin-shortcuts', () => {
	it('should handle static shortcuts (array format)', async () => {
		const engine = await createEngine({
			shortcuts: {
				shortcuts: [
					['flex-center', { display: 'flex', alignItems: 'center', justifyContent: 'center' }],
				],
			},
		})
		await engine.use('flex-center')
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{display:flex;}.b{align-items:center;}.c{justify-content:center;}')
	})

	it('should handle static shortcuts (object format)', async () => {
		const engine = await createEngine({
			shortcuts: {
				shortcuts: [
					{ shortcut: 'btn', value: { padding: '10px', borderRadius: '5px' } },
				],
			},
		})
		await engine.use('btn')
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{padding:10px;}.b{border-radius:5px;}')
	})

	it('should handle dynamic shortcuts (array format)', async () => {
		const engine = await createEngine({
			shortcuts: {
				shortcuts: [
					[/^m-(\d+)$/, m => ({ margin: `${m[1]}px` })],
				],
			},
		})
		await engine.use('m-10')
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{margin:10px;}')
	})

	it('should handle dynamic shortcuts (object format)', async () => {
		const engine = await createEngine({
			shortcuts: {
				shortcuts: [
					{ shortcut: /^p-(\d+)$/, value: m => ({ padding: `${m[1]}px` }) },
				],
			},
		})
		await engine.use('p-20')
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{padding:20px;}')
	})

	it('should resolve nested shortcuts', async () => {
		const engine = await createEngine({
			shortcuts: {
				shortcuts: [
					['card', { padding: '1rem', borderRadius: '8px' }],
					['card-primary', ['card', { backgroundColor: 'blue' }]],
				],
			},
		})
		await engine.use('card-primary')
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{padding:1rem;}.b{border-radius:8px;}.c{background-color:blue;}')
	})

	it('should handle __shortcut property', async () => {
		const engine = await createEngine({
			shortcuts: {
				shortcuts: [
					['flex-center', { display: 'flex', alignItems: 'center', justifyContent: 'center' }],
				],
			},
		})
		await engine.use({ __shortcut: 'flex-center' } as any)
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{display:flex;}.b{align-items:center;}.c{justify-content:center;}')
	})

	it('should ignore invalid shortcuts', async () => {
		const engine = await createEngine({
			shortcuts: {
				shortcuts: [
					// @ts-expect-error Invalid shortcut format
					{ shortcut: 123, value: { color: 'red' } },
				],
			},
		})
		await engine.use('123')
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('')
	})

	it('should handle autocomplete', async () => {
		const engine = await createEngine({
			shortcuts: {
				shortcuts: [
					[/^m-(\d+)$/, m => ({ margin: `${m[1]}px` }), ['m-4', 'm-8']],
				],
			},
		})
		await engine.use('m-4')
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{margin:4px;}')
		const autocomplete = engine.config.autocomplete
		expect(autocomplete.styleItemStrings)
			.toContain('m-4')
		expect(autocomplete.styleItemStrings)
			.toContain('m-8')
	})
})
