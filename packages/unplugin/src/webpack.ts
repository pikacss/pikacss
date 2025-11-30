import unplugin from './core'

/**
 * Webpack plugin for PikaCSS
 */
export default unplugin.webpack

export { VIRTUAL_PIKA_CSS_ID } from './constants'
export type { PluginOptions } from './types'
export * from '@pikacss/integration'
