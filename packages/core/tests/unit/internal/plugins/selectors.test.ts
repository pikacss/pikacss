import { describe, expect, it } from 'vitest'
import { createEngine } from '../../../../src/internal/engine'

describe('plugin-selectors', () => {
	it('should handle static selectors (array format)', async () => {
		const engine = await createEngine({
			selectors: {
				selectors: [
					['hover', '$:hover'],
				],
			},
		})
		await engine.use({ hover: { color: 'blue' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css).toBe('.a:hover{color:blue;}')
	})

	it('should handle static selectors (object format)', async () => {
		const engine = await createEngine({
			selectors: {
				selectors: [
					{ selector: 'focus', value: '$:focus' },
				],
			},
		})
		await engine.use({ focus: { outline: 'none' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css).toBe('.a:focus{outline:none;}')
	})

	it('should handle dynamic selectors (array format)', async () => {
		const engine = await createEngine({
			selectors: {
				selectors: [
					[/^screen-(\d+)$/, m => `@media (min-width: ${m[1]}px)`],
				],
			},
		})
		await engine.use({ 'screen-768': { width: '100%' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css).toBe('@media (min-width: 768px){.a{width:100%;}}')
	})

	it('should handle dynamic selectors (object format)', async () => {
		const engine = await createEngine({
			selectors: {
				selectors: [
					{ selector: /^dark$/, value: () => '.dark $' },
				],
			},
		})
		await engine.use({ dark: { color: 'black' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css).toBe('.dark .a{color:black;}')
	})

	it('should resolve nested selectors', async () => {
		const engine = await createEngine({
			selectors: {
				selectors: [
					['group-hover', '.group:hover &'],
				],
			},
		})
		await engine.use({ 'group-hover': { color: 'red' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css).toBe('.group:hover &{.a{color:red;}}')
	})
})
