/// <reference path="./pika.gen.ts" />
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	// 替所有產生的 class names 加上 prefix
	prefix: 'pk-',

	// 給 responsive design 使用的自訂 selectors
	selectors: {
		selectors: [
			['hover', '$:hover'],
			[/^screen-(\d+)$/, m => `@media (min-width: ${m[1]}px)`, ['screen-768', 'screen-1024']],
		],
	},

	// 可重用的 style shortcuts
	shortcuts: {
		shortcuts: [
			['flex-center', {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}],
		],
	},

	// CSS custom properties
	variables: {
		variables: {
			'--color-primary': '#3b82f6',
			'--color-bg': '#ffffff',
		},
	},
})
