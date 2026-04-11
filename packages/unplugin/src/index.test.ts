import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDeferred } from '../../_shared/vitest'

const mockReadFileSync = vi.fn()
const mockCreateCtx = vi.fn()
const mockCreateUnplugin = vi.fn(factory => ({ factory }))
const mockDebounce = vi.fn((fn: (...args: any[]) => any) => {
	const wrapped = (...args: any[]) => fn(...args)
	return wrapped
})
const mockLog = {
	debug: vi.fn(),
	info: vi.fn(),
}

vi.mock('node:fs', () => ({
	readFileSync: mockReadFileSync,
}))

vi.mock('@pikacss/integration', () => ({
	createCtx: mockCreateCtx,
	log: mockLog,
}))

vi.mock('perfect-debounce', () => ({
	debounce: mockDebounce,
}))

vi.mock('unplugin', () => ({
	createUnplugin: mockCreateUnplugin,
}))

function createHook() {
	const listeners: Array<() => unknown> = []

	return {
		listeners,
		on: vi.fn((listener: () => unknown) => {
			listeners.push(listener)
		}),
		async emit() {
			for (const listener of listeners)
				await listener()
		},
	}
}

function createCtxStub() {
	const hooks = {
		styleUpdated: createHook(),
		tsCodegenUpdated: createHook(),
	}
	return {
		cwd: '/initial',
		usages: new Map([
			['src/demo.ts', [{ atomicStyleIds: ['pk-a'] }]],
		]),
		setup: vi.fn(async () => {
			hooks.styleUpdated.listeners.length = 0
			hooks.tsCodegenUpdated.listeners.length = 0
		}),
		fullyCssCodegen: vi.fn(async () => {}),
		writeCssCodegenFile: vi.fn(async () => {}),
		writeTsCodegenFile: vi.fn(async () => {}),
		transform: vi.fn(async () => ({ code: 'transformed' })),
		transformFilter: {
			include: ['src/**/*.ts'],
			exclude: [],
		},
		cssCodegenFilepath: '/tmp/pika.gen.css',
		tsCodegenFilepath: '/tmp/pika.gen.ts',
		resolvedConfigPath: '/tmp/pika.config.ts' as string | null,
		resolvedConfigContent: 'before',
		hooks,
		engine: {
			store: {
				atomicStyleIds: {
					size: 2,
				},
			},
		},
	}
}

async function flushAsyncWork() {
	await Promise.resolve()
	await Promise.resolve()
	await new Promise(resolve => setTimeout(resolve, 0))
}

beforeEach(() => {
	vi.clearAllMocks()
	mockReadFileSync.mockReturnValue('before')
})

describe('unpluginFactory', () => {
	it('resolves default options, wires vite lifecycle hooks, and keeps generated assets in sync', async () => {
		const ctx = createCtxStub()
		mockCreateCtx.mockReturnValue(ctx)
		const mod = await import('./index')
		const plugin = mod.unpluginFactory(undefined, { framework: 'vite' } as any) as any
		const viteServer = {
			moduleGraph: {
				getModuleById: vi.fn(() => ({ id: 'src/demo.ts' })),
				invalidateModule: vi.fn(),
			},
			reloadModule: vi.fn(async () => {}),
		}

		expect(mockCreateCtx)
			.toHaveBeenCalledWith(expect.objectContaining({
				currentPackageName: '@pikacss/unplugin-pikacss',
				tsCodegen: 'pika.gen.ts',
				cssCodegen: 'pika.gen.css',
				fnName: 'pika',
				transformedFormat: 'string',
				autoCreateConfig: true,
				scan: {
					include: ['**/*.{js,ts,jsx,tsx,vue}'],
					exclude: ['node_modules/**', 'dist/**'],
				},
			}))

		plugin.vite.configResolved?.({ root: '/app', command: 'serve' } as any)
		plugin.vite.configureServer?.(viteServer as any)

		const buildContext = { addWatchFile: vi.fn() }
		await plugin.buildStart.call(buildContext as any)
		await plugin.buildStart.call(buildContext as any)

		expect(ctx.cwd)
			.toBe('/app')
		expect(ctx.setup)
			.toHaveBeenCalledTimes(1)
		expect(ctx.fullyCssCodegen)
			.not.toHaveBeenCalled()
		expect(buildContext.addWatchFile)
			.toHaveBeenCalledWith('/tmp/pika.config.ts')
		expect(await plugin.resolveId?.call({}, 'pika.css'))
			.toBe('/tmp/pika.gen.css')
		expect(await plugin.resolveId?.call({}, 'plain.css'))
			.toBeNull()
		expect(plugin.transform.filter.id)
			.toEqual(ctx.transformFilter)
		expect(await plugin.transform.handler.call({}, 'code', 'src/demo.ts'))
			.toEqual({ code: 'transformed' })

		await ctx.hooks.styleUpdated.emit()
		await ctx.hooks.tsCodegenUpdated.emit()

		expect(ctx.writeCssCodegenFile)
			.toHaveBeenCalled()
		expect(ctx.writeTsCodegenFile)
			.toHaveBeenCalled()

		mockReadFileSync.mockReturnValue('after')
		plugin.watchChange?.('/tmp/pika.config.ts')
		await flushAsyncWork()

		expect(ctx.setup)
			.toHaveBeenCalledTimes(2)
		expect(viteServer.moduleGraph.getModuleById)
			.toHaveBeenCalledWith('src/demo.ts')
		expect(viteServer.moduleGraph.invalidateModule)
			.toHaveBeenCalledWith({ id: 'src/demo.ts' })
		expect(viteServer.reloadModule)
			.toHaveBeenCalledWith({ id: 'src/demo.ts' })

		const cssWritesBefore = ctx.writeCssCodegenFile.mock.calls.length
		const tsWritesBefore = ctx.writeTsCodegenFile.mock.calls.length

		await ctx.hooks.styleUpdated.emit()
		await ctx.hooks.tsCodegenUpdated.emit()

		expect(ctx.writeCssCodegenFile.mock.calls.length - cssWritesBefore)
			.toBe(1)
		expect(ctx.writeTsCodegenFile.mock.calls.length - tsWritesBefore)
			.toBe(1)
	})

	it('treats missing vite modules as a no-op during reload invalidation', async () => {
		const ctx = createCtxStub()
		mockCreateCtx.mockReturnValue(ctx)
		const mod = await import('./index')
		const plugin = mod.unpluginFactory(undefined, { framework: 'vite' } as any) as any
		const viteServer = {
			moduleGraph: {
				getModuleById: vi.fn(() => undefined),
				invalidateModule: vi.fn(),
			},
			reloadModule: vi.fn(async () => {}),
		}

		plugin.vite.configResolved?.({ root: '/no-module-app', command: 'serve' } as any)
		plugin.vite.configureServer?.(viteServer as any)
		await plugin.buildStart.call({ addWatchFile: vi.fn() } as any)

		mockReadFileSync.mockReturnValue('changed')
		plugin.watchChange?.('/tmp/pika.config.ts')
		await flushAsyncWork()

		expect(viteServer.moduleGraph.invalidateModule)
			.not.toHaveBeenCalled()
		expect(viteServer.reloadModule)
			.not.toHaveBeenCalled()
	})

	it('supports webpack build mode, watches config changes, and adds config files during transform', async () => {
		const ctx = createCtxStub()
		mockCreateCtx.mockReturnValue(ctx)
		const mod = await import('./index')
		const plugin = mod.unpluginFactory({
			config: 'pika.config.js',
			tsCodegen: false,
			cssCodegen: 'generated/styles.css',
			scan: {
				include: 'src/**/*.vue',
				exclude: 'fixtures/**',
			},
			fnName: 'styled',
			transformedFormat: 'array',
			autoCreateConfig: false,
		}, { framework: 'webpack' } as any) as any

		plugin.webpack?.({
			options: {
				context: '/webpack-app',
				mode: 'production',
			},
		} as any)

		const buildContext = { addWatchFile: vi.fn() }
		await plugin.buildStart.call(buildContext as any)

		expect(mockCreateCtx)
			.toHaveBeenLastCalledWith(expect.objectContaining({
				configOrPath: 'pika.config.js',
				tsCodegen: false,
				cssCodegen: 'generated/styles.css',
				fnName: 'styled',
				transformedFormat: 'array',
				autoCreateConfig: false,
				scan: {
					include: ['src/**/*.vue'],
					exclude: ['fixtures/**'],
				},
			}))
		expect(ctx.cwd)
			.toBe('/webpack-app')
		expect(ctx.fullyCssCodegen)
			.toHaveBeenCalledTimes(1)

		const transformContext = { addWatchFile: vi.fn() }
		await plugin.transform.handler.call(transformContext as any, 'code', 'src/component.vue')
		expect(transformContext.addWatchFile)
			.toHaveBeenCalledWith('/tmp/pika.config.ts')

		mockReadFileSync.mockReturnValue('before')
		plugin.watchChange?.('/tmp/pika.config.ts')
		plugin.watchChange?.('/tmp/other.config.ts')
		expect(ctx.setup)
			.toHaveBeenCalledTimes(1)
	})

	it('skips watch registration when no resolved config path is available', async () => {
		const ctx = createCtxStub()
		ctx.resolvedConfigPath = null
		mockCreateCtx.mockReturnValue(ctx)
		const mod = await import('./index')
		const plugin = mod.unpluginFactory(undefined, { framework: 'webpack' } as any) as any

		await plugin.buildStart.call({ addWatchFile: vi.fn() } as any)
		const transformContext = { addWatchFile: vi.fn() }
		await plugin.transform.handler.call(transformContext as any, 'code', 'src/entry.ts')

		expect(transformContext.addWatchFile)
			.not.toHaveBeenCalled()
	})

	it('invalidates rspack runtimes during reload setup and maps the esbuild virtual module', async () => {
		const mod = await import('./index')

		const rspackCtx = createCtxStub()
		mockCreateCtx.mockReturnValueOnce(rspackCtx)
		const rspackPlugin = mod.unpluginFactory(undefined, { framework: 'rspack' } as any) as any
		const rspackCompiler = {
			options: {
				context: '/rspack-app',
				mode: 'development',
			},
			watching: {
				invalidateWithChangesAndRemovals: vi.fn(),
				invalidate: vi.fn(),
			},
		}

		rspackPlugin.rspack?.(rspackCompiler as any)
		await rspackPlugin.buildStart.call({ addWatchFile: vi.fn() } as any)
		mockReadFileSync.mockReturnValue('changed')
		rspackPlugin.watchChange?.('/tmp/pika.config.ts')
		await flushAsyncWork()

		expect(rspackCompiler.watching.invalidateWithChangesAndRemovals)
			.toHaveBeenCalledWith(new Set(['src/demo.ts']))
		expect(rspackCompiler.watching.invalidate)
			.toHaveBeenCalled()

		const silentRspackCtx = createCtxStub()
		mockCreateCtx.mockReturnValueOnce(silentRspackCtx)
		const silentRspackPlugin = mod.unpluginFactory(undefined, { framework: 'rspack' } as any) as any
		silentRspackPlugin.rspack?.({ options: {} } as any)
		await silentRspackPlugin.buildStart.call({ addWatchFile: vi.fn() } as any)
		mockReadFileSync.mockReturnValue('changed-rspack')
		silentRspackPlugin.watchChange?.('/tmp/pika.config.ts')

		const esbuildCtx = createCtxStub()
		mockCreateCtx.mockReturnValueOnce(esbuildCtx)
		const esbuildPlugin = mod.unpluginFactory(undefined, { framework: 'esbuild' } as any) as any
		const onResolve = vi.fn()

		await esbuildPlugin.esbuild.setup({
			initialOptions: {
				absWorkingDir: '/esbuild-app',
			},
			onResolve,
		} as any)

		expect(esbuildCtx.cwd)
			.toBe('/esbuild-app')
		const resolver = onResolve.mock.calls[0]![1]
		expect(await resolver({ path: 'pika.css' }))
			.toEqual({
				path: '/tmp/pika.gen.css',
				namespace: 'file',
			})
		expect(esbuildPlugin.resolveId)
			.toBeUndefined()
	})

	it('covers alternative framework configurations: vite build, webpack dev with reload, and esbuild without cwd', async () => {
		const mod = await import('./index')

		// Vite build mode
		const viteCtx = createCtxStub()
		mockCreateCtx.mockReturnValueOnce(viteCtx)
		const vitePlugin = mod.unpluginFactory(undefined, { framework: 'vite' } as any) as any
		vitePlugin.vite.configResolved?.({ root: '/app', command: 'build' } as any)

		// Webpack with no context and development mode, triggers config reload
		const webpackCtx = createCtxStub()
		mockCreateCtx.mockReturnValueOnce(webpackCtx)
		const webpackPlugin = mod.unpluginFactory(undefined, { framework: 'webpack' } as any) as any
		webpackPlugin.webpack?.({ options: { mode: 'development' } } as any)
		await webpackPlugin.buildStart.call({ addWatchFile: vi.fn() } as any)
		mockReadFileSync.mockReturnValue('changed-wp')
		webpackPlugin.watchChange?.('/tmp/pika.config.ts')
		await flushAsyncWork()
		expect(webpackCtx.setup)
			.toHaveBeenCalledTimes(2)

		// Esbuild with no absWorkingDir
		const esbuildCtx = createCtxStub()
		mockCreateCtx.mockReturnValueOnce(esbuildCtx)
		const esbuildPlugin = mod.unpluginFactory(undefined, { framework: 'esbuild' } as any) as any
		await esbuildPlugin.esbuild.setup({ initialOptions: {}, onResolve: vi.fn() } as any)
	})

	it('defers css and ts writes until concurrent transform handlers settle', async () => {
		const firstGate = createDeferred()
		const secondGate = createDeferred()
		const ctx = createCtxStub()

		ctx.transform = vi.fn(async (...args: any[]) => {
			const [, id] = args as [string, string]

			await ctx.hooks.styleUpdated.emit()
			await ctx.hooks.tsCodegenUpdated.emit()

			if (id.endsWith('a.ts')) {
				await firstGate.promise
			}
			else {
				await secondGate.promise
			}

			return { code: `transformed:${id}` }
		})
		mockCreateCtx.mockReturnValue(ctx)

		const mod = await import('./index')
		const plugin = mod.unpluginFactory(undefined, { framework: 'vite' } as any) as any

		plugin.vite.configResolved?.({ root: '/app', command: 'serve' } as any)
		await plugin.buildStart.call({ addWatchFile: vi.fn() } as any)

		const cssWritesBefore = ctx.writeCssCodegenFile.mock.calls.length
		const tsWritesBefore = ctx.writeTsCodegenFile.mock.calls.length

		const firstTransform = plugin.transform.handler.call({}, 'code', 'src/a.ts')
		const secondTransform = plugin.transform.handler.call({}, 'code', 'src/b.ts')

		await flushAsyncWork()

		expect(ctx.writeCssCodegenFile.mock.calls.length - cssWritesBefore)
			.toBe(0)
		expect(ctx.writeTsCodegenFile.mock.calls.length - tsWritesBefore)
			.toBe(0)

		firstGate.resolve()
		await firstTransform
		await flushAsyncWork()

		expect(ctx.writeCssCodegenFile.mock.calls.length - cssWritesBefore)
			.toBe(0)
		expect(ctx.writeTsCodegenFile.mock.calls.length - tsWritesBefore)
			.toBe(0)

		secondGate.resolve()
		await secondTransform

		expect(ctx.writeCssCodegenFile.mock.calls.length - cssWritesBefore)
			.toBe(1)
		expect(ctx.writeTsCodegenFile.mock.calls.length - tsWritesBefore)
			.toBe(1)
	})

	it('waits for the remaining concurrent transform when one handler rejects after queueing writes', async () => {
		const failedGate = createDeferred()
		const secondGate = createDeferred()
		const ctx = createCtxStub()

		ctx.transform = vi.fn(async (...args: any[]) => {
			const [, id] = args as [string, string]

			await ctx.hooks.styleUpdated.emit()
			await ctx.hooks.tsCodegenUpdated.emit()

			if (id.endsWith('a.ts')) {
				await failedGate.promise
				throw new Error('boom')
			}

			await secondGate.promise
			return { code: `transformed:${id}` }
		})
		mockCreateCtx.mockReturnValue(ctx)

		const mod = await import('./index')
		const plugin = mod.unpluginFactory(undefined, { framework: 'vite' } as any) as any

		plugin.vite.configResolved?.({ root: '/app', command: 'serve' } as any)
		await plugin.buildStart.call({ addWatchFile: vi.fn() } as any)

		const cssWritesBefore = ctx.writeCssCodegenFile.mock.calls.length
		const tsWritesBefore = ctx.writeTsCodegenFile.mock.calls.length

		const failingTransform = plugin.transform.handler.call({}, 'code', 'src/a.ts')
		const secondTransform = plugin.transform.handler.call({}, 'code', 'src/b.ts')

		await flushAsyncWork()

		expect(ctx.writeCssCodegenFile.mock.calls.length - cssWritesBefore)
			.toBe(0)
		expect(ctx.writeTsCodegenFile.mock.calls.length - tsWritesBefore)
			.toBe(0)

		failedGate.resolve()
		await expect(failingTransform)
			.rejects.toThrow('boom')
		await flushAsyncWork()

		expect(ctx.writeCssCodegenFile.mock.calls.length - cssWritesBefore)
			.toBe(0)
		expect(ctx.writeTsCodegenFile.mock.calls.length - tsWritesBefore)
			.toBe(0)

		secondGate.resolve()
		await secondTransform

		expect(ctx.writeCssCodegenFile.mock.calls.length - cssWritesBefore)
			.toBe(1)
		expect(ctx.writeTsCodegenFile.mock.calls.length - tsWritesBefore)
			.toBe(1)
	})

	it('keeps later generated writes working after a previous write fails', async () => {
		const ctx = createCtxStub()
		mockCreateCtx.mockReturnValue(ctx)

		const mod = await import('./index')
		const plugin = mod.unpluginFactory(undefined, { framework: 'vite' } as any) as any

		plugin.vite.configResolved?.({ root: '/app', command: 'serve' } as any)
		await plugin.buildStart.call({ addWatchFile: vi.fn() } as any)

		ctx.writeCssCodegenFile.mockRejectedValueOnce(new Error('css write failed'))
		ctx.writeCssCodegenFile.mockResolvedValue(undefined)
		ctx.writeTsCodegenFile.mockResolvedValue(undefined)

		const cssWritesBefore = ctx.writeCssCodegenFile.mock.calls.length
		const tsWritesBefore = ctx.writeTsCodegenFile.mock.calls.length

		await expect(ctx.hooks.styleUpdated.emit())
			.rejects.toThrow('css write failed')
		await ctx.hooks.tsCodegenUpdated.emit()
		await ctx.hooks.styleUpdated.emit()

		expect(ctx.writeCssCodegenFile.mock.calls.length - cssWritesBefore)
			.toBe(3)
		expect(ctx.writeTsCodegenFile.mock.calls.length - tsWritesBefore)
			.toBe(1)
	})

	it('retries queued ts writes when a shared css+ts flush fails on css first', async () => {
		const ctx = createCtxStub()
		mockCreateCtx.mockReturnValue(ctx)

		const mod = await import('./index')
		const plugin = mod.unpluginFactory(undefined, { framework: 'vite' } as any) as any

		plugin.vite.configResolved?.({ root: '/app', command: 'serve' } as any)
		await plugin.buildStart.call({ addWatchFile: vi.fn() } as any)

		ctx.writeCssCodegenFile.mockRejectedValueOnce(new Error('css write failed'))
		ctx.writeCssCodegenFile.mockResolvedValue(undefined)
		ctx.writeTsCodegenFile.mockResolvedValue(undefined)

		const cssWritesBefore = ctx.writeCssCodegenFile.mock.calls.length
		const tsWritesBefore = ctx.writeTsCodegenFile.mock.calls.length

		const styleUpdate = ctx.hooks.styleUpdated.emit()
		const tsUpdate = ctx.hooks.tsCodegenUpdated.emit()
		const results = await Promise.allSettled([styleUpdate, tsUpdate])

		expect(results.some(result => result.status === 'rejected'))
			.toBe(true)
		expect(ctx.writeCssCodegenFile.mock.calls.length - cssWritesBefore)
			.toBe(2)
		expect(ctx.writeTsCodegenFile.mock.calls.length - tsWritesBefore)
			.toBe(1)
	})

	it('retries queued ts writes when a shared css+ts flush fails on ts after css succeeds', async () => {
		const ctx = createCtxStub()
		mockCreateCtx.mockReturnValue(ctx)

		const mod = await import('./index')
		const plugin = mod.unpluginFactory(undefined, { framework: 'vite' } as any) as any

		plugin.vite.configResolved?.({ root: '/app', command: 'serve' } as any)
		await plugin.buildStart.call({ addWatchFile: vi.fn() } as any)

		ctx.writeCssCodegenFile.mockResolvedValue(undefined)
		ctx.writeTsCodegenFile.mockRejectedValueOnce(new Error('ts write failed'))
		ctx.writeTsCodegenFile.mockResolvedValue(undefined)

		const cssWritesBefore = ctx.writeCssCodegenFile.mock.calls.length
		const tsWritesBefore = ctx.writeTsCodegenFile.mock.calls.length

		const styleUpdate = ctx.hooks.styleUpdated.emit()
		const tsUpdate = ctx.hooks.tsCodegenUpdated.emit()
		const results = await Promise.allSettled([styleUpdate, tsUpdate])

		expect(results.some(result => result.status === 'rejected'))
			.toBe(true)
		expect(ctx.writeCssCodegenFile.mock.calls.length - cssWritesBefore)
			.toBe(1)
		expect(ctx.writeTsCodegenFile.mock.calls.length - tsWritesBefore)
			.toBe(2)
	})
})
