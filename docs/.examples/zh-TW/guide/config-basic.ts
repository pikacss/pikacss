// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	prefix: 'pika-',
	defaultSelector: '.%',
	preflights: [
		':root { --app-radius: 12px; }',
	],
	plugins: [],
})
