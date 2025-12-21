import { createRspackPlugin } from 'unplugin'
import { unpluginFactory } from '.'

export * from './types'
export default createRspackPlugin(unpluginFactory)
export * from '@pikacss/integration'
