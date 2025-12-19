import type { JsPlugin } from '@farmfe/core'
import type { PluginOptions } from './types'
import { createFarmPlugin } from 'unplugin'
import { unpluginFactory } from '.'

export * from './types'
export default createFarmPlugin(unpluginFactory) satisfies ((options?: PluginOptions | undefined) => JsPlugin)
export * from '@pikacss/integration'
