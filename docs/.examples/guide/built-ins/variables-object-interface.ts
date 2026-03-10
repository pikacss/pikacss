interface VariableObject {
	value?: string | number | null
	autocomplete?: {
		asValueOf?: string | string[] | '*' | '-'
		asProperty?: boolean
	}
	pruneUnused?: boolean
}

const valueOnlyToken: VariableObject = {
	value: 'red',
	autocomplete: {
		asValueOf: ['color', 'background-color'],
		asProperty: false,
	},
}

const externalToken: VariableObject = {
	value: null,
	autocomplete: {
		asValueOf: '-',
		asProperty: false,
	},
}