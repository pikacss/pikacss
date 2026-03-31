import { defineEngineConfig } from '@pikacss/core'

export const selectorsConfig = defineEngineConfig({
	selectors: {
		selectors: [
			['@dark', 'html.dark $'],
			['@light', 'html:not(.dark) $'],
			['@sm', '@media (min-width: 640px)'],
			['@md', '@media (min-width: 768px)'],
			['@lg', '@media (min-width: 1024px)'],
		],
	},
})
