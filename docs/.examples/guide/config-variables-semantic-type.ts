import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	variables: {
		variables: {
			// Built-in semantic families scope autocomplete to matching CSS properties.
			'--color-primary': {
				value: '#3b82f6',
				semanticType: 'color',
			},
			'--space-md': {
				value: '16px',
				semanticType: 'length',
			},
			'--motion-fast': {
				value: '120ms',
				semanticType: 'time',
			},
			'--layer-popover': {
				value: '20',
				semanticType: 'number',
			},
			'--ease-standard': {
				value: 'ease-in-out',
				semanticType: 'easing',
			},
			'--font-ui': {
				value: 'Inter, sans-serif',
				semanticType: 'font-family',
			},

			// Explicit autocomplete targets still union with semanticType expansion.
			'--brand-accent': {
				value: '#0ea5e9',
				semanticType: 'color',
				autocomplete: {
					asValueOf: 'scrollbar-color',
				},
			},
		},
		pruneUnused: false,
	},
})