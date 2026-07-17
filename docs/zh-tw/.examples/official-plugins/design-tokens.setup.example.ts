import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens'

export default defineEngineConfig({
	plugins: [designTokens()],
	designTokens: {
		sources: ['./design.md'],
	},
})
