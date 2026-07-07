import pikacss from '@pikacss/unplugin-pikacss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { vfsPlugin } from './plugins/vite-plugin-vfs'

// https://vite.dev/config/
export default defineConfig({
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
})
