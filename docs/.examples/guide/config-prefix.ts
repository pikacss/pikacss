import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	// Explicitly disable the default prefix: generated IDs are "a", "b", "c", ...
	prefix: '',
})

export const withPrefix = defineEngineConfig({
	// Override the default prefix: generated IDs are "pika-a", "pika-b", "pika-c", ...
	prefix: 'pika-',
})
