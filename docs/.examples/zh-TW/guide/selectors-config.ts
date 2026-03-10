// pika.config.ts
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	selectors: {
		selectors: [
			// 靜態 selectors：[name, replacement]
			// 使用 $ 作為 atomic style 自身 selector 的佔位符
			['hover', '$:hover'],
			['focus', '$:focus'],
			['first-child', '$:first-child'],
			['@dark', '[data-theme="dark"] $'],
			['@md', '@media (min-width: 768px)'],
			['@lg', '@media (min-width: 1024px)'],

			// 動態 selectors：[pattern, resolver, autocomplete?]
			[
				/^@screen-(\d+)$/,
				m => `@media (min-width: ${m[1]}px)`,
				['@screen-640', '@screen-768', '@screen-1024'], // autocomplete 建議
			],
		],
	},
})
