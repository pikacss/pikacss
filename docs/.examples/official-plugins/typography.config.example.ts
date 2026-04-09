import { defineEngineConfig } from '@pikacss/core'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
	typography: {
		variables: {
			'--pk-prose-color-links': '#2563eb',
		},
	},
	plugins: [typography()],
})