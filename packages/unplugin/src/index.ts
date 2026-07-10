import type { RspackCompiler, UnpluginFactory } from 'unplugin'
import type { ViteDevServer } from 'vite'
import type { PluginOptions, ResolvedPluginOptions } from './types'
import { readFileSync } from 'node:fs'
import process from 'node:process'
import { createCtx, DEFAULT_MARKUP_EXTENSIONS, log } from '@pikacss/integration'
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
		markupExtensions,
		transformedFormat = 'string',
		autoCreateConfig = true,
	} = options ?? {}

	log.debug('Creating unplugin factory with options:', options)

	// The default include glob must cover every extension the scanner
	// supports: the JS family plus the effective markup extensions — the
	// integration merges user `markupExtensions` with the built-in defaults,
	// so the default glob mirrors that merge. An explicit `scan.include`
	// always wins verbatim.
	const defaultIncludeExtensions = [
		'js',
		'ts',
		'jsx',
		'tsx',
		...new Set(
			[...DEFAULT_MARKUP_EXTENSIONS, ...(markupExtensions ?? [])]
				.map(ext => ext.replace(/^\./, ''))
				.filter(ext => ext.length > 0),
		),
	]
	const defaultInclude = [`**/*.{${defaultIncludeExtensions.join(',')}}`]

	const resolvedOptions: ResolvedPluginOptions = {
		currentPackageName,
		configOrPath,
		tsCodegen: tsCodegen === true ? 'pika.gen.ts' : tsCodegen,
		cssCodegen: cssCodegen === true ? 'pika.gen.css' : cssCodegen,
		scan: {
			include: typeof scan?.include === 'string' ? [scan.include] : (scan?.include || defaultInclude),
			exclude: typeof scan?.exclude === 'string' ? [scan.exclude] : (scan?.exclude || ['node_modules/**', 'dist/**']),
		},
		fnName,
		markupExtensions,
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
	let activeTransforms = 0
	let pendingCssWrite = false
	let pendingTsWrite = false
	let generatedWritePromise = Promise.resolve()

	function flushPendingGeneratedWrites() {
		generatedWritePromise = generatedWritePromise
			.catch(() => {})
			.then(async () => {
				if (activeTransforms > 0)
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
			activeTransforms = 0
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
			// error) must not poison the promise chain for every later call.
			.catch((error: any) => {
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
				activeTransforms++
				if (meta.framework === 'webpack' && ctx.resolvedConfigPath != null) {
					this.addWatchFile(ctx.resolvedConfigPath)
					log.debug(`Added watch file: ${ctx.resolvedConfigPath}`)
				}
				try {
					return await ctx.transform(code, id)
				}
				finally {
					if (activeTransforms > 0)
						activeTransforms--
					if (activeTransforms === 0) {
						// This may be a second flush call if hooks already queued a flush,
						// but pendingCssWrite/pendingTsWrite will already be false — safe no-op.
						await flushPendingGeneratedWrites()
					}
				}
			},
		},

		watchChange(id: string, change?: { event: 'create' | 'update' | 'delete' }) {
			if (change?.event === 'delete' && (ctx.usages.has(id) || ctx.previewUsages.has(id))) {
				// Drop styles contributed by deleted source files so they do not
				// linger in the generated CSS until the next full rebuild.
				log.debug(`Source file deleted, dropping its usages: ${id}`)
				ctx.usages.delete(id)
				ctx.previewUsages.delete(id)
				queueCssWrite()
				queueTsWrite()
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
