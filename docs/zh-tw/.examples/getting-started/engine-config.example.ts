import { defineConfig } from '@pikacss/unplugin-pikacss'

export default defineConfig({
	fnName: 'pika',
	cssModule: 'pika.css',
	transformedFormat: 'string',
	engine: {
		layers: {
			components: 5,
		},
		selectors: {
			definitions: [
				{ name: '@dark', value: 'html.dark $' },
			],
		},
	},
})
