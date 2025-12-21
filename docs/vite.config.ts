import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'
import { groupIconVitePlugin as VitepressGroupIcon } from 'vitepress-plugin-group-icons'

export default defineConfig({
	plugins: [
		PikaCSS({
			fnName: '_pika',
			config: '.vitepress/pika.config.ts',
			tsCodegen: '.vitepress/pika.gen.ts',
			cssCodegen: '.vitepress/pika.gen.css',
		}),
		VitepressGroupIcon(),
	],
})
