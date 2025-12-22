import type { Server as FarmServer } from '@farmfe/core'
import type { RspackCompiler, UnpluginFactory } from 'unplugin'
import type { ViteDevServer } from 'vite'
import type { PluginOptions, ResolvedPluginOptions } from './types'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import { createCtx, log } from '@pikacss/integration'
import { resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import { createUnplugin } from 'unplugin'

export * from './types'
export * from '@pikacss/integration'

const RE_VIRTUAL_PIKA_CSS_ID = /^pika\.css$/

const PLUGIN_NAME = 'unplugin-pikacss'

export const unpluginFactory: UnpluginFactory<PluginOptions | undefined> = (options, meta) => {
	const {
		currentPackageName = '@pikacss/unplugin-pikacss',
		config: configOrPath,
		tsCodegen = true,
		cssCodegen = true,
		scan = {},
		fnName = 'pika',
		transformedFormat = 'string',
		autoCreateConfig = true,
	} = options ?? {}

	log.debug('Creating unplugin factory with options:', options)

	const resolvedOptions: ResolvedPluginOptions = {
		currentPackageName,
		configOrPath,
		tsCodegen: tsCodegen === true ? 'pika.gen.ts' : tsCodegen,
		cssCodegen: cssCodegen === true ? 'pika.gen.css' : cssCodegen,
		scan: {
			include: typeof scan?.include === 'string' ? [scan.include] : (scan?.include || ['**/*.{js,ts,jsx,tsx,vue}']),
			exclude: typeof scan?.exclude === 'string' ? [scan.exclude] : (scan?.exclude || ['node_modules/**', 'dist/**']),
		},
		fnName,
		transformedFormat,
		autoCreateConfig,
	}
	log.debug('Resolved plugin options:', resolvedOptions)

	let cwd = resolve(process.cwd())
	let mode: 'build' | 'serve' = 'build'
	const viteServers = [] as ViteDevServer[]
	const rspackCompilers = [] as RspackCompiler[]
	const farmServers = [] as FarmServer[]

	const ctx = createCtx({
		cwd,
		...resolvedOptions,
	})

	const debouncedWriteCssCodegenFile = debounce(async () => {
		await ctx.writeCssCodegenFile()
	}, 300)

	const debouncedWriteTsCodegenFile = debounce(async () => {
		await ctx.writeTsCodegenFile()
	}, 300)

	function bindHooks() {
		ctx.hooks.styleUpdated.on(() => {
			log.debug(`Style updated, ${ctx.engine.store.atomicStyleIds.size} atomic styles generated`)
			debouncedWriteCssCodegenFile()
		})
		ctx.hooks.tsCodegenUpdated.on(() => {
			log.debug('TypeScript code generation updated')
			debouncedWriteTsCodegenFile()
		})
	}

	let setupPromise = Promise.resolve()
	let setupCounter = 0
	function setup(reload = false) {
		setupPromise = setupPromise.then(async () => {
			log.debug('Setting up integration context...')
			const currentSetup = ++setupCounter
			const moduleIds = Array.from(ctx.usages.keys())
			await ctx.setup()
			if (currentSetup !== setupCounter) {
				log.debug('Setup outdated, skipping...')
				return
			}
			await debouncedWriteCssCodegenFile()
			await debouncedWriteTsCodegenFile()
			bindHooks()

			if (reload) {
				if (meta.framework === 'vite') {
					const promises = [] as Promise<void>[]
					moduleIds.forEach((id) => {
						viteServers.forEach((server) => {
							const mod = server.moduleGraph.getModuleById(id)
							if (mod) {
								log.debug(`Invalidating and reloading module: ${id}`)
								server.moduleGraph.invalidateModule(mod)
								promises.push(server.reloadModule(mod))
							}
						})
					})
					await Promise.all(promises)
				}

				else if (meta.framework === 'rspack') {
					rspackCompilers.forEach((compiler) => {
						if (compiler.watching == null)
							return

						log.debug('Invalidating rspack compiler due to setup changes')

						compiler.watching.invalidateWithChangesAndRemovals(new Set(moduleIds))
						compiler.watching.invalidate()
					})
				}

				else if (meta.framework === 'farm') {
					const promises = [] as Promise<any>[]
					farmServers.forEach((server) => {
						if (server.hmrEngine == null)
							return

						promises.push(server.hmrEngine.recompileAndSendResult())
					})
					await Promise.all(promises)
				}
			}
		})
	}
	const debouncedSetup = debounce(setup)
	setup()

	return {
		name: PLUGIN_NAME,

		vite: {
			configResolved: (config) => {
				cwd = resolve(config.root)
				mode = config.command === 'serve' ? 'serve' : 'build'
			},
			configureServer(server) {
				viteServers.push(server)
			},
		},
		webpack: (compiler) => {
			cwd = resolve(compiler.options.context || process.cwd())
			mode = compiler.options.mode === 'development' ? 'serve' : 'build'
		},
		rspack: (compiler) => {
			cwd = resolve(compiler.options.context || process.cwd())
			mode = compiler.options.mode === 'development' ? 'serve' : 'build'
		},
		farm: {
			configResolved: (config) => {
				cwd = resolve(config.root || process.cwd())
				mode = config.envMode === 'development' ? 'serve' : 'build'
			},
			configureDevServer(server) {
				farmServers.push(server)
			},
		},
		esbuild: {
			async setup(build) {
				cwd = resolve(build.initialOptions.absWorkingDir || process.cwd())

				// Handle virtual module resolution
				build.onResolve(
					{
						filter: RE_VIRTUAL_PIKA_CSS_ID,
					},
					(args) => {
						log.debug(`Resolved virtual CSS module: ${args.path} -> ${ctx.cssCodegenFilepath}`)
						return {
							path: ctx.cssCodegenFilepath,
							namespace: 'file',
						}
					},
				)
			},
		},

		async buildStart() {
			log.debug('Plugin buildStart hook triggered')
			log.debug(`Current mode: ${mode}, cwd: ${cwd}`)

			await setupPromise

			if (mode === 'build') {
				log.debug('Running full CSS code generation in build mode')
				await ctx.fullyCssCodegen()
			}

			if (ctx.resolvedConfigPath != null) {
				this.addWatchFile(ctx.resolvedConfigPath)
				log.debug(`Added watch file: ${ctx.resolvedConfigPath}`)
			}
		},

		resolveId: meta.framework === 'esbuild'
			? undefined
			: async function (id: string) {
				if (RE_VIRTUAL_PIKA_CSS_ID.test(id)) {
					await setupPromise
					log.debug(`Resolved virtual CSS module: ${id} -> ${ctx.cssCodegenFilepath}`)
					return ctx.cssCodegenFilepath
				}
				return null
			},

		transform: {
			filter: {
				get id() {
					return ctx.transformFilter
				},
			},
			handler(code: string, id: string) {
				if (meta.framework === 'webpack' && ctx.resolvedConfigPath != null) {
					this.addWatchFile(ctx.resolvedConfigPath)
					log.debug(`Added watch file: ${ctx.resolvedConfigPath}`)
				}
				return ctx.transform(code, id)
			},
		},

		watchChange(id: string) {
			if (id === ctx.resolvedConfigPath && readFileSync(id, 'utf-8') !== ctx.resolvedConfigContent) {
				log.info('Configuration file changed, reloading...')
				debouncedSetup(true)
			}
		},
	}
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
