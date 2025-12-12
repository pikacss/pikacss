import { createWebpackPlugin } from 'unplugin'
import { unpluginFactory } from '.'

export * from './types'
export default createWebpackPlugin(unpluginFactory)
export * from '@pikacss/integration'
