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
			'./docs/.examples/**/*',
		],
	},
	pikacss(),
)
