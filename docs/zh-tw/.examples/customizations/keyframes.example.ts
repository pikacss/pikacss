import { defineEngineConfig } from '@pikacss/core'

export const keyframesConfig = defineEngineConfig({
	keyframes: {
		definitions: [
			['fade-in', { from: { opacity: '0' }, to: { opacity: '1' } }],
		],
	},
})
