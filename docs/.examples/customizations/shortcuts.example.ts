import { defineEngineConfig } from '@pikacss/core'

export const shortcutsConfig = defineEngineConfig({
	shortcuts: {
		definitions: [
			['flex-center', {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}],
		],
	},
})
