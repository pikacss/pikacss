import unplugin from './core'

/**
 * esbuild plugin for PikaCSS
 */
export default unplugin.esbuild

export { VIRTUAL_PIKA_CSS_ID } from './constants'
export type { PluginOptions } from './types'
export * from '@pikacss/integration'
