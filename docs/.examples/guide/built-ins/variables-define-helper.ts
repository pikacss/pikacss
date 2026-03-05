import { defineEngineConfig, defineVariables } from '@pikacss/core'

// defineVariables() is a type-safe identity helper for variable definitions.
// Useful when extracting variables into a separate file for reuse.
const themeVars = defineVariables({
	'--color-primary': '#0ea5e9',
	'--color-bg': '#ffffff',
	'--color-text': '#1e293b',
	'[data-theme="dark"]': {
		'--color-bg': '#0f172a',
		'--color-text': '#e2e8f0',
	},
})

export default defineEngineConfig({
	variables: {
		variables: themeVars,
	},
})
