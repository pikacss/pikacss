import { defineEngineConfig } from '@pikacss/core'

export const autocompleteConfig = defineEngineConfig({
	autocomplete: {
		properties: {
			display: ['flex', 'grid', 'block', 'inline-block', 'none'],
		},
	},
})
