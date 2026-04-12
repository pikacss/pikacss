import { defineEngineConfig } from '@pikacss/core'

export const variablesConfig = defineEngineConfig({
	variables: {
		colors: {
			'--color-primary': '#3b82f6',
			'--color-secondary': '#64748b',
		},
		lengths: {
			'--spacing-md': '1rem',
		},
	},
})
