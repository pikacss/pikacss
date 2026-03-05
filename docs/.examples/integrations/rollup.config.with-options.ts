// rollup.config.ts
import PikaCSS from '@pikacss/unplugin-pikacss/rollup'

export default {
	plugins: [
		PikaCSS({
			// Customize file scanning patterns
			scan: {
				include: ['src/**/*.{ts,tsx}'],
				exclude: ['node_modules/**', 'dist/**'],
			},

			// The function name used in source code (default: 'pika')
			fnName: 'pika',

			// Output format: 'string' | 'array' (default: 'string')
			transformedFormat: 'string',

			// Automatically create config file if not found (default: true)
			autoCreateConfig: true,

			// TypeScript codegen file (default: true → 'pika.gen.ts')
			tsCodegen: true,

			// CSS codegen file (default: true → 'pika.gen.css')
			cssCodegen: true,
		}),
	],
}
