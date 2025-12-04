import type { JsPlugin } from '@farmfe/core'
import type { PluginOptions } from './types'
import unplugin from './core'

/**
 * Farm plugin for PikaCSS
 */
const farmPlugin: (options?: PluginOptions) => JsPlugin = unplugin.farm
export default farmPlugin

export { VIRTUAL_PIKA_CSS_ID } from './constants'
export type { PluginOptions } from './types'
export * from '@pikacss/integration'
