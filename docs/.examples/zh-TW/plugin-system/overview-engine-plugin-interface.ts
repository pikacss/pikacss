import type { AtomicStyle, Engine, EngineConfig, ResolvedEngineConfig, ResolvedStyleDefinition, ResolvedStyleItem } from '@pikacss/core'

// 這是 EnginePlugin 介面的簡化視圖。
// 完整定義請見 packages/core/src/internal/plugin.ts。
export interface EnginePlugin {
	/** 唯一的 plugin 名稱（必填） */
	name: string

	/** 執行順序：'pre' (0) → 預設 (1) → 'post' (2) */
	order?: 'pre' | 'post'

	// --- 非同步 hooks（可回傳修改後的 payload） ---

	/** 在 raw config 被 resolved 前修改它 */
	configureRawConfig?: (config: EngineConfig) => EngineConfig | void | Promise<EngineConfig | void>
	/** 修改 resolved config */
	configureResolvedConfig?: (resolvedConfig: ResolvedEngineConfig) => ResolvedEngineConfig | void | Promise<ResolvedEngineConfig | void>
	/** 在 engine 建立後修改實例 */
	configureEngine?: (engine: Engine) => Engine | void | Promise<Engine | void>
	/** 在樣式提取期間轉換 selectors */
	transformSelectors?: (selectors: string[]) => string[] | void | Promise<string[] | void>
	/** 在 engine.use() 期間轉換 style items */
	transformStyleItems?: (styleItems: ResolvedStyleItem[]) => ResolvedStyleItem[] | void | Promise<ResolvedStyleItem[] | void>
	/** 在樣式提取期間轉換 style definitions */
	transformStyleDefinitions?: (styleDefinitions: ResolvedStyleDefinition[]) => ResolvedStyleDefinition[] | void | Promise<ResolvedStyleDefinition[] | void>

	// --- 同步 hooks（僅用於通知） ---

	/** 在 raw config 穩定後呼叫 */
	rawConfigConfigured?: (config: EngineConfig) => void
	/** 在 preflight CSS 變更時呼叫 */
	preflightUpdated?: () => void
	/** 在產生新的 atomic style 時呼叫 */
	atomicStyleAdded?: (atomicStyle: AtomicStyle) => void
	/** 在 autocomplete 設定變更時呼叫 */
	autocompleteConfigUpdated?: () => void
}
