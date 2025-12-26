import pikacss from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'
import { groupIconVitePlugin as vitepressGroupIcon } from 'vitepress-plugin-group-icons'
import llms from 'vitepress-plugin-llms'

export default defineConfig({
	plugins: [
		pikacss({
			fnName: '_pika',
			config: '.vitepress/pika.config.ts',
			tsCodegen: '.vitepress/pika.gen.ts',
			cssCodegen: '.vitepress/pika.gen.css',
		}),
		vitepressGroupIcon(),
		llms(),
	],
})
