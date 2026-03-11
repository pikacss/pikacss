// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	autocomplete: {
		styleItemStrings: ['btn-primary', 'btn-secondary'],
		extraProperties: ['variant'],
		properties: {
			variant: ['"solid"', '"ghost"'],
		},
		patterns: {
			selectors: ['screen-${number}'],
			styleItemStrings: ['icon-${string}'],
		},
	},
})