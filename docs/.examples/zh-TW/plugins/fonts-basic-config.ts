// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { fonts } from '@pikacss/plugin-fonts'

export default defineEngineConfig({
	plugins: [fonts()],
	fonts: {
		fonts: {
			sans: 'Roboto:400,500,700',
			mono: ['IBM Plex Mono:400,500', 'ui-monospace'],
		},
	},
})