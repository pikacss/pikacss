import type { IntegrationContext } from '@pikacss/integration'
import type { UnpluginFactory, UnpluginInstance } from 'unplugin'
import type { ResolvedConfig, ViteDevServer } from 'vite'
import type { Compiler as WebpackCompiler } from 'webpack'
import type { PluginOptions, ResolvedPluginOptions } from './types'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
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
				// Return the devCssFilepath - esbuild will put this in plugin namespace
				// The esbuild.setup hook handles loading from this namespace
				if (ctx?.devCssFilepath) {
					return ctx.devCssFilepath
				}
				return id
			}
			return null
		},

		loadInclude(id: string) {
			// Only handle the virtual pika CSS module and the dev CSS filepath
			return id === VIRTUAL_PIKA_CSS_ID || (ctx?.devCssFilepath && id === ctx.devCssFilepath)
		},

		load(id: string) {
			if (id === VIRTUAL_PIKA_CSS_ID) {
				return ''
			}
			// For non-esbuild bundlers, handle the devCssFilepath
			if (ctx?.devCssFilepath && id === ctx.devCssFilepath) {
				try {
					return readFileSync(id, 'utf-8')
				}
				catch {
					// File doesn't exist yet, this is expected on first build
					return ''
				}
			}
			return null
		},

		// esbuild-specific hooks
		esbuild: {
			// Register onLoad for our namespace to handle the virtual CSS module
			setup(build) {
				build.onLoad({ filter: /\.css$/, namespace: PLUGIN_NAME }, async (args) => {
					try {
						const contents = readFileSync(args.path, 'utf-8')
						return { contents, loader: 'css' }
					}
					catch {
						// File doesn't exist yet, this is expected on first build
						return { contents: '', loader: 'css' }
					}
				})
			},
		},

		transformInclude(id: string) {
			// Only transform JavaScript/TypeScript files
			return /\.(?:vue|[jt]sx?)$/.test(id)
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
					.catch((error) => {
						console.error('[pikacss] Failed to initialize plugin:', error)
					})
			},
		},

		// Webpack-specific hooks
		webpack(compiler: WebpackCompiler) {
			// Get cwd from webpack compiler context
			const webpackCwd = compiler.options.context || process.cwd()
			// Use NormalModuleReplacementPlugin to replace virtual:pika.css with the actual file
			const devCssPath = join(webpackCwd, resolvedOptions.devCss)
			// eslint-disable-next-line ts/no-require-imports
			const { NormalModuleReplacementPlugin } = compiler.webpack || require('webpack')
			new NormalModuleReplacementPlugin(
				/^virtual:pika\.css$/,
				devCssPath,
			)
				.apply(compiler)
		},

		// Rspack-specific hooks - same as webpack
		rspack(compiler: WebpackCompiler) {
			// Get cwd from rspack compiler context
			const rspackCwd = compiler.options.context || process.cwd()
			// Use NormalModuleReplacementPlugin to replace virtual:pika.css with the actual file
			const devCssPath = join(rspackCwd, resolvedOptions.devCss)
			// eslint-disable-next-line ts/no-require-imports
			const { NormalModuleReplacementPlugin } = compiler.webpack || require('@rspack/core')
			new NormalModuleReplacementPlugin(
				/^virtual:pika\.css$/,
				devCssPath,
			)
				.apply(compiler)
		},

		// Additional getCtx function exposed for consumers
		getCtx,
	} as any
}

export const unplugin: UnpluginInstance<PluginOptions | undefined, false> & {
	getCtx?: () => Promise<IntegrationContext>
} = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
