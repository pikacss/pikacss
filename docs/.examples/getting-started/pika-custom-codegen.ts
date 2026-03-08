// vite.config.ts
import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		PikaCSS({
			tsCodegen: 'src/generated/pika.gen.ts',
			cssCodegen: 'src/generated/pika.gen.css',
		}),
	],
})