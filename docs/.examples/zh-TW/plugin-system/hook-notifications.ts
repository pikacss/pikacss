import { defineEnginePlugin } from '@pikacss/core'

export const plugin = defineEnginePlugin({
	name: 'example',

	// 同步：當產生新的 atomic style 時呼叫
	atomicStyleAdded(atomicStyle) {
		console.log(`New atomic style: ${atomicStyle.id}`)
	},

	// 同步：當 preflights 更新時呼叫
	preflightUpdated() {
		console.log('Preflights updated')
	},

	// 同步：當 autocomplete config 變更時呼叫
	autocompleteConfigUpdated() {
		console.log('Autocomplete config updated')
	},
})
