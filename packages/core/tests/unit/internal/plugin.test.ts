import type { EnginePlugin } from '../../../src/internal/plugin'
import { describe, expect, it, vi } from 'vitest'
import { defineEnginePlugin, execAsyncHook, execSyncHook, resolvePlugins } from '../../../src/internal/plugin'

describe('plugin', () => {
	describe('execAsyncHook', () => {
		it('should execute async hooks and return the payload', async () => {
			const plugin1: EnginePlugin = { name: 'plugin1', configureRawConfig: async (config: any) => ({ ...config, p1: true }) }
			const plugin2: EnginePlugin = { name: 'plugin2', configureRawConfig: async (config: any) => ({ ...config, p2: true }) }
			const plugins = [plugin1, plugin2]
			const payload = { initial: true }
			const result = await execAsyncHook(plugins, 'configureRawConfig', payload)
			expect(result).toEqual({ initial: true, p1: true, p2: true })
		})

		it('should handle plugins without the hook', async () => {
			const plugin1: EnginePlugin = { name: 'plugin1' }
			const plugins = [plugin1]
			const payload = { initial: true }
			const result = await execAsyncHook(plugins, 'configureRawConfig', payload)
			expect(result).toEqual({ initial: true })
		})

		it('should handle errors and warn', async () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			const plugin1: EnginePlugin = { name: 'plugin1', configureRawConfig: () => Promise.reject(new Error('test error')) }
			const plugins = [plugin1]
			const payload = { initial: true }
			const result = await execAsyncHook(plugins, 'configureRawConfig', payload)
			expect(warnSpy).toHaveBeenCalledWith('[@pikacss/core]', 'Plugin "plugin1" failed to execute hook "configureRawConfig": test error', expect.any(Error))
			expect(result).toEqual({ initial: true })
			warnSpy.mockRestore()
		})

		it('should handle nullish return values', async () => {
			const plugin1: EnginePlugin = { name: 'plugin1', configureRawConfig: async () => {} }
			const plugins = [plugin1]
			const payload = { initial: true }
			const result = await execAsyncHook(plugins, 'configureRawConfig', payload)
			expect(result).toEqual({ initial: true })
		})
	})

	describe('execSyncHook', () => {
		it('should execute sync hooks and return the payload', () => {
			const plugin1: EnginePlugin = { name: 'plugin1', rawConfigConfigured: (config: any) => ({ ...config, p1: true }) }
			const plugin2: EnginePlugin = { name: 'plugin2', rawConfigConfigured: (config: any) => ({ ...config, p2: true }) }
			const plugins = [plugin1, plugin2]
			const payload = { initial: true }
			const result = execSyncHook(plugins, 'rawConfigConfigured', payload)
			expect(result).toEqual({ initial: true, p1: true, p2: true })
		})

		it('should handle plugins without the hook', () => {
			const plugin1: EnginePlugin = { name: 'plugin1' }
			const plugins = [plugin1]
			const payload = { initial: true }
			const result = execSyncHook(plugins, 'rawConfigConfigured', payload)
			expect(result).toEqual({ initial: true })
		})

		it('should handle errors and warn', () => {
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			// eslint-disable-next-line style/max-statements-per-line
			const plugin1: EnginePlugin = { name: 'plugin1', rawConfigConfigured: () => { throw new Error('test error') } }
			const plugins = [plugin1]
			const payload = { initial: true }
			const result = execSyncHook(plugins, 'rawConfigConfigured', payload)
			expect(warnSpy).toHaveBeenCalledWith('[@pikacss/core]', 'Plugin "plugin1" failed to execute hook "rawConfigConfigured": test error', expect.any(Error))
			expect(result).toEqual({ initial: true })
			warnSpy.mockRestore()
		})

		it('should handle nullish return values', () => {
			const plugin1: EnginePlugin = { name: 'plugin1', rawConfigConfigured: () => {} }
			const plugins = [plugin1]
			const payload = { initial: true }
			const result = execSyncHook(plugins, 'rawConfigConfigured', payload)
			expect(result).toEqual({ initial: true })
		})
	})

	describe('resolvePlugins', () => {
		it('should sort plugins correctly', () => {
			const plugin1: EnginePlugin = { name: 'plugin1', order: 'post' }
			const plugin2: EnginePlugin = { name: 'plugin2' }
			const plugin3: EnginePlugin = { name: 'plugin3', order: 'pre' }
			const plugins = [plugin1, plugin2, plugin3]
			const result = resolvePlugins(plugins)
			expect(result).toEqual([plugin3, plugin2, plugin1])
		})
	})

	describe('defineEnginePlugin', () => {
		it('should return the plugin as is', () => {
			const plugin: EnginePlugin = { name: 'test-plugin' }
			const result = defineEnginePlugin(plugin)
			expect(result).toEqual(plugin)
		})
	})
})
