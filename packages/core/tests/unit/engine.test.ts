import { describe, expect, it } from 'vitest'
import { createEngine, defineEngineConfig } from '../../src/internal/engine'

describe('defineEngineConfig', () => {
	it('should return the same config object', () => {
		const config = {
			plugins: [],
		}
		expect(defineEngineConfig(config))
			.toBe(config)
	})
})

describe('createEngine', () => {
	it('should return a valid engine instance', async () => {
		const engine = await createEngine()
		expect(engine)
			.toBeDefined()
		expect(engine.config)
			.toBeDefined()
		expect(engine.extract)
			.toBeDefined()
		expect(engine.store)
			.toBeDefined()
	})

	it('should generate correct css', async () => {
		const engine = await createEngine()
		await engine.use({ display: 'flex' })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a{display:flex;}')
	})

	it('should handle nested styles', async () => {
		const engine = await createEngine()
		await engine.use({ div: { color: 'red' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('div{.a{color:red;}}')
	})

	it('should handle media queries', async () => {
		const engine = await createEngine()
		await engine.use({ '@media (min-width: 768px)': { color: 'red' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('@media (min-width: 768px){.a{color:red;}}')
	})

	it('should handle pseudo-class selectors', async () => {
		const engine = await createEngine()
		await engine.use({ '$:hover': { color: 'blue' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a:hover{color:blue;}')
	})

	it('should handle pseudo-element selectors', async () => {
		const engine = await createEngine()
		await engine.use({ '$::before': { content: '"*"' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a::before{content:"*";}')
	})

	it('should handle CSS combinators', async () => {
		const engine = await createEngine()
		await engine.use({ '$ > span': { color: 'red' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a > span{color:red;}')
	})

	it('should handle class combinations', async () => {
		const engine = await createEngine()
		await engine.use({ '$.active': { color: 'red' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('.a.active{color:red;}')
	})

	it('should handle parent element selectors', async () => {
		const engine = await createEngine()
		await engine.use({ 'div > $': { color: 'red' } })
		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toBe('div > .a{color:red;}')
	})
})
