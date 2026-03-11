// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { fonts } from '@pikacss/plugin-fonts'

export default defineEngineConfig({
	plugins: [fonts()],
	fonts: {
		faces: [{
			fontFamily: 'Satoshi',
			src: 'url("/fonts/satoshi.woff2") format("woff2")',
			fontWeight: 500,
			fontStyle: 'normal',
			fontDisplay: 'swap',
		}],
		families: {
			display: ['Satoshi', 'sans-serif'],
		},
	},
})