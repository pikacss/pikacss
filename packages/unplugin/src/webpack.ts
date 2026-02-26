import { createWebpackPlugin } from 'unplugin'
import { unpluginFactory } from './index'

export * from './types'
export default createWebpackPlugin(unpluginFactory)
export * from '@pikacss/integration'
