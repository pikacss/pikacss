// nuxt.config.ts
export default defineNuxtConfig({
	modules: ['@pikacss/nuxt-pikacss'],

	pikacss: {
		// Customize file scanning patterns
		scan: {
			include: ['**/*.vue', '**/*.tsx', '**/*.jsx'],
			exclude: ['node_modules/**'],
		},

		// The function name used in source code (default: 'pika')
		fnName: 'pika',

		// Output format: 'string' | 'array' (default: 'string')
		transformedFormat: 'string',

		// TypeScript codegen file (default: true → 'pika.gen.ts')
		tsCodegen: true,

		// CSS codegen file (default: true → 'pika.gen.css')
		cssCodegen: true,
	},
})
