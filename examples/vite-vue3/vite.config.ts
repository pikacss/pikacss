import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import Vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		PikaCSS({
			tsCodegen: './src/pika.gen.ts',
			cssCodegen: './src/pika.gen.css',
			scan: {
				include: ['src/**/*.{vue,ts,tsx,js,jsx}'],
				exclude: ['node_modules', 'dist'],
			},
		}),
		Vue(),
	],
})
