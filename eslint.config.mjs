import deviltea from '@deviltea/eslint-config'

export default await deviltea({
	stylistic: {
		overrides: {
			'style/no-mixed-spaces-and-tabs': 'warn',
		},
	},
	ignores: [
		'**/README.md',
		'docs/**/*.md',
		'.github/skills/**/*.md',
		'agent_todos/**/*.md',
		'playground/public/coi-serviceworker.js',
	],
})
