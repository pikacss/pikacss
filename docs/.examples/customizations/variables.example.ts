import { defineEngineConfig, defineVariables } from '@pikacss/core'

export const variablesConfig = defineEngineConfig({
	variables: {
		definitions: defineVariables({
			'--color-primary': '#3b82f6',
			'--color-secondary': '#64748b',
			'--spacing-md': '1rem',
		}),
	},
})
