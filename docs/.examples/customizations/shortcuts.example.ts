import { defineEngineConfig } from '@pikacss/core'

export const shortcutsConfig = defineEngineConfig({
	shortcuts: {
		shortcuts: [
			['flex-center', {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}],
		],
	},
})
