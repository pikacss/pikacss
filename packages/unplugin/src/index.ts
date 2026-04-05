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

/**
 * Factory function that produces the bundler-agnostic PikaCSS plugin hooks.
 *
 * @param options - User-supplied plugin configuration. When `undefined`, all defaults apply.
 * @param meta - Unplugin metadata providing the target bundler framework name.
 * @returns An unplugin hooks object consumed by Vite, webpack, Rollup, esbuild, and Rspack.
 *
 * @remarks
 * This is the core entry-point called by `createUnplugin`. It resolves user options,
 * creates an integration context via `createCtx`, and wires bundler-specific lifecycle
 * hooks (config resolution, dev-server HMR, build transforms, and config file watching).
 * When consumed through the Vite entry, the plugin also declares `enforce: 'pre'`
 * so PikaCSS transforms run before framework compiler plugins even if the user's
 * Vite `plugins` array lists `vue()` before `pikacss()`.
 *
 * @example
 * ```ts
 * import { unpluginFactory } from '@pikacss/unplugin-pikacss'
 * import { createUnplugin } from 'unplugin'
 *
 * const plugin = createUnplugin(unpluginFactory)
 * ```
 */
export const unpluginFactory: UnpluginFactory<PluginOptions | undefined> = (options, meta) => {
	const {
		cwd: userCwd,
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

	let mode: 'build' | 'serve' = 'build'
	const viteServers = [] as ViteDevServer[]
	const rspackCompilers = [] as RspackCompiler[]

	const ctx = createCtx({
		cwd: resolve(userCwd ?? process.cwd()),
		...resolvedOptions,
	})

	type RuntimeMode = 'build' | 'serve'

	function applyRuntimeContext(nextCwd: string, nextMode: RuntimeMode) {
		if (userCwd == null) {
			ctx.cwd = resolve(nextCwd)
		}
		mode = nextMode
	}

	const debouncedWriteCssCodegenFile = debounce(async () => {
		await ctx.writeCssCodegenFile()
	}, 300)

	const debouncedWriteTsCodegenFile = debounce(async () => {
		await ctx.writeTsCodegenFile()
	}, 300)

	let hooksBound = false
	function bindHooks() {
		if (hooksBound)
			return
		hooksBound = true

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
	let lastSetupCwd: string | null = null
	let pendingSetupCwd: string | null = null
	function setup(reload = false) {
		pendingSetupCwd = ctx.cwd
		setupPromise = setupPromise.then(async () => {
			log.debug('Setting up integration context...')
			const moduleIds = Array.from(ctx.usages.keys())
			hooksBound = false
			await ctx.setup()
			lastSetupCwd = ctx.cwd
			pendingSetupCwd = null
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
			}
		})
		return setupPromise
	}
	function ensureSetup(reload = false) {
		if (!reload && (lastSetupCwd === ctx.cwd || pendingSetupCwd === ctx.cwd))
			return setupPromise
		return setup(reload)
	}
	const debouncedSetup = debounce(setup)

	return {
		name: PLUGIN_NAME,

		enforce: 'pre',

		vite: {
			configResolved: (config) => {
				applyRuntimeContext(config.root, config.command === 'serve' ? 'serve' : 'build')
			},
			configureServer(server) {
				viteServers.push(server as any)
			},
		},
		webpack: (compiler) => {
			applyRuntimeContext(compiler.options.context || process.cwd(), compiler.options.mode === 'development' ? 'serve' : 'build')
		},
		rspack: (compiler) => {
			rspackCompilers.push(compiler)
			applyRuntimeContext(compiler.options.context || process.cwd(), compiler.options.mode === 'development' ? 'serve' : 'build')
		},
		esbuild: {
			async setup(build) {
				applyRuntimeContext(build.initialOptions.absWorkingDir || process.cwd(), mode)

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
			log.debug(`Current mode: ${mode}, cwd: ${ctx.cwd}`)

			await ensureSetup()

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
					await ensureSetup()
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
			async handler(code: string, id: string) {
				await ensureSetup()
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

/**
 * Pre-built universal bundler plugin for PikaCSS.
 *
 * @remarks
 * Created by passing `unpluginFactory` to `createUnplugin`. Import the bundler-specific
 * sub-path (e.g., `@pikacss/unplugin-pikacss/vite`) for a ready-to-use plugin instance.
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import pika from '@pikacss/unplugin-pikacss/vite'
 *
 * export default defineConfig({
 *   plugins: [pika()],
 * })
 * ```
 */
export const unpluginPika = /* #__PURE__ */ createUnplugin(unpluginFactory)

/**
 * Default export — the pre-built {@link unpluginPika} instance.
 *
 * Allows `import pika from 'unplugin-pikacss/<bundler>'` usage.
 */
export default unpluginPika
