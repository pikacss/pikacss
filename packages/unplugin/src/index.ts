import type { IntegrationContext } from '@pikacss/integration'
import type { UnpluginFactory } from 'unplugin'
import type { PluginOptions, ResolvedPluginOptions } from './types'
import process from 'node:process'
import { createCtx } from '@pikacss/integration'
import { createUnplugin } from 'unplugin'

function createPromise<T = void>() {
	let resolve: (value: T) => void
	let reject: (reason?: any) => void
	const promise = new Promise<T>((res, rej) => {
		resolve = res
		reject = rej
	})
	return { promise, resolve: resolve!, reject: reject! }
}

export const unpluginFactory: UnpluginFactory<PluginOptions | undefined> = (options) => {
	const {
		currentPackageName = '@pikacss/unplugin-pikacss',
		config: configOrPath,
		tsCodegen = true,
		cssCodegen = true,
		target = ['**/*.vue', '**/*.tsx', '**/*.jsx'],
		fnName = 'pika',
		transformedFormat = 'string',
		autoCreateConfig = true,
	} = options ?? {}

	const resolvedOptions: ResolvedPluginOptions = {
		currentPackageName,
		configOrPath,
		tsCodegen: tsCodegen === true ? 'pika.gen.ts' : tsCodegen,
		cssCodegen: cssCodegen === true ? 'pika.gen.css' : cssCodegen,
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

	return ({
		name: 'unplugin-pikacss',

		async buildStart() {
			ctx = await createCtx({
				cwd: process.cwd(),
				...resolvedOptions,
			})
			resolve(ctx)

			if (ctx.resolvedConfigPath)
				this.addWatchFile(ctx.resolvedConfigPath)

			ctx.hooks.styleUpdated.on(() => ctx.writeCssCodegenFile())
			ctx.hooks.tsCodegenUpdated.on(() => ctx.writeTsCodegenFile())
		},
		// transformInclude(id) {
		// 	return id.endsWith('main.ts')
		// },
		// transform(code) {
		// 	return code.replace('__UNPLUGIN__', `Hello Unplugin! ${options}`)
		// },
	})
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
