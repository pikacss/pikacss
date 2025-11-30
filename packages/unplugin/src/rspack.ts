import unplugin from './core'

/**
 * Rspack plugin for PikaCSS
 */
export default unplugin.rspack

export { VIRTUAL_PIKA_CSS_ID } from './constants'
export type { PluginOptions } from './types'
export * from '@pikacss/integration'
