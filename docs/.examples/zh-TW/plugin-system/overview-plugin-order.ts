import { defineEnginePlugin } from '@pikacss/core'

// 最先執行（order: 'pre' → priority 0）
export const earlyPlugin = defineEnginePlugin({
	name: 'early-plugin',
	order: 'pre',
	configureRawConfig(config) {
		// 會在預設與 post plugins 之前執行
		return config
	},
})

// 第二個執行（order: undefined → priority 1）
export const normalPlugin = defineEnginePlugin({
	name: 'normal-plugin',
	// 省略 order，代表使用預設優先順序
	configureRawConfig(config) {
		return config
	},
})

// 最後執行（order: 'post' → priority 2）
export const latePlugin = defineEnginePlugin({
	name: 'late-plugin',
	order: 'post',
	configureRawConfig(config) {
		// 會在 pre 與預設 plugins 之後執行
		return config
	},
})
