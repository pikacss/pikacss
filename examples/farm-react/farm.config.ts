import { defineConfig } from '@farmfe/core'
import PikaCSS from '@pikacss/unplugin-pikacss/farm'

export default defineConfig({
	plugins: [
		PikaCSS({
			tsCodegen: './src/pika.gen.ts',
			cssCodegen: './src/pika.gen.css',
			scan: {
				include: ['src/**/*.{ts,tsx,js,jsx,html}'],
				exclude: ['node_modules', 'dist'],
			},
		}),
		'@farmfe/plugin-react',
	],
	compilation: {
		input: {
			index: './index.html',
		},
		output: {
			path: 'dist',
		},
		// FIXME: Currently persistent cache causes issues with unplugin-pikacss
		persistentCache: false,
	},
	server: {
		port: 3000,
	},
})
