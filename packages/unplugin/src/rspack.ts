import { createRspackPlugin } from 'unplugin'
import { unpluginFactory } from './index'

export * from './types'
/**
 * PikaCSS plugin factory for Rspack.
 *
 * Wraps the shared PikaCSS unplugin factory into an Rspack-compatible
 * plugin. Accepts optional {@link PluginOptions} to configure scanning,
 * code generation, and engine settings.
 *
 * @example
 * ```ts
 * import pikacss from '@pikacss/unplugin-pikacss/rspack'
 *
 * module.exports = {
 *   plugins: [pikacss()],
 * }
 * ```
 */
export default createRspackPlugin(unpluginFactory)
export * from '@pikacss/integration'
