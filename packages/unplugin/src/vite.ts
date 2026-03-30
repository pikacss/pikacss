import type { Plugin } from 'vite'
import type { PluginOptions } from '.'
import { createVitePlugin } from 'unplugin'
import { unpluginFactory } from './index'

export * from './types'
/**
 * PikaCSS plugin factory for Vite.
 *
 * Wraps the shared PikaCSS unplugin factory into a Vite-compatible plugin.
 * Accepts optional {@link PluginOptions} to configure scanning, code
 * generation, and engine settings. Returns a standard Vite `Plugin`.
 *
 * @example
 * ```ts
 * import pikacss from '@pikacss/unplugin-pikacss/vite'
 *
 * export default defineConfig({
 *   plugins: [pikacss()],
 * })
 * ```
 */
export default createVitePlugin(unpluginFactory) as any as (options?: PluginOptions) => Plugin
export * from '@pikacss/integration'
