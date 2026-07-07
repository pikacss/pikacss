/// <reference path="./src/pika.gen.ts" />
import { icons } from '@pikacss/plugin-icons'
import { reset } from '@pikacss/plugin-reset'
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	plugins: [
		icons(),
		reset(),
	],
	icons: {
		prefix: 'i-',
		scale: 1.2,
	},
	reset: 'modern-normalize',
})
