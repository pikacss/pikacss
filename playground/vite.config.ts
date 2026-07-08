import pikacss from '@pikacss/unplugin-pikacss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { vfsPlugin } from './plugins/vite-plugin-vfs'

/**
 * Resolves the latest published version of a package from the npm registry.
 * Returns null on any failure so callers can fall back to the versions
 * pinned in the template package.json files.
 */
async function fetchLatestVersion(packageName: string): Promise<string | null> {
	try {
		const response = await fetch(
			`https://registry.npmjs.org/${packageName}/latest`,
			{ signal: AbortSignal.timeout(10_000) },
		)
		if (!response.ok)
			return null
		const data = await response.json() as { version?: unknown }
		return typeof data.version === 'string' ? data.version : null
	}
	catch {
		return null
	}
}

// https://vite.dev/config/
export default defineConfig(async () => {
	// Templates run inside the WebContainer against the npm registry, so
	// their PikaCSS dependency is rewritten to the latest published release
	// at build time (falling back to the pinned version when offline).
	const latestPikaVersion = await fetchLatestVersion('@pikacss/unplugin-pikacss')
	if (latestPikaVersion == null)
		console.warn('[playground] Could not resolve the latest @pikacss/unplugin-pikacss version; templates keep their pinned versions.')

	return {
		// Deployed under https://pikacss.github.io/playground/ next to the docs.
		base: '/playground/',
		plugins: [
			pikacss({
				tsCodegen: './src/pika.gen.ts',
				cssCodegen: './src/pika.gen.css',
				scan: {
					// Template files are data served into the WebContainer, not part
					// of the playground app itself.
					exclude: ['node_modules/**', 'dist/**', 'src/templates/**'],
				},
			}),
			vue(),
			vfsPlugin({
				dir: './src/templates',
				dependencyVersions: latestPikaVersion == null
					? undefined
					: { '@pikacss/unplugin-pikacss': `^${latestPikaVersion}` },
			}),
		],
		resolve: {
			dedupe: ['vue'],
		},
		server: {
			headers: {
				'Cross-Origin-Embedder-Policy': 'require-corp',
				'Cross-Origin-Opener-Policy': 'same-origin',
			},
		},
	}
})
