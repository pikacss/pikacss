import { createWebpackPlugin } from 'unplugin'
import { unpluginFactory } from './index'

export * from './types'
/**
 * PikaCSS plugin factory for webpack.
 *
 * Wraps the shared PikaCSS unplugin factory into a webpack-compatible
 * plugin. Accepts optional {@link PluginOptions} to configure scanning,
 * code generation, and engine settings.
 *
 * @example
 * ```ts
 * import pikacss from '@pikacss/unplugin-pikacss/webpack'
 *
 * module.exports = {
 *   plugins: [pikacss()],
 * }
 * ```
 */
export default createWebpackPlugin(unpluginFactory)
export * from '@pikacss/integration'
