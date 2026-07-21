import process from 'node:process'
import { loadNodeIcon } from '@iconify/utils/lib/loader/node-loader'
import { createIconsPlugin } from './index'

export * from './index'

/**
 * Creates the Node.js icons plugin with locally installed Iconify collection loading.
 *
 * @returns An icons plugin configured with the Iconify Node.js loader.
 */
export function icons() {
	return createIconsPlugin({
		loadLocalIcon: (collection, name, options) => loadNodeIcon(collection, name, options),
		shouldLoadLocalIcon: () => !process.env.ESLINT,
	})
}
