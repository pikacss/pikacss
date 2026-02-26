import type { Plugin } from 'vite'
import type { PluginOptions } from '.'
import { createVitePlugin } from 'unplugin'
import { unpluginFactory } from './index'

export * from './types'
export default createVitePlugin(unpluginFactory) as any as (options?: PluginOptions) => Plugin
export * from '@pikacss/integration'
