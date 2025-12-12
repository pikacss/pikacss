import type { IntegrationContext } from '@pikacss/integration'
import type { UnpluginFactory } from 'unplugin'
import type { PluginOptions, ResolvedPluginOptions } from './types'
import process from 'node:process'
import { createCtx as _createCtx, log } from '@pikacss/integration'
import { createUnplugin } from 'unplugin'

export * from './types'
export * from '@pikacss/integration'

const RE_VIRTUAL_PIKA_CSS_ID = /^pika\.css$/

const PLUGIN_NAME = 'unplugin-pikacss'

function createPromise<T = void>() {
	let resolve: (value: T) => void
	let reject: (reason?: any) => void
	const promise = new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	})
	return { promise, resolve: resolve!, reject: reject! }
}

export const unpluginFactory: UnpluginFactory<PluginOptions | undefined> = (options, meta) => {
	const {
		currentPackageName = '@pikacss/unplugin-pikacss',
		config: configOrPath,
		tsCodegen = true,
		cssCodegen = true,
		scan,
		fnName = 'pika',
		transformedFormat = 'string',
		autoCreateConfig = true,
		onContextCreated,
	} = options ?? {}
	log.debug('Creating unplugin factory with options:', options)

	const resolvedOptions: ResolvedPluginOptions = {
		currentPackageName,
		configOrPath,
		tsCodegen: tsCodegen === true ? 'pika.gen.ts' : tsCodegen,
		cssCodegen: cssCodegen === true ? 'pika.gen.css' : cssCodegen,
		scan: {
			patterns: scan?.patterns ?? ['**/*.vue', '**/*.tsx', '**/*.jsx'],
			options: scan?.options ?? {},
		},
		fnName,
		transformedFormat,
		autoCreateConfig,
	}
	log.debug('Resolved plugin options:', resolvedOptions)

	let cwd = process.cwd()
	let mode: 'build' | 'serve' = 'build'

	const {
		promise: untilReadyToCreateCtx,
		resolve: resolveReadyToCreateCtx,
	} = createPromise<void>()
	const createCtx = async () => {
		log.debug('Waiting for build tool config resolution before creating context')
		await untilReadyToCreateCtx
		log.debug(`Creating integration context in ${mode} mode, cwd: ${cwd}`)
		const ctx = await _createCtx({
			cwd,
			...resolvedOptions,
		})
		log.debug('Integration context created successfully')
		onContextCreated?.(ctx)
		return ctx
	}

	const ctxPromise = createCtx()
	function getCtx() {
		return ctxPromise
	}
	let _ctx: IntegrationContext
	ctxPromise.then((ctx) => {
		_ctx = ctx
	})

	return {
		name: PLUGIN_NAME,

		vite: {
			configResolved: (config) => {
				cwd = config.root
				mode = config.command === 'serve' ? 'serve' : 'build'
				log.debug(`Vite config resolved: mode=${mode}, root=${config.root}`)
				resolveReadyToCreateCtx()
			},
		},
		webpack: (compiler) => {
			cwd = compiler.options.context || process.cwd()
			mode = compiler.options.mode === 'development' ? 'serve' : 'build'
			log.debug(`Webpack config resolved: mode=${mode}, context=${cwd}`)
			resolveReadyToCreateCtx()
		},
		rspack: (compiler) => {
			cwd = compiler.options.context || process.cwd()
			mode = compiler.options.mode === 'development' ? 'serve' : 'build'
			log.debug(`Rspack config resolved: mode=${mode}, context=${cwd}`)
			resolveReadyToCreateCtx()
		},
		farm: {
			configResolved: (config) => {
				cwd = config.root || process.cwd()
				mode = config.envMode === 'development' ? 'serve' : 'build'
				log.debug(`Farm config resolved: mode=${mode}, root=${cwd}`)
				resolveReadyToCreateCtx()
			},
		},
		esbuild: {
			async setup(build) {
				cwd = build.initialOptions.absWorkingDir || process.cwd()
				log.debug(`Esbuild config resolved: workingDir=${cwd}`)
				resolveReadyToCreateCtx()
				const ctx = await getCtx()

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
			// Ensure the context is ready to be created
			resolveReadyToCreateCtx()
			log.debug('Plugin buildStart hook triggered')
			const ctx = await getCtx()

			if (mode === 'build') {
				log.debug('Running full CSS code generation in build mode')
				await ctx.fullyCssCodegen()
			}

			ctx.hooks.styleUpdated.on(() => {
				ctx.writeCssCodegenFile()
				log.debug(`Style updated, ${ctx.engine.store.atomicStyleIds.size} atomic styles generated`)
			})
			ctx.hooks.tsCodegenUpdated.on(() => {
				log.debug('TypeScript code generation updated')
				ctx.writeTsCodegenFile()
			})
		},

		resolveId: meta.framework === 'esbuild'
			? undefined
			: function (id: string) {
				if (RE_VIRTUAL_PIKA_CSS_ID.test(id)) {
					log.debug(`Resolved virtual CSS module: ${id} -> ${_ctx.cssCodegenFilepath}`)
					return _ctx.cssCodegenFilepath
				}
				return null
			},

		transformInclude(id) {
			return _ctx.transformInclude(id)
		},

		transform(code: string, id: string) {
			if (_ctx.transformInclude(id) && _ctx.resolvedConfigPath != null) {
				this.addWatchFile(_ctx.resolvedConfigPath)
				log.debug(`Added watch file: ${_ctx.resolvedConfigPath}`)
			}
			return _ctx.transform(code, id)
		},
	}
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
