import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	cssImports: [
		'@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap");',
		'@import url("https://cdn.example.com/theme.css");',
	],

	preflights: [
		':root { font-family: "Inter", system-ui, sans-serif; }',
	],
})
