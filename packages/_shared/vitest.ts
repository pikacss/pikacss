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
					'**/src/generated/*.ts',
					'**/*.bench.*',
				],
				reportsDirectory: './coverage',
			},
		},
	}
}

export function createDeferred<T = void>() {
	let resolve!: (value: T | PromiseLike<T>) => void
	const promise = new Promise<T>((_resolve) => {
		resolve = _resolve
	})
	return { promise, resolve }
}
