import { defineEngineConfig } from '@pikacss/core'
import { reset } from '@pikacss/plugin-reset'

export default defineEngineConfig({
	plugins: [reset()],
	// 改用其他 reset preset
	reset: 'eric-meyer',
})
