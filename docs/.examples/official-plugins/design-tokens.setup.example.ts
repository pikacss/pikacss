import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens/node'

export default defineEngineConfig({
	plugins: [designTokens()],
	designTokens: {
		sources: ['./design.md'],
	},
})
