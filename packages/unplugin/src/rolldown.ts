import { createRolldownPlugin } from 'unplugin'
import { unpluginFactory } from './index'

export * from './types'
/**
 * PikaCSS plugin factory for Rolldown.
 *
 * Wraps the shared PikaCSS unplugin factory into a Rolldown-compatible
 * plugin. Accepts optional {@link PluginOptions} to configure scanning,
 * code generation, and engine settings.
 *
 * @example
 * ```ts
 * import pikacss from '@pikacss/unplugin-pikacss/rolldown'
 *
 * export default {
 *   plugins: [pikacss()],
 * }
 * ```
 */
export default createRolldownPlugin(unpluginFactory)
export * from '@pikacss/integration'
