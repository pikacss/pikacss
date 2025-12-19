import type { NuxtModule } from '@nuxt/schema'
import type { PluginOptions } from '@pikacss/unplugin-pikacss/vite'
import { addPluginTemplate, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import PikaCSSVitePlugin from '@pikacss/unplugin-pikacss/vite'

export type ModuleOptions = Omit<PluginOptions, 'currentPackageName'>

export default (defineNuxtModule<ModuleOptions>({
	meta: {
		name: 'pikacss',
		configKey: 'pikacss',
	},
	async setup(_, nuxt) {
		addPluginTemplate({
			filename: 'pikacss.mjs',
			getContents() {
				return 'import { defineNuxtPlugin } from \'#imports\';\nexport default defineNuxtPlugin(() => {});\nimport "pika.css"; '
			},
		})

		addVitePlugin({
			...PikaCSSVitePlugin({
				currentPackageName: '@pikacss/nuxt-pikacss',
				...(
					nuxt.options.pikacss || {
						scan: {
							include: ['**/*.vue', '**/*.tsx', '**/*.jsx'],
						},
					}
				),
			}),
			enforce: 'pre',
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
