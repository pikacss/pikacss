/**
 * Options for configuring which function name the ESLint rules match against.
 * @internal
 *
 * @remarks
 * By default the rules detect `pika` and its derived variants. Pass a custom
 * `fnName` to match a renamed import or wrapper function instead.
 *
 * @example
 * ```ts
 * const opts: FnNameOptions = { fnName: 'css' }
 * ```
 */
export interface FnNameOptions {
	/**
	 * Base PikaCSS function name the ESLint rules should detect.
	 *
	 * @default `'pika'`
	 */
	fnName?: string
}

/**
 * Builds the set of callee name patterns derived from a base function name.
 * @internal
 *
 * @param fnName - Base function name to derive patterns from.
 * @returns An object containing the base name, preview name, and `Set`s of normal, preview, and combined callee strings.
 *
 * @remarks
 * For a base name `pika`, the derived normal names are `pika`, `pika.str`,
 * and `pika.arr`. Preview variants use the `p` suffix (`pikap`, `pikap.str`,
 * `pikap.arr`). `allNames` is the union of both sets.
 *
 * @example
 * ```ts
 * const patterns = buildFnNamePatterns('pika')
 * patterns.allNames.has('pika.str') // true
 * ```
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
 * Extracts the full callee name from a call-expression AST node.
 * @internal
 *
 * @param node - EST call-expression node with a `callee` property.
 * @param node.type - The ESTree node type.
 * @param node.callee - The callee subtree to inspect.
 * @returns The dot-joined callee string (e.g. `'pika.str'`), or `null` if the callee shape is unsupported.
 *
 * @remarks
 * Handles plain identifiers (`pika`), non-computed member expressions
 * (`pika.str`), computed literal keys (`pika['str']`), and static
 * template-literal keys (`` pika[`str`] ``). Returns `null` for anything
 * more complex.
 *
 * @example
 * ```ts
 * // Given an AST node for `pika.str('...')`
 * getCalleeName(node) // 'pika.str'
 * ```
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
