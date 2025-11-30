import { defineConfig } from '@farmfe/core'
import PikaCSS from '@pikacss/unplugin-pikacss/farm'

export default defineConfig({
	plugins: [
		'@farmfe/plugin-react',
		PikaCSS({
			tsCodegen: './src/pika.gen.ts',
			devCss: './src/pika.dev.css',
		}),
	],
	compilation: {
		input: {
			index: './index.html',
		},
		output: {
			path: 'dist',
		},
	},
	server: {
		port: 3000,
	},
})
