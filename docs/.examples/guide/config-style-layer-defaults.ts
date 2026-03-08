import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	layers: {
		components: 0,
		utilities: 10,
	},
	defaultUtilitiesLayer: 'components',
})