// pika.config.ts
import { icons } from '@pikacss/plugin-icons'
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	plugins: [icons()],
	icons: {
		// Icon scale factor (default: 1)
		scale: 1.2,
		// Rendering mode: 'auto' | 'mask' | 'bg' (default: 'auto')
		mode: 'mask',
		// Shortcut prefix (default: 'i-')
		prefix: 'i-',
		// Resolve local Iconify JSON packages from the workspace root
		cwd: process.cwd(),
		// Auto-install icon packages on demand
		autoInstall: true,
		// Extra CSS properties applied to every icon
		extraProperties: {
			'display': 'inline-block',
			'vertical-align': 'middle',
		},
		// CSS unit for width/height (e.g., 'em', 'rem')
		unit: 'em',
		// CDN fallback for unresolved collections (optional)
		// cdn: 'https://cdn.example.com/icons/{collection}.json',
	},
})
