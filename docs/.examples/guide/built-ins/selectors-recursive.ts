import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	selectors: {
		selectors: [
			// Base selector
			['hover', '$:hover'],
			// Alias that resolves to another selector
			['alias-hover', 'hover'],
			// Chained: group-hover resolves through its own rule
			['group-hover', '.group:hover $'],
		],
	},
})
// Using 'alias-hover' in a style definition:
// → resolves 'alias-hover' to 'hover'
// → resolves 'hover' to '$:hover'
// → final output: .pk-a:hover { ... }
