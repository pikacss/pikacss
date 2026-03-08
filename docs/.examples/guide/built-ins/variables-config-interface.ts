interface VariablesConfig {
	variables: VariablesDefinition | VariablesDefinition[]
	pruneUnused?: boolean
	safeList?: `--${string}`[]
}