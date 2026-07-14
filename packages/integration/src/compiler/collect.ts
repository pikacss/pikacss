import type { NodePath } from '@babel/traverse'
import type * as t from '@babel/types'
import type { FnConfig, FnVariant } from '../fnConfig'
import _traverse from '@babel/traverse'

// @babel/traverse v7 ships CJS with a default export; under ESM interop the
// callable may sit on `.default` depending on the loader.
const traverse = ((_traverse as any).default ?? _traverse) as typeof _traverse

/**
 * A macro call site found by the collector, before argument evaluation.
 */
export interface CollectedCall {
	/** The matched call variant. */
	variant: FnVariant
	/** The `CallExpression` node of the call site. */
	node: t.CallExpression
	/** The traverse path of the call site, used for scope lookups during evaluation. */
	path: NodePath<t.CallExpression>
}

function unwrapExpression(node: t.Node): t.Node {
	let current = node
	while (
		current.type === 'TSNonNullExpression'
		|| current.type === 'TSAsExpression'
		|| current.type === 'TSSatisfiesExpression'
		|| current.type === 'TSTypeAssertion'
		|| current.type === 'TSInstantiationExpression'
		|| current.type === 'ParenthesizedExpression'
	) {
		current = current.expression
	}
	return current
}

function resolveMemberProperty(node: t.MemberExpression): string | null {
	if (node.computed === false) {
		return node.property.type === 'Identifier' ? node.property.name : null
	}
	const property = unwrapExpression(node.property)
	if (property.type === 'StringLiteral') {
		return property.value
	}
	if (property.type === 'TemplateLiteral' && property.expressions.length === 0 && property.quasis.length === 1) {
		return property.quasis[0]!.value.cooked ?? null
	}
	return null
}

/**
 * Resolves a callee expression to its canonical dot-form variant name.
 *
 * @param callee - The callee node of a `CallExpression`.
 * @param fnConfig - The variant config derived from the base function name.
 * @returns The root identifier and dot-form name, or `null` when the callee is not a candidate.
 *
 * @remarks
 * TS wrapper expressions (`pika!`, `pika as X`, parentheses) are unwrapped.
 * Computed member access with a static string key (`pika['str']`,
 * `` pika[`str`] ``) is normalized to the dot form. Optional calls
 * (`pika?.()`, `pika?.str()`) are distinct node types (`OptionalCallExpression`)
 * and never reach this resolver — calls through optional chains are not macros.
 */
export function resolveCalleeName(callee: t.Node, fnConfig: FnConfig): { root: string, name: string } | null {
	const node = unwrapExpression(callee)

	if (node.type === 'Identifier') {
		return fnConfig.roots.has(node.name) ? { root: node.name, name: node.name } : null
	}

	if (node.type === 'MemberExpression') {
		const object = unwrapExpression(node.object)
		if (object.type !== 'Identifier' || !fnConfig.roots.has(object.name)) {
			return null
		}
		const property = resolveMemberProperty(node)
		if (property == null) {
			return null
		}
		return { root: object.name, name: `${object.name}.${property}` }
	}

	return null
}

/**
 * Collects all PikaCSS macro call sites in a parsed module.
 *
 * @param ast - The parsed Babel `File` node.
 * @param fnConfig - The variant config derived from the base function name.
 * @param excludedRoots - Root identifiers shadowed by the surrounding non-JS
 * context (e.g. Vue `v-for` aliases or slot props); their calls are not macros.
 * @returns Collected call sites in traversal order (callers sort by offset).
 *
 * @remarks
 * A call site is a macro only when its root identifier does NOT resolve to a
 * local binding (variable, parameter, function declaration, import, catch
 * param, ...): the configured function is a global intrinsic, so any local
 * binding shadows it. `path.scope.getBinding` handles hoisting and
 * destructuring, so `pika()` before a same-scope `function pika() {}` is
 * correctly rejected.
 */
export function collectMacroCalls(ast: t.File, fnConfig: FnConfig, excludedRoots?: ReadonlySet<string>): CollectedCall[] {
	const found: CollectedCall[] = []

	traverse(ast, {
		CallExpression(path) {
			const resolved = resolveCalleeName(path.node.callee, fnConfig)
			if (resolved == null) {
				return
			}
			const variant = fnConfig.variants.get(resolved.name)
			if (variant == null) {
				return
			}
			if (excludedRoots?.has(resolved.root)) {
				return
			}
			if (path.scope.getBinding(resolved.root) != null) {
				return
			}
			found.push({ variant, node: path.node, path })
		},
	})

	return found
}
