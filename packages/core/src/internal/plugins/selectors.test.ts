import { describe, expect, it } from 'vitest'
import { createEngine } from '../engine'
import { resolveSelectorConfig } from './selectors'

describe('resolveSelectorConfig', () => {
	describe('string passthrough', () => {
		it('should return the string as-is', () => {
			const result = resolveSelectorConfig('hover')
			expect(result)
				.toBe('hover')
		})
	})

	describe('static [string, value] tuple', () => {
		it('should resolve to a static rule', () => {
			const result = resolveSelectorConfig(['hover', '$:hover'])
			expect(result)
				.toEqual({
					type: 'static',
					rule: {
						key: 'hover',
						string: 'hover',
						resolved: ['$:hover'],
					},
					autocomplete: ['hover'],
				})
		})

		it('should flatten array value', () => {
			const result = resolveSelectorConfig(['group', ['$:hover', '$.active']])
			expect(result)
				.toEqual({
					type: 'static',
					rule: {
						key: 'group',
						string: 'group',
						resolved: ['$:hover', '$.active'],
					},
					autocomplete: ['group'],
				})
		})
	})

	describe('dynamic [RegExp, fn] tuple', () => {
		it('should resolve to a dynamic rule', () => {
			const fn = (m: RegExpMatchArray) => `@media (min-width: ${m[1]}px)`
			const result = resolveSelectorConfig([/^screen-(\d+)$/, fn])
			expect(result)
				.toMatchObject({
					type: 'dynamic',
					rule: {
						key: '^screen-(\\d+)$',
						stringPattern: /^screen-(\d+)$/,
					},
					autocomplete: [],
				})
		})

		it('should include autocomplete suggestions', () => {
			const fn = (m: RegExpMatchArray) => `@media (min-width: ${m[1]}px)`
			const result = resolveSelectorConfig([/^screen-(\d+)$/, fn, ['screen-768', 'screen-1024']])
			expect(result)
				.toMatchObject({
					type: 'dynamic',
					autocomplete: ['screen-768', 'screen-1024'],
				})
		})

		it('should handle single autocomplete string', () => {
			const fn = (m: RegExpMatchArray) => `@media (min-width: ${m[1]}px)`
			const result = resolveSelectorConfig([/^screen-(\d+)$/, fn, 'screen-768'])
			expect(result)
				.toMatchObject({
					type: 'dynamic',
					autocomplete: ['screen-768'],
				})
		})
	})

	describe('object format - static', () => {
		it('should resolve static object selector', () => {
			const result = resolveSelectorConfig({ selector: 'dark', value: '[data-theme="dark"] $' })
			expect(result)
				.toEqual({
					type: 'static',
					rule: {
						key: 'dark',
						string: 'dark',
						resolved: ['[data-theme="dark"] $'],
					},
					autocomplete: ['dark'],
				})
		})
	})

	describe('object format - dynamic', () => {
		it('should resolve dynamic object selector', () => {
			const fn = (m: RegExpMatchArray) => `@media (min-width: ${m[1]}px)`
			const result = resolveSelectorConfig({
				selector: /^bp-(\d+)$/,
				value: fn,
				autocomplete: ['bp-640', 'bp-1024'],
			})
			expect(result)
				.toMatchObject({
					type: 'dynamic',
					autocomplete: ['bp-640', 'bp-1024'],
				})
		})

		it('should handle dynamic object without autocomplete', () => {
			const fn = (m: RegExpMatchArray) => `@media (min-width: ${m[1]}px)`
			const result = resolveSelectorConfig({
				selector: /^bp-(\d+)$/,
				value: fn,
			})
			expect(result)
				.toMatchObject({
					type: 'dynamic',
					autocomplete: [],
				})
		})
	})
})

describe('selectors plugin (engine integration)', () => {
	describe('static selector via config', () => {
		it('should transform selectors for style definitions', async () => {
			const engine = await createEngine({
				selectors: {
					selectors: [
						['hover', '.%:hover'],
					],
				},
			})

			await engine.use({
				hover: {
					color: 'red',
				},
			} as any)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain(':hover')
			expect(css)
				.toContain('color: red;')
		})
	})

	describe('dynamic selector via config', () => {
		it('should resolve dynamic regex-based selectors', async () => {
			const engine = await createEngine({
				selectors: {
					selectors: [
						[/^screen-(\d+)$/, m => `@media (min-width: ${m[1]}px) { .% }`],
					],
				},
			})

			await engine.use({
				'screen-768': {
					display: 'flex',
				},
			} as any)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('@media (min-width: 768px)')
			expect(css)
				.toContain('display: flex;')
		})
	})

	describe('multiple selectors', () => {
		it('should handle multiple static selectors', async () => {
			const engine = await createEngine({
				selectors: {
					selectors: [
						['hover', '.%:hover'],
						['focus', '.%:focus'],
					],
				},
			})

			await engine.use({
				hover: { color: 'red' },
			} as any)
			await engine.use({
				focus: { color: 'blue' },
			} as any)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain(':hover')
			expect(css)
				.toContain(':focus')
		})
	})

	describe('dynamic add via engine.selectors.add', () => {
		it('should allow adding selectors dynamically', async () => {
			const engine = await createEngine()
			engine.selectors.add(['active', '.%:active'])
			await engine.use({
				active: { color: 'green' },
			} as any)

			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain(':active')
			expect(css)
				.toContain('color: green;')
		})
	})

	describe('default selector', () => {
		it('should use .% as the default selector template', async () => {
			const engine = await createEngine()
			await engine.use({ color: 'red' })

			const css = await engine.renderAtomicStyles(true)
			// The default selector is `.%` where % is replaced with the atomic style ID
			expect(css)
				.toMatch(/\.[a-z]+/i)
			expect(css)
				.toContain('color: red;')
		})
	})

	describe('engine.selectors.add with string passthrough', () => {
		it('should treat a plain string as autocomplete-only', async () => {
			const engine = await createEngine()
			// Adding a plain string registers it for autocomplete but not as a rule
			engine.selectors.add('my-custom-selector')
			await engine.use({ 'my-custom-selector': { color: 'red' } } as any)
			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('color: red;')
		})
	})

	describe('engine.selectors.add with invalid config', () => {
		it('should silently skip configs that resolve to null', async () => {
			const engine = await createEngine()
			// Array with string key + function value does not match any valid pattern
			engine.selectors.add(['test', (() => 'value') as any] as any)
			// Engine should still function correctly
			await engine.use({ color: 'blue' })
			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('color: blue;')
		})
	})

	describe('recursive selector resolution', () => {
		it('should resolve selectors that reference other selectors recursively', async () => {
			const engine = await createEngine({
				selectors: {
					selectors: [
						['base-hover', '.%:hover'],
						['alias-hover', 'base-hover'],
					],
				},
			})

			await engine.use({ 'alias-hover': { color: 'green' } } as any)
			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain(':hover')
			expect(css)
				.toContain('color: green;')
		})
	})

	describe('error handling in SelectorResolver.resolve', () => {
		it('should fall back to original selector when resolution throws', async () => {
			const engine = await createEngine({
				selectors: {
					selectors: [
						[/^err-(.+)$/, () => { throw new Error('intentional error') }],
					],
				},
			})

			await engine.use({ 'err-test': { color: 'red' } } as any)
			const css = await engine.renderAtomicStyles(true)
			// The error is caught and the original selector is used as-is
			expect(css)
				.toContain('color: red;')
		})

		it('should fall back to original selector when async resolution rejects', async () => {
			const engine = await createEngine({
				selectors: {
					selectors: [
						[/^err-(.+)$/, async () => Promise.reject(new Error('intentional async error'))],
					],
				},
			})

			await engine.use({ 'err-test': { color: 'red' } } as any)
			const css = await engine.renderAtomicStyles(true)
			expect(css)
				.toContain('color: red;')
		})
	})
})

describe('resolveSelectorConfig edge cases', () => {
	it('should return undefined for array with string key and function value', () => {
		// [string, function] does not match [string, value] or [RegExp, function]
		const result = resolveSelectorConfig(['test', () => 'value'] as any)
		expect(result)
			.toBeUndefined()
	})

	it('should return undefined for object with string selector and function value', () => {
		// { selector: string, value: function } is not a valid config
		const result = resolveSelectorConfig({ selector: 'test', value: () => 'value' } as any)
		expect(result)
			.toBeUndefined()
	})
})
