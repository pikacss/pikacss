import deviltea from '@deviltea/eslint-config'

export default await deviltea({
	stylistic: {
		overrides: {
			'style/no-mixed-spaces-and-tabs': 'warn',
		},
	},
	ignores: ['llm-docs/**', 'docs/**/*.md', '.github/skills/**/*.md'],
})
