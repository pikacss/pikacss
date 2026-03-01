import type { EnginePlugin } from './plugin'
import { describe, expect, it, vi } from 'vitest'
import { defineEnginePlugin, execAsyncHook, execSyncHook, hooks, resolvePlugins } from './plugin'

// Suppress log output during tests
vi.mock('./utils', () => ({
	log: {
		error: vi.fn(),
		debug: vi.fn(),
	},
}))

// Use a valid async hook name for execAsyncHook tests
const ASYNC_HOOK = 'configureRawConfig' as const
// Use a valid sync hook name for execSyncHook tests
const SYNC_HOOK = 'rawConfigConfigured' as const

describe('execAsyncHook', () => {
	it('should execute a single plugin hook and return the payload', async () => {
		const plugin = { name: 'test', [ASYNC_HOOK]: (p: any) => p }
		const result = await execAsyncHook([plugin], ASYNC_HOOK, 42)
		expect(result)
			.toBe(42)
	})

	it('should execute multiple plugins in order', async () => {
		const order: string[] = []
		const pluginA = {
			name: 'A',
			[ASYNC_HOOK]: (p: any) => {
				order.push('A')
				return p
			},
		}
		const pluginB = {
			name: 'B',
			[ASYNC_HOOK]: (p: any) => {
				order.push('B')
				return p
			},
		}
		await execAsyncHook([pluginA, pluginB], ASYNC_HOOK, 0)
		expect(order)
			.toEqual(['A', 'B'])
	})

	it('should skip plugins that do not have the hook', async () => {
		const called = vi.fn()
		const pluginWithHook = {
			name: 'with',
			[ASYNC_HOOK]: (p: any) => {
				called()
				return p
			},
		}
		const pluginWithout = { name: 'without' }
		await execAsyncHook([pluginWithout, pluginWithHook], ASYNC_HOOK, 0)
		expect(called)
			.toHaveBeenCalledOnce()
	})

	it('should replace payload when a plugin returns a new value', async () => {
		const pluginA = { name: 'A', [ASYNC_HOOK]: () => 'replaced' }
		const pluginB = { name: 'B', [ASYNC_HOOK]: (p: any) => p }
		const result = await execAsyncHook([pluginA, pluginB], ASYNC_HOOK, 'original')
		expect(result)
			.toBe('replaced')
	})

	it('should keep payload when a plugin returns null', async () => {
		const plugin = { name: 'test', [ASYNC_HOOK]: () => null } as unknown as EnginePlugin
		const result = await execAsyncHook([plugin], ASYNC_HOOK, 'keep')
		expect(result)
			.toBe('keep')
	})

	it('should keep payload when a plugin returns undefined', async () => {
		const plugin = { name: 'test', [ASYNC_HOOK]: () => undefined }
		const result = await execAsyncHook([plugin], ASYNC_HOOK, 'keep')
		expect(result)
			.toBe('keep')
	})

	it('should catch errors and continue executing remaining plugins', async () => {
		const pluginA = {
			name: 'A',
			[ASYNC_HOOK]: () => { throw new Error('boom') },
		}
		const pluginB = { name: 'B', [ASYNC_HOOK]: () => 'from-B' } as unknown as EnginePlugin
		const result = await execAsyncHook([pluginA, pluginB], ASYNC_HOOK, 'init')
		expect(result)
			.toBe('from-B')
	})

	it('should return original payload for an empty plugins array', async () => {
		const result = await execAsyncHook([], ASYNC_HOOK, 'unchanged')
		expect(result)
			.toBe('unchanged')
	})

	it('should handle async hook functions', async () => {
		const plugin = {
			name: 'async',
			[ASYNC_HOOK]: async (p: number) => p + 1,
		} as unknown as EnginePlugin
		const result = await execAsyncHook([plugin], ASYNC_HOOK, 1)
		expect(result)
			.toBe(2)
	})

	it('should chain payload through multiple plugins', async () => {
		const pluginA = { name: 'A', [ASYNC_HOOK]: (p: number) => p + 10 } as unknown as EnginePlugin
		const pluginB = { name: 'B', [ASYNC_HOOK]: (p: number) => p * 2 } as unknown as EnginePlugin
		const result = await execAsyncHook([pluginA, pluginB], ASYNC_HOOK, 5)
		expect(result)
			.toBe(30) // (5 + 10) * 2
	})
})

describe('execSyncHook', () => {
	it('should execute a single plugin hook and return the payload', () => {
		const plugin = { name: 'test', [SYNC_HOOK]: (p: any) => p }
		const result = execSyncHook([plugin], SYNC_HOOK, 42)
		expect(result)
			.toBe(42)
	})

	it('should execute multiple plugins in order', () => {
		const order: string[] = []
		const pluginA = {
			name: 'A',
			[SYNC_HOOK]: (p: any) => {
				order.push('A')
				return p
			},
		}
		const pluginB = {
			name: 'B',
			[SYNC_HOOK]: (p: any) => {
				order.push('B')
				return p
			},
		}
		execSyncHook([pluginA, pluginB], SYNC_HOOK, 0)
		expect(order)
			.toEqual(['A', 'B'])
	})

	it('should skip plugins that do not have the hook', () => {
		const called = vi.fn()
		const pluginWithHook = {
			name: 'with',
			[SYNC_HOOK]: (p: any) => {
				called()
				return p
			},
		}
		const pluginWithout = { name: 'without' }
		execSyncHook([pluginWithout, pluginWithHook], SYNC_HOOK, 0)
		expect(called)
			.toHaveBeenCalledOnce()
	})

	it('should replace payload when a plugin returns a new value', () => {
		const pluginA = { name: 'A', [SYNC_HOOK]: () => 'replaced' }
		const pluginB = { name: 'B', [SYNC_HOOK]: (p: any) => p }
		const result = execSyncHook([pluginA, pluginB], SYNC_HOOK, 'original')
		expect(result)
			.toBe('replaced')
	})

	it('should keep payload when a plugin returns null', () => {
		const plugin = { name: 'test', [SYNC_HOOK]: () => null } as unknown as EnginePlugin
		const result = execSyncHook([plugin], SYNC_HOOK, 'keep')
		expect(result)
			.toBe('keep')
	})

	it('should keep payload when a plugin returns undefined', () => {
		const plugin = { name: 'test', [SYNC_HOOK]: () => undefined }
		const result = execSyncHook([plugin], SYNC_HOOK, 'keep')
		expect(result)
			.toBe('keep')
	})

	it('should catch errors and continue executing remaining plugins', () => {
		const pluginA = {
			name: 'A',
			[SYNC_HOOK]: () => { throw new Error('boom') },
		}
		const pluginB = { name: 'B', [SYNC_HOOK]: () => 'from-B' } as unknown as EnginePlugin
		const result = execSyncHook([pluginA, pluginB], SYNC_HOOK, 'init')
		expect(result)
			.toBe('from-B')
	})

	it('should return original payload for an empty plugins array', () => {
		const result = execSyncHook([], SYNC_HOOK, 'unchanged')
		expect(result)
			.toBe('unchanged')
	})

	it('should chain payload through multiple plugins', () => {
		const pluginA = { name: 'A', [SYNC_HOOK]: (p: number) => p + 10 } as unknown as EnginePlugin
		const pluginB = { name: 'B', [SYNC_HOOK]: (p: number) => p * 2 } as unknown as EnginePlugin
		const result = execSyncHook([pluginA, pluginB], SYNC_HOOK, 5)
		expect(result)
			.toBe(30) // (5 + 10) * 2
	})
})

describe('resolvePlugins', () => {
	it('should sort pre before undefined before post', () => {
		const plugins: EnginePlugin[] = [
			{ name: 'default', order: undefined },
			{ name: 'post', order: 'post' },
			{ name: 'pre', order: 'pre' },
		]
		const sorted = resolvePlugins(plugins)
		expect(sorted.map(p => p.name))
			.toEqual(['pre', 'default', 'post'])
	})

	it('should maintain stable order within the same order group', () => {
		const plugins: EnginePlugin[] = [
			{ name: 'pre-1', order: 'pre' },
			{ name: 'pre-2', order: 'pre' },
			{ name: 'default-1' },
			{ name: 'default-2' },
			{ name: 'post-1', order: 'post' },
			{ name: 'post-2', order: 'post' },
		]
		const sorted = resolvePlugins(plugins)
		expect(sorted.map(p => p.name))
			.toEqual([
				'pre-1',
				'pre-2',
				'default-1',
				'default-2',
				'post-1',
				'post-2',
			])
	})

	it('should return an empty array for empty input', () => {
		const result = resolvePlugins([])
		expect(result)
			.toEqual([])
	})

	it('should handle all plugins having the same order', () => {
		const plugins: EnginePlugin[] = [
			{ name: 'a' },
			{ name: 'b' },
			{ name: 'c' },
		]
		const sorted = resolvePlugins(plugins)
		expect(sorted.map(p => p.name))
			.toEqual(['a', 'b', 'c'])
	})
})

describe('defineEnginePlugin', () => {
	it('should return the same object (identity function)', () => {
		const plugin: EnginePlugin = { name: 'my-plugin' }
		const result = defineEnginePlugin(plugin)
		expect(result)
			.toBe(plugin)
	})

	it('should preserve all plugin properties', () => {
		const plugin: EnginePlugin = {
			name: 'full-plugin',
			order: 'pre',
			// @ts-expect-error - allow custom properties for testing
			customHook: () => 'hello',
		}
		const result = defineEnginePlugin(plugin)
		expect(result.name)
			.toBe('full-plugin')
		expect(result.order)
			.toBe('pre')
		// @ts-expect-error - access custom property for testing
		expect(result.customHook())
			.toBe('hello')
	})
})

describe('hooks object', () => {
	const noopPlugin = { name: 'noop' } as EnginePlugin

	it('configureRawConfig calls execAsyncHook', async () => {
		const plugin = { name: 'p', configureRawConfig: (c: any) => c }
		const result = await hooks.configureRawConfig([plugin as EnginePlugin], { plugins: [] })
		expect(result)
			.toEqual({ plugins: [] })
	})

	it('rawConfigConfigured calls execSyncHook', () => {
		const plugin = { name: 'p', rawConfigConfigured: vi.fn() }
		hooks.rawConfigConfigured([plugin as EnginePlugin], { plugins: [] })
		expect(plugin.rawConfigConfigured)
			.toHaveBeenCalled()
	})

	it('configureResolvedConfig calls execAsyncHook', async () => {
		const cfg = { plugins: [] } as any
		const result = await hooks.configureResolvedConfig([noopPlugin], cfg)
		expect(result)
			.toBe(cfg)
	})

	it('configureEngine calls execAsyncHook', async () => {
		const engine = {} as any
		const result = await hooks.configureEngine([noopPlugin], engine)
		expect(result)
			.toBe(engine)
	})

	it('transformSelectors calls execAsyncHook', async () => {
		const sels = ['hover']
		const result = await hooks.transformSelectors([noopPlugin], sels)
		expect(result)
			.toBe(sels)
	})

	it('transformStyleItems calls execAsyncHook', async () => {
		const items = [{ property: 'color', value: 'red' }] as any
		const result = await hooks.transformStyleItems([noopPlugin], items)
		expect(result)
			.toBe(items)
	})

	it('transformStyleDefinitions calls execAsyncHook', async () => {
		const defs = [{}] as any
		const result = await hooks.transformStyleDefinitions([noopPlugin], defs)
		expect(result)
			.toBe(defs)
	})

	it('preflightUpdated calls execSyncHook', () => {
		const spy = vi.fn()
		const plugin = { name: 'p', preflightUpdated: spy }
		hooks.preflightUpdated([plugin as EnginePlugin])
		expect(spy)
			.toHaveBeenCalled()
	})

	it('atomicStyleAdded calls execSyncHook', () => {
		const spy = vi.fn()
		const plugin = { name: 'p', atomicStyleAdded: spy }
		hooks.atomicStyleAdded([plugin as EnginePlugin], {} as any)
		expect(spy)
			.toHaveBeenCalledWith({})
	})

	it('autocompleteConfigUpdated calls execSyncHook', () => {
		const spy = vi.fn()
		const plugin = { name: 'p', autocompleteConfigUpdated: spy }
		hooks.autocompleteConfigUpdated([plugin as EnginePlugin])
		expect(spy)
			.toHaveBeenCalled()
	})
})
