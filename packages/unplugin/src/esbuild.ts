import { createEsbuildPlugin } from 'unplugin'
import { unpluginFactory } from './index'

export * from './types'
/**
 * PikaCSS plugin factory for esbuild.
 *
 * Wraps the shared PikaCSS unplugin factory into an esbuild-compatible
 * plugin. Accepts optional {@link PluginOptions} to configure scanning,
 * code generation, and engine settings.
 *
 * @example
 * ```ts
 * import pikacss from '@pikacss/unplugin-pikacss/esbuild'
 *
 * await esbuild.build({
 *   plugins: [pikacss()],
 * })
 * ```
 */
export default createEsbuildPlugin(unpluginFactory)
export * from '@pikacss/integration'
