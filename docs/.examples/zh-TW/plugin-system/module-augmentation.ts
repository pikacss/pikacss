import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

// 步驟 1：定義你的 config 型別
export interface SpacingConfig {
	/** 基礎 spacing 單位（px）。@default 4 */
	base?: number
}

// 步驟 2：擴充 EngineConfig，讓使用者拿到 autocomplete
declare module '@pikacss/core' {
	interface EngineConfig {
		spacing?: SpacingConfig
	}
}

// 步驟 3：在 plugin 中讀取這份 config
export function spacingPlugin(): EnginePlugin {
	let spacingConfig: SpacingConfig = {}

	return defineEnginePlugin({
		name: 'spacing',

		configureRawConfig(config) {
			if (config.spacing)
				spacingConfig = config.spacing
		},

		configureEngine: async (engine) => {
			const base = spacingConfig.base ?? 4

			// 產生 spacing 變數
			for (let i = 0; i <= 12; i++) {
				engine.variables.add({
					[`--spacing-${i}`]: `${i * base}px`,
				})
			}

			// 加入 spacing shortcuts
			for (let i = 0; i <= 12; i++) {
				engine.shortcuts.add([
					`p-${i}`,
					{ padding: `var(--spacing-${i})` },
				])
				engine.shortcuts.add([
					`m-${i}`,
					{ margin: `var(--spacing-${i})` },
				])
			}
		},
	})
}
