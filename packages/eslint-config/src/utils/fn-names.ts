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
 * - Force string sub: .str or ['str']
 * - Force array sub: .arr or ['arr']
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
 * - Computed member expression with static string: pika['str'](...)  → 'pika.str'
 */
export function getCalleeName(node: {
	type: string
	callee: any
}): string | null {
	const { callee } = node
	if (callee.type === 'Identifier') {
		return callee.name
	}
	if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier')
		return null
	if (
		!callee.computed
		&& callee.property.type === 'Identifier'
	) {
		return `${callee.object.name}.${callee.property.name}`
	}
	if (callee.computed) {
		if (callee.property.type === 'Literal' && typeof callee.property.value === 'string')
			return `${callee.object.name}.${callee.property.value}`
		if (
			callee.property.type === 'TemplateLiteral'
			&& callee.property.expressions.length === 0
			&& callee.property.quasis.length === 1
		) {
			return `${callee.object.name}.${callee.property.quasis[0]!.value.cooked ?? ''}`
		}
	}
	return null
}
