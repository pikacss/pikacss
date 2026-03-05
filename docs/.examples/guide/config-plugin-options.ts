// vite.config.ts
import pikacss from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		pikacss({
			// File scanning patterns
			scan: {
				include: ['src/**/*.{ts,tsx,vue}'],
				exclude: ['node_modules/**', 'dist/**'],
			},

			// Engine config or path to config file
			config: './pika.config.ts',

			// Auto-create config file if missing
			autoCreateConfig: true,

			// Name of the pika function in source code
			fnName: 'pika',

			// Output format: 'string' | 'array'
			transformedFormat: 'string',

			// TypeScript codegen file (true = 'pika.gen.ts')
			tsCodegen: true,

			// CSS codegen file (true = 'pika.gen.css')
			cssCodegen: true,
		}),
	],
})
