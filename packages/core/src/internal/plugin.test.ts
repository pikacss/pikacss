import { describe, expect, it } from 'vitest'

import { defineEnginePlugin, execAsyncHook, execSyncHook, hooks, resolvePlugins } from './plugin'

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
	it('applies async hook payloads, preserves the current payload on nullish returns, and continues after plugin errors', async () => {
		const result = await execAsyncHook([
			{
				name: 'prepend',
				async transformSelectors(selectors: string[]) {
					return ['pre', ...selectors]
				},
			},
			{
				name: 'keep-current',
				async transformSelectors() {
					return undefined
				},
			},
			{
				name: 'throws',
				async transformSelectors() {
					throw new Error('boom')
				},
			},
			{
				name: 'append',
				async transformSelectors(selectors: string[]) {
					return [...selectors, 'post']
				},
			},
		] as any, 'transformSelectors', ['base'])

		expect(result)
			.toEqual(['pre', 'base', 'post'])
	})

	it('logs non-Error thrown values through the plugin hook error path', async () => {
		const result = await execAsyncHook([
			{
				name: 'throws-string',
				async transformSelectors() {
					// eslint-disable-next-line no-throw-literal
					throw 'string error'
				},
			},
		] as any, 'transformSelectors', ['base'])

		expect(result)
			.toEqual(['base'])
	})
})

describe('execSyncHook', () => {
	it('applies sync hook payloads and keeps running when a plugin throws', () => {
		const result = execSyncHook([
			{
				name: 'first',
				rawConfigConfigured(config: { count: number }) {
					return { ...config, count: config.count + 1 }
				},
			},
			{
				name: 'keep-current',
				rawConfigConfigured() {
					return null
				},
			},
			{
				name: 'throws',
				rawConfigConfigured() {
					throw new Error('boom')
				},
			},
			{
				name: 'last',
				rawConfigConfigured(config: { count: number }) {
					return { ...config, done: true }
				},
			},
		] as any, 'rawConfigConfigured', { count: 0 })

		expect(result)
			.toEqual({ count: 1, done: true })
	})
})

describe('hooks facade', () => {
	it('delegates typed async hooks through the shared facade', async () => {
		const result = await hooks.transformStyleItems([
			{
				name: 'append-item',
				async transformStyleItems(styleItems: string[]) {
					return [...styleItems, 'extra']
				},
			},
		] as any, ['base'])

		expect(result)
			.toEqual(['base', 'extra'])
	})
})

describe('defineEnginePlugin', () => {
	it('returns the same plugin instance at runtime', () => {
		const plugin = { name: 'identity' }

		expect(defineEnginePlugin(plugin as any))
			.toBe(plugin)
	})
})
