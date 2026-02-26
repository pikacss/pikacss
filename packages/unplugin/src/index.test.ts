import type { UnpluginOptions } from 'unplugin'
import { describe, expect, it } from 'vitest'
import { unpluginPika as plugin, unpluginFactory } from './index'

describe('unpluginPika', () => {
	it('should export unpluginFactory as a function', () => {
		expect(typeof unpluginFactory)
			.toBe('function')
	})

	it('should export plugin as default', () => {
		expect(plugin)
			.toBeDefined()
	})

	describe('unpluginFactory', () => {
		it('should create a plugin with the correct name', () => {
			const plugin = unpluginFactory(undefined, { framework: 'vite' } as any) as UnpluginOptions
			expect(plugin.name)
				.toBe('unplugin-pikacss')
		})

		it('should handle empty options', () => {
			const plugin = unpluginFactory(undefined, { framework: 'vite' } as any) as UnpluginOptions
			expect(plugin)
				.toBeDefined()
			expect(plugin.name)
				.toBe('unplugin-pikacss')
		})

		it('should handle custom options', () => {
			const plugin = unpluginFactory({
				fnName: 'css',
				transformedFormat: 'array',
				scan: { include: ['**/*.tsx'], exclude: ['dist/**'] },
			}, { framework: 'vite' } as any) as UnpluginOptions
			expect(plugin)
				.toBeDefined()
			expect(plugin.name)
				.toBe('unplugin-pikacss')
		})

		it('should set up watchChange handler', () => {
			const plugin = unpluginFactory(undefined, { framework: 'vite' } as any) as UnpluginOptions
			expect(typeof plugin.watchChange)
				.toBe('function')
		})

		it('should have transform handler', () => {
			const plugin = unpluginFactory(undefined, { framework: 'vite' } as any) as UnpluginOptions
			expect(plugin.transform)
				.toBeDefined()
		})

		it('should have buildStart handler', () => {
			const plugin = unpluginFactory(undefined, { framework: 'vite' } as any) as UnpluginOptions
			expect(typeof plugin.buildStart)
				.toBe('function')
		})
	})
})
