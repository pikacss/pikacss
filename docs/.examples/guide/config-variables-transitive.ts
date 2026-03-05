import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	variables: {
		variables: {
			// Base token — not referenced directly in any atomic style
			'--spacing-base': '4px',
			// Derived token — references --spacing-base in its value
			'--spacing-lg': 'calc(var(--spacing-base) * 4)',
		},
		pruneUnused: true,
		// --spacing-base is not in safeList and is never used in pika() calls directly.
		// But because --spacing-lg (which IS used) references it via var(),
		// the BFS expansion ensures --spacing-base is also kept in the CSS output.
	},
})
