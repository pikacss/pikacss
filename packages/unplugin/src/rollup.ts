import { createRollupPlugin } from 'unplugin'
import { unpluginFactory } from './index'

export * from './types'
/**
 * PikaCSS plugin factory for Rollup.
 *
 * Wraps the shared PikaCSS unplugin factory into a Rollup-compatible
 * plugin. Accepts optional {@link PluginOptions} to configure scanning,
 * code generation, and engine settings.
 *
 * @example
 * ```ts
 * import pikacss from '@pikacss/unplugin-pikacss/rollup'
 *
 * export default {
 *   plugins: [pikacss()],
 * }
 * ```
 */
export default createRollupPlugin(unpluginFactory)
export * from '@pikacss/integration'
