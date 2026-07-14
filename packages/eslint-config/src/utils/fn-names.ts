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
 * Keep variant derivation in sync with `createFnConfig` in
 * `@pikacss/integration` (`packages/integration/src/fnConfig.ts`).
 * This copy exists so the ESLint config stays runtime-dependency-free; bracket
 * forms are normalized to these dot forms by `getCalleeName`. The consistency
 * test in `fn-names.test.ts` guards the agreement.
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

const wrapperNodeTypes = new Set([
	'TSNonNullExpression',
	'TSAsExpression',
	'TSSatisfiesExpression',
	'TSTypeAssertion',
	'ParenthesizedExpression',
])

/**
 * Unwraps TypeScript assertion wrappers and parenthesized expressions.
 * @internal
 *
 * @param node - Expression node possibly wrapped in `!`, `as`, `satisfies`, `<T>`, or parentheses.
 * @returns The innermost unwrapped expression node.
 *
 * @remarks
 * Handles `TSNonNullExpression` (`pika!`), `TSAsExpression` (`pika as X`),
 * `TSSatisfiesExpression`, `TSTypeAssertion` (`<X>pika`), and
 * `ParenthesizedExpression` — recursively, so nested wrappers are peeled off.
 *
 * @example
 * ```ts
 * // Given an AST node for `(pika as X)!`
 * unwrapExpression(node) // Identifier node for `pika`
 * ```
 */
function unwrapExpression(node: any): any {
	let current = node
	while (current != null && wrapperNodeTypes.has(current.type))
		current = current.expression
	return current
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
 * template-literal keys (`` pika[`str`] ``). TypeScript assertion wrappers
 * (`pika!`, `pika as X`, `pika satisfies X`, `<X>pika`) and parentheses are
 * unwrapped before extraction. Returns `null` for anything more complex.
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
	const callee = unwrapExpression(node.callee)
	if (callee.type === 'Identifier') {
		return callee.name
	}
	if (callee.type !== 'MemberExpression')
		return null
	const calleeObject = unwrapExpression(callee.object)
	if (calleeObject.type !== 'Identifier')
		return null
	if (
		!callee.computed
		&& callee.property.type === 'Identifier'
	) {
		return `${calleeObject.name}.${callee.property.name}`
	}
	if (callee.computed) {
		if (callee.property.type === 'Literal' && typeof callee.property.value === 'string')
			return `${calleeObject.name}.${callee.property.value}`
		if (
			callee.property.type === 'TemplateLiteral'
			&& callee.property.expressions.length === 0
			&& callee.property.quasis.length === 1
		) {
			return `${calleeObject.name}.${callee.property.quasis[0]!.value.cooked ?? ''}`
		}
	}
	return null
}
