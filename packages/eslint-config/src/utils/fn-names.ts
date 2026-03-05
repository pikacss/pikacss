/**
 * Options for configuring which function names should be detected by the ESLint rule.
 */
export interface FnNameOptions {
	/**
	 * The base function name to detect.
	 * @default 'pika'
	 */
	fnName?: string
}

/**
 * Given a base function name (e.g. 'pika'), returns an object with sets
 * of all the function name patterns that should be detected.
 *
 * Patterns:
 * - Normal: fnName (e.g. 'pika')
 * - Preview: fnName + 'p' (e.g. 'pikap')
 * - Force string sub: .str
 * - Force array sub: .arr
 */
export function buildFnNamePatterns(fnName: string = 'pika') {
	const previewFnName = `${fnName}p`

	// All base callee names (just the identifier or identifier.property)
	const normalNames = new Set([
		fnName,
		`${fnName}.str`,
		`${fnName}.arr`,
	])

	const previewNames = new Set([
		previewFnName,
		`${previewFnName}.str`,
		`${previewFnName}.arr`,
	])

	const allNames = new Set([...normalNames, ...previewNames])

	return {
		fnName,
		previewFnName,
		normalNames,
		previewNames,
		allNames,
	}
}

/**
 * Extract the callee name string from a CallExpression node.
 * Supports:
 * - Simple identifier: pika(...)  → 'pika'
 * - Member expression: pika.str(...)  → 'pika.str'
 */
export function getCalleeName(node: {
	type: string
	callee: any
}): string | null {
	const { callee } = node
	if (callee.type === 'Identifier') {
		return callee.name
	}
	if (
		callee.type === 'MemberExpression'
		&& !callee.computed
		&& callee.object.type === 'Identifier'
		&& callee.property.type === 'Identifier'
	) {
		return `${callee.object.name}.${callee.property.name}`
	}
	return null
}
