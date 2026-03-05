import { defineEngineConfig, definePreflight } from '@pikacss/core'

// definePreflight() is a type-safe identity helper for preflight definitions.
// Useful when building preflights as separate variables or extracting them
// into shared modules.
const resetPreflight = definePreflight('*, *::before, *::after { box-sizing: border-box; }')

const rootPreflight = definePreflight({
	':root': {
		fontSize: '16px',
		lineHeight: '1.5',
	},
})

const dynamicPreflight = definePreflight((engine) => {
	const isDark = engine.config.variables?.variables
	return isDark ? ':root { color-scheme: dark; }' : ''
})

export default defineEngineConfig({
	preflights: [resetPreflight, rootPreflight, dynamicPreflight],
})
