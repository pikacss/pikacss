import type { IntegrationContext } from '@pikacss/integration'
import type { UnpluginFactory, UnpluginInstance } from 'unplugin'
import type { ResolvedConfig, ViteDevServer } from 'vite'
import type { PluginOptions, ResolvedPluginOptions } from './types'
import process from 'node:process'
import { createCtx } from '@pikacss/integration'
import { createUnplugin } from 'unplugin'
import { PLUGIN_NAME, VIRTUAL_PIKA_CSS_ID } from './constants'

export interface UnpluginContextMeta {
	framework: 'vite' | 'rollup' | 'webpack' | 'rspack' | 'esbuild' | 'farm' | 'rolldown'
}

function createPromise<T = void>() {
	let resolve: (value: T) => void
	let reject: (reason?: any) => void
	const promise = new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	})
	return { promise, resolve: resolve!, reject: reject! }
}

export const unpluginFactory: UnpluginFactory<PluginOptions | undefined, false> = (options, _meta) => {
	const {
		currentPackageName = '@pikacss/unplugin-pikacss',
		config: configOrPath,
		tsCodegen = true,
		devCss = 'pika.dev.css',
		target = ['**/*.vue', '**/*.tsx', '**/*.jsx'],
		fnName = 'pika',
		transformedFormat = 'string',
		autoCreateConfig = true,
	} = options ?? {}

	const resolvedOptions: ResolvedPluginOptions = {
		currentPackageName,
		configOrPath,
		tsCodegen: tsCodegen === true ? 'pika.gen.ts' : tsCodegen,
		devCss,
		target,
		fnName,
		transformedFormat,
		autoCreateConfig,
	}

	const { promise, resolve } = createPromise<IntegrationContext>()
	function getCtx() {
		return promise
	}

	let ctx: IntegrationContext = null!
	let cwd = process.cwd()

	return {
		name: PLUGIN_NAME,
		enforce: 'pre',

		async buildStart() {
			ctx = await createCtx({
				cwd,
				...resolvedOptions,
			})
			resolve(ctx)

			ctx.hooks.styleUpdated.on(() => ctx.writeDevCssFile())
			ctx.hooks.tsCodegenUpdated.on(() => ctx.writeTsCodegenFile())
		},

		resolveId(id: string) {
			if (id === VIRTUAL_PIKA_CSS_ID) {
				// In dev mode, resolve to the actual file
				// In build mode, return a virtual module
				if (ctx?.devCssFilepath) {
					return ctx.devCssFilepath
				}
				return id
			}
			return null
		},

		load(id: string) {
			if (id === VIRTUAL_PIKA_CSS_ID) {
				return ''
			}
			return null
		},

		transform(code: string, id: string) {
			if (!ctx)
				return null
			return ctx.transform(code, id)
		},

		// Vite-specific hooks
		vite: {
			async configResolved(config: ResolvedConfig) {
				cwd = config.root
			},
			configureServer(server: ViteDevServer) {
				// Need to wait for ctx to be initialized
				getCtx()
					.then((ctx) => {
						server.watcher.add(ctx.configSources)
						server.watcher.on('add', handleFileChange)
						server.watcher.on('unlink', handleFileChange)
						server.watcher.on('change', handleFileChange)

						async function handleFileChange(file: string) {
							if (ctx.configSources.includes(file)) {
								const moduleIds = Array.from(ctx.usages.keys())
								await ctx.init()
								moduleIds.forEach((id) => {
									const mod = server.moduleGraph.getModuleById(id)
									if (mod) {
										server.moduleGraph.invalidateModule(mod)
										server.reloadModule(mod)
									}
								})
							}
						}
					})
			},
		},

		// Additional getCtx function exposed for consumers
		getCtx,
	} as any
}

export const unplugin: UnpluginInstance<PluginOptions | undefined, false> & {
	getCtx?: () => Promise<IntegrationContext>
} = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
