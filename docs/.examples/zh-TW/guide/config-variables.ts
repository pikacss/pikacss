import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	variables: {
		variables: {
			// 簡單變數（預設會輸出在 :root 之下）
			'--color-bg': '#ffffff',
			'--color-text': '#1a1a1a',

			// 值為 null 的變數（只提供 autocomplete，不會真的輸出 CSS）
			'--external-var': null,

			// 掛在 selector 範圍下的 variables
			'[data-theme="dark"]': {
				'--color-bg': '#1a1a1a',
				'--color-text': '#ffffff',
			},

			// 帶有進階設定的 variable
			'--spacing-unit': {
				value: '4px',
				autocomplete: {
					asValueOf: ['margin', 'padding', 'gap'],
					asProperty: true,
				},
				pruneUnused: false, // 永遠包含在輸出中
			},
		},

		// 是否要從最終 CSS 移除未使用的 variables
		pruneUnused: true,

		// 不管有沒有被使用，都會一律保留的 variables
		safeList: ['--color-bg', '--color-text'],
	},
})
