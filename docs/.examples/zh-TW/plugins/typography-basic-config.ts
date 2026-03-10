// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
	plugins: [typography()],
})
