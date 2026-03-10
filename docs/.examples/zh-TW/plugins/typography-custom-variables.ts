// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
	plugins: [typography()],
	typography: {
		variables: {
			'--pk-prose-color-body': '#374151',
			'--pk-prose-color-headings': '#111827',
			'--pk-prose-color-links': '#2563eb',
			'--pk-prose-color-code': '#111827',
			'--pk-prose-color-pre-code': '#e5e7eb',
			'--pk-prose-color-pre-bg': '#1f2937',
		},
	},
})
