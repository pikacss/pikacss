import { defineEngineConfig } from '@pikacss/core'

export default defineEngineConfig({
	variables: {
		variables: {
			// Built-in semantic families 會把 autocomplete 限制在對應的 CSS properties。
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

			// 明確指定的 autocomplete targets 仍然會和 semanticType 展開結果做 union。
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