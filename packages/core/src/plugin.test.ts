import { describe, expect, it, vi } from 'vitest'

import { createEngine } from './engine'
import { defineEnginePlugin, execAsyncHook, execSyncHook, hooks, resolvePlugins } from './plugin'
import { log } from './utils'

describe('resolvePlugins', () => {
	it('sorts plugins by pre/default/post order without mutating the input array', () => {
		const plugins = [
			{ name: 'post', order: 'post' as const },
			{ name: 'default' },
			{ name: 'pre', order: 'pre' as const },
		]
		const resolved = resolvePlugins(plugins as any)
		expect(resolved.map(plugin => plugin.name))
			.toEqual(['pre', 'default', 'post'])
		expect(plugins.map(plugin => plugin.name))
			.toEqual(['post', 'default', 'pre'])
	})
})

describe('execAsyncHook', () => {
	it('applies async payloads and preserves the current payload on nullish returns', async () => {
		const result = await execAsyncHook([
			{ name: 'prepend', async transformSelectors(selectors: string[]) { return ['pre', ...selectors] } },
			{ name: 'keep-current', async transformSelectors() { return undefined } },
			{ name: 'append', async transformSelectors(selectors: string[]) { return [...selectors, 'post'] } },
		] as any, 'transformSelectors', ['base'])
		expect(result)
			.toEqual(['pre', 'base', 'post'])
	})

	it('reports and rethrows plugin errors instead of returning a partial payload', async () => {
		const onDiagnostic = vi.fn()
		const error = new Error('boom')
		await expect(execAsyncHook([
			{ name: 'throws', async transformSelectors() { throw error } },
			{ name: 'must-not-run', async transformSelectors(selectors: string[]) { return [...selectors, 'post'] } },
		] as any, 'transformSelectors', ['base'], { onDiagnostic })).rejects.toBe(error)
		expect(onDiagnostic)
			.toHaveBeenCalledWith(expect.objectContaining({
				level: 'error',
				code: 'plugin-hook-error',
				plugin: 'throws',
				hook: 'transformSelectors',
				cause: error,
			}))
	})

	it('preserves non-Error thrown values as diagnostic causes', async () => {
		const onDiagnostic = vi.fn()
		await expect(execAsyncHook([
			{ name: 'throws-string', async transformSelectors() { throw 'string error' } },
		] as any, 'transformSelectors', ['base'], { onDiagnostic })).rejects.toBe('string error')
		expect(onDiagnostic)
			.toHaveBeenCalledWith(expect.objectContaining({ cause: 'string error' }))
	})

	it('uses the logger as a fallback when no diagnostic handler is supplied', async () => {
		const errorSink = vi.fn()
		const error = new Error('fallback failure')
		log.setErrorFn(errorSink)
		try {
			await expect(execAsyncHook([
				{ name: 'fallback-error', async transformSelectors() { throw error } },
			] as any, 'transformSelectors', ['base'])).rejects.toBe(error)
			expect(errorSink)
				.toHaveBeenCalledWith(
					expect.any(String),
					expect.stringContaining('Plugin "fallback-error" failed to execute hook "transformSelectors"'),
					error,
				)
		}
		finally {
			log.setErrorFn(() => {})
		}
	})
})

describe('execSyncHook', () => {
	it('reports and rethrows synchronous plugin errors', () => {
		const onDiagnostic = vi.fn()
		const error = new Error('boom')
		expect(() => execSyncHook([
			{ name: 'throws', rawConfigConfigured() { throw error } },
		] as any, 'rawConfigConfigured', { count: 0 }, { onDiagnostic }))
			.toThrow(error)
		expect(onDiagnostic)
			.toHaveBeenCalledWith(expect.objectContaining({ code: 'plugin-hook-error', cause: error }))
	})
})

describe('hooks facade', () => {
	it('delegates typed async hooks through the shared facade', async () => {
		const result = await hooks.transformStyleItems([
			{ name: 'append-item', async transformStyleItems(styleItems: string[]) { return [...styleItems, 'extra'] } },
		] as any, ['base'])
		expect(result)
			.toEqual(['base', 'extra'])
	})
})

describe('engine-scoped hooks', () => {
	it('routes transform hook failures through the engine diagnostic handler', async () => {
		const onDiagnostic = vi.fn()
		const error = new Error('transform failed')
		const engine = await createEngine({
			plugins: [{
				name: 'transform-error',
				transformStyleItems() { throw error },
			}],
		}, { onDiagnostic })

		await expect(engine.use({ color: 'red' })).rejects.toBe(error)
		expect(onDiagnostic)
			.toHaveBeenCalledWith(expect.objectContaining({
				code: 'plugin-hook-error',
				plugin: 'transform-error',
				hook: 'transformStyleItems',
				cause: error,
			}))
	})

	it('isolates engine execution from a throwing host diagnostic handler', async () => {
		const engine = await createEngine({
			plugins: [{
				name: 'diagnostic-producer',
				configureRawConfig(config, context) {
					context?.onDiagnostic({ level: 'warning', code: 'test-warning', message: 'warning' })
					return config
				},
			}],
		}, {
			onDiagnostic() { throw new Error('host handler failed') },
		})

		expect(engine)
			.toBeDefined()
	})
})

describe('defineEnginePlugin', () => {
	it('returns the same plugin instance at runtime', () => {
		const plugin = { name: 'identity' }
		expect(defineEnginePlugin(plugin as any))
			.toBe(plugin)
	})
})
