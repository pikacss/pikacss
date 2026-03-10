import { defineEngineConfig } from '@pikacss/core'
import { icons } from '@pikacss/plugin-icons'
import { reset } from '@pikacss/plugin-reset'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
	plugins: [
		reset(),
		icons(),
		typography(),
	],
	// 透過模組擴充，plugin config options 也能保持型別安全
	reset: 'modern-normalize',
	icons: { prefix: 'i-', scale: 1.2 },
	typography: {},
})
