/// <reference path="./pika.gen.ts" />
import { icons } from '@pikacss/plugin-icons'
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	plugins: [
		icons(),
	],
	shortcuts: {
		definitions: [
			// Static shortcut
			['flex-center', {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}],
			// Dynamic shortcut
			[/^m-(\d+)$/, m => ({ margin: `${m[1]}px` }), ['m-4', 'm-8']], // Autocomplete suggestions
		],
	},
	icons: {
		autoInstall: true,
	},
})
