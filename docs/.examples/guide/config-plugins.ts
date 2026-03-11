import { defineEngineConfig } from '@pikacss/core'
import { fonts } from '@pikacss/plugin-fonts'
import { icons } from '@pikacss/plugin-icons'
import { reset } from '@pikacss/plugin-reset'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
	plugins: [
		reset(),
		fonts(),
		icons(),
		typography(),
	],
	fonts: {
		fonts: {
			sans: 'Roboto:400,700',
		},
	},
})
