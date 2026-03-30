import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		include: ['.examples/**/*.example.test.ts', 'zh-TW/.examples/**/*.example.test.ts'],
		coverage: {
			enabled: false,
		},
	},
	resolve: {
		alias: {
			'@pikacss/core': new URL('../packages/core/src/index.ts', import.meta.url).pathname,
		},
	},
})
