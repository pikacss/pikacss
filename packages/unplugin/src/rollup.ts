import { createRollupPlugin } from 'unplugin'
import { unpluginFactory } from './index'

export * from './types'
export default createRollupPlugin(unpluginFactory)
export * from '@pikacss/integration'
