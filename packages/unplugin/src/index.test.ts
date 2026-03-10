import type { UnpluginOptions } from 'unplugin'
import process from 'node:process'
import { resolve } from 'pathe'
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

		it('should resolve virtual CSS module to the default filename when cssCodegen is true', async () => {
			const plugin = unpluginFactory({ config: {}, cssCodegen: true }, { framework: 'vite' } as any) as UnpluginOptions
			const resolveId = plugin.resolveId as ((id: string) => Promise<string | null>) | undefined
			const resolved = await resolveId?.call({}, 'pika.css')
			expect(resolved)
				.toBe(resolve(process.cwd(), 'pika.gen.css'))
		})

		it('should resolve virtual CSS module to custom cssCodegen path', async () => {
			const plugin = unpluginFactory({ config: {}, cssCodegen: '/tmp/pika.gen.custom.css' }, { framework: 'vite' } as any) as UnpluginOptions
			const resolveId = plugin.resolveId as ((id: string) => Promise<string | null>) | undefined
			const resolved = await resolveId?.call({}, 'pika.css')
			expect(resolved)
				.toBe('/tmp/pika.gen.custom.css')
		})

		it('should resolve virtual CSS module relative to the resolved vite root', async () => {
			const plugin = unpluginFactory({ config: {}, cssCodegen: true }, { framework: 'vite' } as any) as UnpluginOptions & {
				vite?: { configResolved?: (config: { root: string, command: 'build' | 'serve' }) => void }
			}
			plugin.vite?.configResolved?.({ root: '/tmp/app', command: 'build' })
			const resolveId = plugin.resolveId as ((id: string) => Promise<string | null>) | undefined
			const resolved = await resolveId?.call({}, 'pika.css')
			expect(resolved)
				.toBe('/tmp/app/pika.gen.css')
		})
	})
})
