import { defineEnginePlugin } from '@pikacss/core'

export function createMyPlugin(options: { prefix?: string } = {}) {
	const { prefix = 'my' } = options

	return defineEnginePlugin({
		name: `${prefix}-plugin`,
		order: 'pre',

		// --- 非同步 hooks（transform）---

		configureRawConfig(config) {
			// 在 config resolve 前修改 raw config
			config.prefix = config.prefix || prefix
			return config
		},

		configureResolvedConfig(resolvedConfig) {
			// 在 resolved config 建立後再調整
			return resolvedConfig
		},

		async configureEngine(engine) {
			// 設定 engine 功能、加入 preflights 等
			engine.addPreflight('/* my-plugin preflight */')
			engine.appendAutocomplete({
				extraProperties: '__myProp',
			})
		},

		transformSelectors(selectors) {
			// 在 style extraction 期間轉換 selectors
			return selectors
		},

		transformStyleItems(styleItems) {
			// 在 engine.use() 期間轉換 style items
			return styleItems
		},

		transformStyleDefinitions(styleDefinitions) {
			// 在 style extraction 期間轉換 style definitions
			return styleDefinitions
		},

		// --- 同步 hooks（notification）---

		rawConfigConfigured(_config) {
			// 讀取已定案的 raw config
		},

		preflightUpdated() {
			// 回應 preflight 變更
		},

		atomicStyleAdded(_atomicStyle) {
			// 回應新的 atomic style
		},

		autocompleteConfigUpdated() {
			// 回應 autocomplete config 變更
		},
	})
}