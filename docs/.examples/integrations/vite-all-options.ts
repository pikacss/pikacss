// vite.config.ts — all available plugin options with their defaults
import PikaCSS from '@pikacss/unplugin-pikacss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		PikaCSS({
			// Automatically creates a pika.config.{js,ts} file if none is found.
			// Set to false to disable auto-creation.
			autoCreateConfig: true, // [!code highlight]

			// The function name used in source code to define styles.
			// PikaCSS scans for calls to this function.
			fnName: 'pika', // [!code highlight]

			// Format of the transformed output:
			//   'string' — returns "pk-a pk-b pk-c" (space-separated string)
			//   'array'  — returns ['pk-a', 'pk-b', 'pk-c']
			transformedFormat: 'string', // [!code highlight]

			// TypeScript codegen file path.
			//   true   — generates 'pika.gen.ts' (default)
			//   false  — disables TS codegen
			//   string — custom file path
			tsCodegen: true, // [!code highlight]

			// CSS codegen file path.
			//   true   — generates 'pika.gen.css' (default)
			//   string — custom file path
			cssCodegen: true, // [!code highlight]

			// File scanning patterns (glob format).
			scan: {
				include: ['**/*.{js,ts,jsx,tsx,vue}'], // [!code highlight]
				exclude: ['node_modules/**', 'dist/**'], // [!code highlight]
			},

			// Engine configuration: inline object or path to config file.
			// config: { /* EngineConfig */ },
			// config: './pika.config.ts',
		}),
	],
})
