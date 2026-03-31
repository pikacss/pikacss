import type { ViteUserConfigExport } from 'vitest/config'

export function createPackageVitestConfig(): ViteUserConfigExport {
	return {
		test: {
			coverage: {
				enabled: true,
				provider: 'v8',
				thresholds: {
					branches: 95,
				},
				include: [
					'src/**/*.{ts,tsx}',
				],
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
				reportsDirectory: './coverage',
			},
		},
	}
}
