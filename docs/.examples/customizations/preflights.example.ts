import { defineEngineConfig } from '@pikacss/core'

export const preflightConfig = defineEngineConfig({
	preflights: [
		'*, *::before, *::after { box-sizing: border-box; }',
	],
})
