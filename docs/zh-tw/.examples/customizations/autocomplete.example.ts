import { defineEngineConfig } from '@pikacss/core'

export const autocompleteConfig = defineEngineConfig({
	autocomplete: {
		cssProperties: {
			display: ['flex', 'grid', 'block', 'inline-block', 'none'],
		},
	},
})
