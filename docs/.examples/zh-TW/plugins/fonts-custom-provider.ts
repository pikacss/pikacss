// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { defineFontsProvider, fonts } from '@pikacss/plugin-fonts'

export default defineEngineConfig({
	plugins: [fonts()],
	fonts: {
		provider: 'acme',
		providerOptions: {
			acme: {
				text: 'PikaCSS',
			},
		},
		providers: {
			acme: defineFontsProvider({
				buildImportUrls(fonts, context) {
					return `https://cdn.example.com/fonts.css?family=${fonts.map(font => font.name).join(',')}&display=${context.display}&text=${context.options.text}&subset=${fonts[0]?.options?.subset}`
				},
			}),
		},
		fonts: {
			brand: {
				name: 'Acme Sans',
				providerOptions: {
					subset: 'latin',
				},
			},
		},
	},
})