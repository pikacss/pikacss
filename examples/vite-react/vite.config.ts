import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import React from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
		React(),
	],
})
