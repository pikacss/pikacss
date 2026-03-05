import PikaCSS from '@pikacss/unplugin-pikacss/vite'

// These are the default plugin options.
// You do NOT need to specify any of these unless you want to override them.
PikaCSS({
	// Automatically creates a pika.config.js file if none is found.
	autoCreateConfig: true,

	// The function name used in source code to define styles.
	fnName: 'pika',

	// Format of transformed output: 'string' | 'array'
	transformedFormat: 'string',

	// TypeScript codegen file (provides autocomplete support).
	// true = 'pika.gen.ts', false = disabled, or a custom path string.
	tsCodegen: true, // generates 'pika.gen.ts'

	// CSS codegen file (contains the compiled atomic CSS).
	// true = 'pika.gen.css', or a custom path string.
	cssCodegen: true, // generates 'pika.gen.css'

	// File scanning patterns.
	scan: {
		include: ['**/*.{js,ts,jsx,tsx,vue}'],
		exclude: ['node_modules/**', 'dist/**'],
	},
})
