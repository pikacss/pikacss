import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		projects: ['packages/*'],
		coverage: {
			enabled: true,
			exclude: [
				'**/*.config.*',
				'**/index.*',
				'**/docs/**',
				'**/scripts/**',
				'**/dist/**',
				'**/coverage/**',
				'**/*.bench.*',
			],
		},
		typecheck: {
			enabled: true,
		},
		benchmark: {
			include: ['**/*.bench.ts'],
			exclude: ['**/node_modules/**', '**/dist/**'],
		},
	},
})
