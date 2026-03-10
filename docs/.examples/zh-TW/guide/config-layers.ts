import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	// 在 preflights 與 utilities 之間加入 'components' layer
	layers: {
		base: 0,
		components: 5,
		utilities: 10,
	},
	// 未指定 layer 的 preflights 會進入 'base'，而不是預設的 'preflights'
	defaultPreflightsLayer: 'base',
	// 未指定 layer 的 atomic styles 會進入 'utilities'（這也是預設值）
	defaultUtilitiesLayer: 'utilities',
})
