import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'
import Solid from 'vite-plugin-solid'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		PikaCSS({
			tsCodegen: './src/pika.gen.ts',
			cssCodegen: './src/pika.gen.css',
			scan: {
				include: ['src/**/*.{ts,tsx,js,jsx}'],
				exclude: ['node_modules', 'dist'],
			},
		}),
		Solid(),
	],
})
