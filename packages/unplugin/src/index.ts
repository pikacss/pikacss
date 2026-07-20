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
 * @returns An unplugin hooks object consumed by the exported bundler adapters.
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
		autoCreateConfig = false,
	} = options ?? {}

	log.debug('Creating unplugin factory with options:', options)

	// The default include glob covers every extension the AST compiler
	// supports: the full JS family (`JS_PROCESSOR_EXTENSIONS`) plus Vue SFCs.
	// An explicit `scan.include` always wins verbatim.
	const defaultInclude = ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}']

	const resolvedOptions: ResolvedPluginOptions = {
		currentPackageName,
		configOrPath,
		tsCodegen: tsCodegen === true ? 'pika.gen.ts' : tsCodegen,
		cssCodegen: cssCodegen === true ? 'pika.gen.css' : cssCodegen,
		scan: {
			include: typeof scan?.include === 'string' ? [scan.include] : (scan?.include || defaultInclude),
			exclude: typeof scan?.exclude === 'string' ? [scan.exclude] : (scan?.exclude || ['node_modules/**', 'dist/**', '.git/**', '.nuxt/**', '.output/**', 'coverage/**']),
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
		// Build hard-fails on a bad config; dev keeps serving on the last-good engine.
		ctx.configErrorBehavior = nextMode === 'build' ? 'throw' : 'retain-last-good'
	}

	const debouncedWriteCssCodegenFile = debounce(async () => {
		await ctx.writeCssCodegenFile()
	}, 300)

	const debouncedWriteTsCodegenFile = debounce(async () => {
		await ctx.writeTsCodegenFile()
	}, 300)
	let pendingCssWrite = false
	let pendingTsWrite = false
	let generatedWritePromise = Promise.resolve()

	function flushPendingGeneratedWrites() {
		generatedWritePromise = generatedWritePromise
			.catch(() => {})
			.then(async () => {
				// Defer while transforms are in flight; the transform handler
				// flushes again once the context reports idle.
				if (!ctx.isIdle)
					return

				const shouldWriteCss = pendingCssWrite
				const shouldWriteTs = pendingTsWrite

				pendingCssWrite = false
				pendingTsWrite = false

				if (shouldWriteCss) {
					try {
						await debouncedWriteCssCodegenFile()
					}
					catch (error) {
						pendingCssWrite = true
						if (shouldWriteTs)
							pendingTsWrite = true
						throw error
					}
				}

				if (shouldWriteTs) {
					try {
						await debouncedWriteTsCodegenFile()
					}
					catch (error) {
						pendingTsWrite = true
						throw error
					}
				}
			})

		return generatedWritePromise
	}

	// Queued generated-file writes are fire-and-forget: they run from event
	// hook listeners (`createEventHook.trigger` discards listener return
	// values) and `watchChange`, so a rejected flush promise would surface as
	// an unhandled rejection and kill the dev server process (ENOSPC, EBUSY
	// on Windows, read-only dir, ...). `queueCssWrite`/`queueTsWrite` therefore
	// attach a logging rejection handler in the same turn and return `void`,
	// so future call sites cannot silently drop the rejection. The pending
	// flags survive a failed flush, so the next queued write retries. Awaited
	// call sites (the transform handler) use `flushPendingGeneratedWrites()`
	// directly and still propagate failures so builds fail loudly.
	function queueCssWrite(): void {
		pendingCssWrite = true
		scheduleGeneratedWritesFlush()
	}

	function queueTsWrite(): void {
		pendingTsWrite = true
		scheduleGeneratedWritesFlush()
	}

	function scheduleGeneratedWritesFlush(): void {
		flushPendingGeneratedWrites()
			.catch((error: any) => {
				log.error(`Failed to write generated files: ${error?.message ?? error}`, error)
			})
	}

	let hooksBound = false
	function bindHooks() {
		if (hooksBound)
			return
		hooksBound = true

		ctx.hooks.styleUpdated.on(() => {
			log.debug(`Style updated, ${ctx.engine.store.atomicStyleIds.size} atomic styles generated`)
			queueCssWrite()
		})
		ctx.hooks.tsCodegenUpdated.on(() => {
			log.debug('TypeScript code generation updated')
			queueTsWrite()
		})
	}

	let setupPromise = Promise.resolve()
	let lastSetupCwd: string | null = null
	let pendingSetupCwd: string | null = null
	let pendingReload = false
	function setup(reload = false) {
		pendingSetupCwd = ctx.cwd
		pendingReload = false
		setupPromise = setupPromise.then(async () => {
			log.debug('Setting up integration context...')
			const moduleIds = Array.from(ctx.usages.keys())
			pendingCssWrite = false
			pendingTsWrite = false
			// generatedWritePromise is intentionally not reset: the promise chain's
			// .catch(() => {}).then(...) recovery means any in-flight flush will see
			// the already-cleared pending flags and become a no-op.
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
			// A rejected setup (e.g. reloadModule failing on a transient syntax
			// error) must not poison the promise chain for every later call — in
			// dev. In build mode a failed setup (bad config/engine) must propagate
			// so the bundler fails the build instead of emitting empty CSS.
			.catch((error: any) => {
				if (mode === 'build')
					throw error
				log.error(`Failed to setup integration context: ${error?.message ?? error}`, error)
			})
		return setupPromise
	}
	function ensureSetup(reload = false) {
		// A config (or config dependency) change may have been observed between
		// builds; make the next build pick it up instead of racing the debounce.
		if (pendingReload)
			return setup(true)
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

			// Bundlers without a dedicated adapter hook (e.g. Rollup) never call
			// applyRuntimeContext, so reaffirm the error policy from the current
			// mode before setup runs.
			ctx.configErrorBehavior = mode === 'build' ? 'throw' : 'retain-last-good'

			await ensureSetup()

			if (mode === 'build') {
				log.debug('Running full CSS code generation in build mode')
				await ctx.fullyCssCodegen()
			}

			// esbuild's buildStart context does not support addWatchFile and
			// would throw; esbuild has no watch-based reload path here anyway.
			if (meta.framework === 'esbuild')
				return

			if (ctx.resolvedConfigPath != null) {
				this.addWatchFile(ctx.resolvedConfigPath)
				log.debug(`Added watch file: ${ctx.resolvedConfigPath}`)
			}

			for (const dep of ctx.engine.configDependencies ?? []) {
				this.addWatchFile(dep)
				log.debug(`Added config dependency watch file: ${dep}`)
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
				// The declarative filter above is baked once by the bundler
				// adapter (relative patterns resolve against process.cwd()),
				// so cwd-dependent excludes — the codegen outputs and ids like
				// node_modules under a Vite root differing from the shell cwd —
				// must be re-checked against the current ctx.cwd at call time.
				if (!ctx.isTransformTarget(id))
					return null
				if (meta.framework === 'webpack' && ctx.resolvedConfigPath != null) {
					this.addWatchFile(ctx.resolvedConfigPath)
					log.debug(`Added watch file: ${ctx.resolvedConfigPath}`)
				}
				try {
					return await ctx.transform(code, id)
				}
				finally {
					// The context already counted this transform as settled here, so
					// isIdle answers whether any OTHER transform is still in flight.
					// Only the last finisher flushes; this may be a second flush call
					// if hooks already queued one, but the pending flags will already
					// be false — safe no-op.
					if (ctx.isIdle) {
						await flushPendingGeneratedWrites()
					}
				}
			},
		},

		async buildEnd() {
			if (mode !== 'build')
				return
			await ctx.waitForIdle()
			// Files whose styles entered the generated CSS during the full scan
			// but that the bundler never reached: dead files or missing imports.
			for (const file of ctx.getScannedButNotTransformedFiles()) {
				log.warn(`Styles from ${file} were included in the generated CSS but the file was never reached by the bundler — dead file or missing import?`)
			}
		},

		watchChange(id: string, change?: { event: 'create' | 'update' | 'delete' }) {
			if (change?.event === 'delete') {
				// Drop styles contributed by deleted source files so they do not
				// linger in the generated CSS until the next full rebuild.
				// dropModule normalizes the id and queues regeneration itself
				// (through the ctx hooks bound above) only when styles existed.
				log.debug(`Source file deleted, dropping its state: ${id}`)
				ctx.dropModule(id)
			}
			if (id === ctx.resolvedConfigPath) {
				let currentContent: string | null = null
				try {
					currentContent = readFileSync(id, 'utf-8')
				}
				catch {
					// Deleted or unreadable: treat as changed so the context
					// re-runs config discovery instead of crashing the watcher.
				}
				if (currentContent !== ctx.resolvedConfigContent) {
					log.info('Configuration file changed, reloading...')
					pendingReload = true
					debouncedSetup(true)
				}
				return
			}
			let isConfigDependency = false
			try {
				isConfigDependency = ctx.engine.configDependencies.has(id)
			}
			catch {
				// Engine not initialized yet; nothing to reload.
			}
			if (isConfigDependency) {
				log.info(`Config dependency changed: ${id}, reloading...`)
				pendingReload = true
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
