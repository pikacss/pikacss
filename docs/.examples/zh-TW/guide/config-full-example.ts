// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { icons } from '@pikacss/plugin-icons'
import { reset } from '@pikacss/plugin-reset'

export default defineEngineConfig({
	plugins: [
		reset(),
		icons(),
	],

	prefix: 'pk-',
	defaultSelector: '.%',

	preflights: [
		'*, *::before, *::after { box-sizing: border-box; }',
	],

	important: {
		default: false,
	},

	variables: {
		variables: {
			'--color-bg': '#ffffff',
			'--color-text': '#1a1a1a',
			'[data-theme="dark"]': {
				'--color-bg': '#1a1a1a',
				'--color-text': '#ffffff',
			},
		},
		pruneUnused: true,
		safeList: ['--color-bg', '--color-text'],
	},

	keyframes: {
		keyframes: [
			['fade-in', {
				from: { opacity: '0' },
				to: { opacity: '1' },
			}, ['fade-in 0.3s ease']],
		],
		pruneUnused: true,
	},

	selectors: {
		selectors: [
			['hover', '$:hover'],
			['focus', '$:focus'],
			['dark', '[data-theme="dark"] $'],
		],
	},

	shortcuts: {
		shortcuts: [
			['flex-center', {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}],
		],
	},
})
