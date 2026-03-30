import type { NuxtModule } from '@nuxt/schema'
import type { PluginOptions } from '@pikacss/unplugin-pikacss/vite'
import { addPluginTemplate, addVitePlugin, defineNuxtModule } from '@nuxt/kit'
import PikaCSSVitePlugin from '@pikacss/unplugin-pikacss/vite'

/**
 * Configuration options for the PikaCSS Nuxt module.
 *
 * @remarks
 * Mirrors the unplugin `PluginOptions` with `currentPackageName` omitted because
 * the Nuxt module supplies it automatically.
 *
 * @example
 * ```ts
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['@pikacss/nuxt-pikacss'],
 *   pikacss: {
 *     config: './pika.config.ts',
 *     scan: { include: ['**\/*.vue'] },
 *   },
 * })
 * ```
 */
export type ModuleOptions = Omit<PluginOptions, 'currentPackageName'>

/**
 * PikaCSS Nuxt module.
 *
 * Integrates PikaCSS into a Nuxt application by registering a Vite plugin
 * (with `enforce: 'pre'`) and a Nuxt plugin template that imports the
 * generated `pika.css` stylesheet.
 *
 * Configure options under the `pikacss` key in `nuxt.config`. When no
 * options are provided, the module scans `**\/*.{js,ts,jsx,tsx,vue}` by default.
 */
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
							include: ['**/*.{js,ts,jsx,tsx,vue}'],
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
		/**
		 * PikaCSS module options used during Nuxt configuration merging.
		 *
		 * @default `undefined`
		 */
		pikacss?: ModuleOptions
	}
	interface NuxtOptions {
		/**
		 * Resolved PikaCSS module options available at runtime on `nuxt.options`.
		 *
		 * @default `undefined`
		 */
		pikacss?: ModuleOptions
	}
}
