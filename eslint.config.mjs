import deviltea from '@deviltea/eslint-config'
import pikacss from '@pikacss/eslint-config'

export default await deviltea(
	{
		markdown: {
			overrides: {
				'style/indent': ['error', 2],
			},
		},
		ignores: [
			'./.github/**/*',
			'./.agents/**/*',
			'.planning/**/*',
			'./docs/.examples/**/*',
			'./docs/**/*.md',
			'./skills/**/*.md',
			// Ignore the generated files
			'packages/core/src/csstype.ts',
		],
	},
	pikacss(),
)
