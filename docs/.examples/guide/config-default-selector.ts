import { defineEngineConfig } from '@pikacss/core'

// Default: use CSS class selector
export const classSelector = defineEngineConfig({
	defaultSelector: '.%', // <div class="pk-a pk-b pk-c">
})

// Use attribute selector instead
export const attrSelector = defineEngineConfig({
	defaultSelector: '[data-pika~="%"]', // <div data-pika="pk-a pk-b pk-c">
})
