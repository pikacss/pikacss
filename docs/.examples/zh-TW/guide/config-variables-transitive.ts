import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	variables: {
		variables: {
			// 基礎 token，不會直接在任何 atomic style 中被引用
			'--spacing-base': '4px',
			// 衍生 token，會在值中引用 --spacing-base
			'--spacing-lg': 'calc(var(--spacing-base) * 4)',
		},
		pruneUnused: true,
		// --spacing-base is not in safeList and is never used in pika() calls directly.
		// 但因為 --spacing-lg（它本身有被使用）會透過 var() 引用它，
		// BFS 展開會確保 --spacing-base 也會被保留在 CSS 輸出中。
	},
})
