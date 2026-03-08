interface VariableObject {
	value?: string | number | null
	autocomplete?: {
		asValueOf?: string | string[] | '*' | '-'
		asProperty?: boolean
	}
	pruneUnused?: boolean
}