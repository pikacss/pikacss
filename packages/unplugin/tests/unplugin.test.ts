import { describe, expect, it } from 'vitest'
import unplugin, { unpluginFactory } from '../src/core'

describe('@pikacss/unplugin-pikacss', () => {
	it('exports unplugin factory', () => {
		expect(unpluginFactory)
			.toBeDefined()
		expect(typeof unpluginFactory)
			.toBe('function')
	})

	it('exports unplugin instance', () => {
		expect(unplugin)
			.toBeDefined()
		expect(unplugin.vite)
			.toBeDefined()
		expect(unplugin.rollup)
			.toBeDefined()
		expect(unplugin.webpack)
			.toBeDefined()
		expect(unplugin.esbuild)
			.toBeDefined()
		expect(unplugin.rspack)
			.toBeDefined()
	})

	it('creates vite plugin factory', () => {
		const vitePlugin = unplugin.vite
		expect(typeof vitePlugin)
			.toBe('function')
	})

	it('creates rollup plugin factory', () => {
		const rollupPlugin = unplugin.rollup
		expect(typeof rollupPlugin)
			.toBe('function')
	})
})
