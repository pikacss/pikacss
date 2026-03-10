// pika.config.ts
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	shortcuts: {
		shortcuts: [
			// 靜態 shortcut：[name, styleDefinition]
			['flex-center', {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}],

			// 包含多個 style items 的靜態 shortcut
			['btn-base', [
				{ padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' },
				{ border: 'none', fontSize: '1rem' },
			]],

			// 動態 shortcut：[pattern, resolver, autocomplete?]
			[
				/^m-(\d+)$/,
				m => ({ margin: `${Number(m[1]) * 0.25}rem` }),
				['m-1', 'm-2', 'm-4', 'm-8'], // autocomplete 提示
			],

			// 會回傳多個 style items 的動態 shortcut
			[
				/^size-(\d+)$/,
				m => ({ width: `${m[1]}px`, height: `${m[1]}px` }),
				['size-16', 'size-24', 'size-32'],
			],
		],
	},
})
