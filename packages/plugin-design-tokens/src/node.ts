import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { designTokens as createDesignTokens } from './index'

export * from './index'

/**
 * Creates the Node.js design-tokens plugin with filesystem-backed source loading.
 *
 * @returns A design-tokens plugin configured with `node:fs` and `process.cwd()` capabilities.
 */
export function designTokens() {
	return createDesignTokens({
		readFile: filepath => readFile(filepath, 'utf-8'),
		cwd: () => process.cwd(),
	})
}
