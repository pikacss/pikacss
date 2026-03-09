import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

// These are the default values used by the engine when no config is provided.
// You do NOT need to specify any of these unless you want to override them.
export default defineEngineConfig({
	// Prefix prepended to all generated atomic class names.
	// Default: 'pk-' generates class names like 'pk-a', 'pk-b', ...
	prefix: 'pk-',

	// The CSS selector template for each atomic style.
	// '%' is replaced with the generated atomic style ID.
	defaultSelector: '.%',

	// Additional engine plugins (beyond built-in ones).
	plugins: [],

	// CSS preflights (global base styles injected before atomic styles).
	preflights: [],

	// Built-in plugin: controls whether all styles are !important by default.
	important: {
		default: false,
	},

	// Built-in plugin: CSS custom properties (variables) configuration.
	variables: {
		pruneUnused: true,
	},

	// Built-in plugin: @keyframes animation configuration.
	keyframes: {
		pruneUnused: true,
	},
})
