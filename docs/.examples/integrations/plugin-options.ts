import type { PluginOptions } from '@pikacss/unplugin-pikacss'

// All options are optional — sensible defaults are provided
const options: PluginOptions = {
	// File patterns to scan for pika() calls
	scan: {
		include: ['**/*.{js,ts,jsx,tsx,vue}'], // default
		exclude: ['node_modules/**', 'dist/**'], // default
	},

	// Engine config: inline object or path to config file
	config: './pika.config.ts',

	// Auto-create a config file if none exists
	autoCreateConfig: true, // default

	// The function name to detect in source code
	fnName: 'pika', // default

	// Output format of generated class names
	// - 'string': "a b c"
	// - 'array':  ['a', 'b', 'c']
	transformedFormat: 'string', // default

	// TypeScript codegen file for autocomplete support
	// - true:   generates 'pika.gen.ts'
	// - string: custom file path
	// - false:  disable
	tsCodegen: true, // default → 'pika.gen.ts'

	// CSS codegen file containing all atomic styles
	// - true:   generates 'pika.gen.css'
	// - string: custom file path
	cssCodegen: true, // default → 'pika.gen.css'
}
