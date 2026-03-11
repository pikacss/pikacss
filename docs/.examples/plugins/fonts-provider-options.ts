// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { fonts } from '@pikacss/plugin-fonts'

export default defineEngineConfig({
	plugins: [fonts()],
	fonts: {
		provider: 'coollabs',
		providerOptions: {
			coollabs: {
				text: 'PikaCSS',
			},
		},
		fonts: {
			brand: 'Roboto:400,700',
		},
	},
})