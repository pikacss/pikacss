import type { NuxtModule } from '@nuxt/schema'
import type { PluginOptions as UnpluginPikaCSSPluginOptions } from '@pikacss/unplugin-pikacss/vite'
import { addPluginTemplate, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import PikaCSSVitePlugin from '@pikacss/unplugin-pikacss/vite'

export type ModuleOptions = Omit<UnpluginPikaCSSPluginOptions, 'currentPackageName'>

export default (defineNuxtModule<ModuleOptions>({
	meta: {
		name: 'pikacss',
		configKey: 'pikacss',
	},
	async setup(_, nuxt) {
		addPluginTemplate({
			filename: 'pikacss.mjs',
			getContents() {
				return 'import { defineNuxtPlugin } from \'#imports\';\nexport default defineNuxtPlugin(() => {});\nimport "virtual:pika.css"; '
			},
		})

		const vitePlugin = PikaCSSVitePlugin({
			currentPackageName: '@pikacss/nuxt-pikacss',
			...(nuxt.options.pikacss || {}),
		})
		addVitePlugin(vitePlugin)

		nuxt.hook('prepare:types', async (options) => {
			const ctx = await vitePlugin.getCtx()
			const tsCodegenFilepath = ctx.tsCodegenFilepath
			if (tsCodegenFilepath == null)
				return
			options.tsConfig.include ||= []
			options.tsConfig.include.push(tsCodegenFilepath)
		})
	},
}) as NuxtModule<ModuleOptions>)

export * from '@pikacss/unplugin-pikacss/vite'

declare module '@nuxt/schema' {
	interface NuxtConfig {
		pikacss?: ModuleOptions
	}
	interface NuxtOptions {
		pikacss?: ModuleOptions
	}
}
