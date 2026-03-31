import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		projects: ['packages/*/vitest.config.ts', 'docs/vitest.config.ts'],
		coverage: {
			exclude: [
				'**/*.config.*',
				'**/*.gen.*',
				'**/docs/**',
				'**/scripts/**',
				'**/dist/**',
				'**/coverage/**',
				'**/src/**/generated-*.ts',
				'**/src/csstype.ts',
				'**/*.bench.*',
			],
		},
	},
})
