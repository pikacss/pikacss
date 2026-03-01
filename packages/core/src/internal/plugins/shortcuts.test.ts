import { describe, expect, it } from 'vitest'
import { createEngine } from '../engine'

describe('shortcuts plugin', () => {
	describe('static shortcuts', () => {
		it('should resolve a static shortcut to style definitions', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						['flex-center', { display: 'flex', alignItems: 'center', justifyContent: 'center' }],
					],
				},
			})

			const ids = await engine.use('flex-center')
			expect(ids.length)
				.toBe(3)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('display: flex;')
			expect(css)
				.toContain('align-items: center;')
			expect(css)
				.toContain('justify-content: center;')
		})

		it('should resolve a static shortcut with multiple style items', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						['btn', [
							{ display: 'inline-flex', alignItems: 'center' },
							{ padding: '8px 16px', borderRadius: '4px' },
						]],
					],
				},
			})

			const ids = await engine.use('btn')
			expect(ids.length)
				.toBe(4)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('display: inline-flex;')
			expect(css)
				.toContain('align-items: center;')
			expect(css)
				.toContain('padding: 8px 16px;')
			expect(css)
				.toContain('border-radius: 4px;')
		})

		it('should resolve static shortcut using object format', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						{ shortcut: 'text-bold', value: { fontWeight: 'bold' } },
					],
				},
			})

			const ids = await engine.use('text-bold')
			expect(ids.length)
				.toBe(1)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('font-weight: bold;')
		})
	})

	describe('dynamic shortcuts', () => {
		it('should resolve a dynamic regex-based shortcut', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						[/^m-(\d+)$/, m => ({ margin: `${m[1]}px` })],
					],
				},
			})

			const ids = await engine.use('m-16')
			expect(ids.length)
				.toBe(1)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('margin: 16px;')
		})

		it('should resolve dynamic shortcut with autocomplete suggestions', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						[/^p-(\d+)$/, m => ({ padding: `${m[1]}px` }), ['p-4', 'p-8', 'p-16']],
					],
				},
			})

			const ids = await engine.use('p-8')
			expect(ids.length)
				.toBe(1)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('padding: 8px;')
		})

		it('should resolve dynamic shortcut using object format', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						{
							shortcut: /^gap-(\d+)$/,
							value: m => ({ gap: `${m[1]}px` }),
							autocomplete: ['gap-4', 'gap-8'],
						},
					],
				},
			})

			const ids = await engine.use('gap-4')
			expect(ids.length)
				.toBe(1)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('gap: 4px;')
		})
	})

	describe('__shortcut property expansion', () => {
		it('should expand __shortcut in style definitions', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						['flex-center', { display: 'flex', alignItems: 'center', justifyContent: 'center' }],
					],
				},
			})

			const ids = await engine.use({ __shortcut: 'flex-center', color: 'red' } as any)
			// 3 from flex-center + 1 for color
			expect(ids.length)
				.toBe(4)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('display: flex;')
			expect(css)
				.toContain('align-items: center;')
			expect(css)
				.toContain('justify-content: center;')
			expect(css)
				.toContain('color: red;')
		})

		it('should expand __shortcut array in style definitions', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						['flex-center', { display: 'flex', alignItems: 'center', justifyContent: 'center' }],
						['text-bold', { fontWeight: 'bold' }],
					],
				},
			})

			const ids = await engine.use({ __shortcut: ['flex-center', 'text-bold'], color: 'red' } as any)
			// 3 from flex-center + 1 from text-bold + 1 for color
			expect(ids.length)
				.toBe(5)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('display: flex;')
			expect(css)
				.toContain('font-weight: bold;')
			expect(css)
				.toContain('color: red;')
		})
	})

	describe('unresolved shortcuts', () => {
		it('should return unresolved shortcut strings as unknown', async () => {
			const engine = await createEngine()
			const ids = await engine.use('nonexistent-shortcut')
			// Should be returned as unknown string
			expect(ids)
				.toContain('nonexistent-shortcut')
		})
	})

	describe('dynamic add via engine.shortcuts.add', () => {
		it('should allow adding shortcuts dynamically', async () => {
			const engine = await createEngine()
			engine.shortcuts.add(['bold', { fontWeight: 'bold' }])

			const ids = await engine.use('bold')
			expect(ids.length)
				.toBe(1)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('font-weight: bold;')
		})
	})

	describe('engine.shortcuts.add with string passthrough', () => {
		it('should treat a plain string as autocomplete-only', async () => {
			const engine = await createEngine()
			// Adding a plain string registers it for autocomplete but not as a rule
			engine.shortcuts.add('my-shortcut')
			// Since 'my-shortcut' has no rule, it passes through as unresolved
			const ids = await engine.use('my-shortcut')
			expect(ids)
				.toContain('my-shortcut')
		})
	})

	describe('engine.shortcuts.add with invalid config', () => {
		it('should silently skip configs that resolve to null', async () => {
			const engine = await createEngine()
			// Array with string key + function value does not match any valid pattern
			engine.shortcuts.add(['test', (() => 'value') as any] as any)
			// Engine should still function correctly
			const ids = await engine.use({ color: 'green' })
			expect(ids.length)
				.toBe(1)
			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('color: green;')
		})
	})

	describe('__shortcut with null value', () => {
		it('should handle __shortcut: null by skipping shortcut expansion', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						['flex-center', { display: 'flex', alignItems: 'center', justifyContent: 'center' }],
					],
				},
			})

			const ids = await engine.use({ __shortcut: null, color: 'red' } as any)
			// Only 1 id from `color: 'red'`, __shortcut: null is treated as empty
			expect(ids.length)
				.toBe(1)
			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('color: red;')
			expect(css).not.toContain('display: flex;')
		})

		it('should handle __shortcut: undefined by skipping shortcut expansion', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						['flex-center', { display: 'flex' }],
					],
				},
			})

			const ids = await engine.use({ __shortcut: undefined, color: 'blue' } as any)
			expect(ids.length)
				.toBe(1)
			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('color: blue;')
			expect(css).not.toContain('display: flex;')
		})
	})

	describe('error handling in ShortcutResolver.resolve', () => {
		it('should fall back to original shortcut string when resolution throws', async () => {
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						[/^err-(.+)$/, () => { throw new Error('intentional error') }],
					],
				},
			})

			// The error is caught and the original shortcut string is returned as-is
			const ids = await engine.use('err-test')
			expect(ids)
				.toContain('err-test')
		})

		it('should resolve composite shortcut with shared sub-shortcut dependency', async () => {
			// Reproduce the pattern: composite → [sub-a, sub-b], both sub-a/sub-b → [base, ...]
			// where 'base' is shared between siblings. The old visited-set bug would cause
			// 'base' to be returned as an unresolved string in sibling calls.
			const engine = await createEngine({
				shortcuts: {
					shortcuts: [
						['base', { color: 'red' }],
						['sub-a', ['base', { fontSize: '1rem' }]],
						['sub-b', ['base', { fontWeight: 'bold' }]],
						['composite', ['sub-a', 'sub-b']],
					],
				},
			})

			const ids = await engine.use('composite')
			expect(ids.length)
				.toBeGreaterThan(0)
			for (const id of ids) {
				expect(engine.store.atomicStyles.has(id))
					.toBe(true)
			}
		})
	})
})
