import { defineEngineConfig } from '@pikacss/core'
import { reset } from '@pikacss/plugin-reset'

export default defineEngineConfig({
	reset: 'andy-bell',
	plugins: [reset()],
})