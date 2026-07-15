import type { Rule, Scope } from 'eslint'
import { buildFnNamePatterns, getCalleeName, getCalleeRootName } from '../utils/fn-names'

// Global constant identifiers the compiler evaluates statically (only when they
// are NOT shadowed by a local binding). Mirrors GLOBAL_CONSTANTS in
// `@pikacss/integration`'s compiler evaluator.
const GLOBAL_CONSTANTS = new Set(['undefined', 'NaN', 'Infinity'])
// Operators the compiler's static evaluator understands. Kept in sync with
// `evaluateBinary`/`evaluateUnary`/`evaluateLogical` in the integration package.
const STATIC_BINARY_OPERATORS = new Set(['+', '-', '*', '/', '===', '!=='])
const STATIC_UNARY_OPERATORS = new Set(['-', '+', '!', 'void'])
const STATIC_LOGICAL_OPERATORS = new Set(['&&', '||', '??'])

/**
 * Whether `name` resolves to a binding declared in the given scope chain
 * (import, variable, parameter, function/class declaration).
 */
function isDeclaredInScope(name: string, scope: Scope.Scope | null | undefined): boolean {
	for (let s = scope; s != null; s = s.upper) {
		if (s.variables.some(variable => variable.name === name))
			return true
	}
	return false
}

/**
 * Check whether a node belongs to the static subset the rule accepts.
 *
 * Aligned with the compiler's build-time evaluator (`evaluateStatic` in
 * `@pikacss/integration`): literals, recursively-static objects/arrays,
 * template literals whose expressions are all static, the compiler's unary /
 * binary / logical / conditional operators, and the unshadowed global
 * constants `undefined`/`NaN`/`Infinity`. Anything the compiler cannot
 * evaluate (identifiers, member/call expressions, unsupported operators) is
 * rejected so the rule never flags code the compiler would accept and never
 * accepts code the compiler would reject.
 */
function isStaticNode(node: any, scope: Scope.Scope | null | undefined): boolean {
	if (node == null)
		return false
	switch (node.type) {
		case 'Literal':
			return true

		case 'Identifier':
			// undefined / NaN / Infinity are static only when not shadowed.
			return GLOBAL_CONSTANTS.has(node.name) && !isDeclaredInScope(node.name, scope)

		case 'TemplateLiteral':
			// Static when every interpolated expression is itself static.
			return node.expressions.every((expr: any) => isStaticNode(expr, scope))

		case 'UnaryExpression':
			return STATIC_UNARY_OPERATORS.has(node.operator)
				&& isStaticNode(node.argument, scope)

		case 'BinaryExpression':
			return STATIC_BINARY_OPERATORS.has(node.operator)
				&& isStaticNode(node.left, scope)
				&& isStaticNode(node.right, scope)

		case 'LogicalExpression':
			return STATIC_LOGICAL_OPERATORS.has(node.operator)
				&& isStaticNode(node.left, scope)
				&& isStaticNode(node.right, scope)

		case 'ConditionalExpression':
			return isStaticNode(node.test, scope)
				&& isStaticNode(node.consequent, scope)
				&& isStaticNode(node.alternate, scope)

		case 'ArrayExpression':
			return node.elements.every((el: any) => {
				if (el === null)
					return true // sparse arrays: [,]
				if (el.type === 'SpreadElement')
					return isStaticNode(el.argument, scope)
				return isStaticNode(el, scope)
			})

		case 'ObjectExpression':
			return node.properties.every((prop: any) => {
				if (prop.type === 'SpreadElement') {
					// Spread is only allowed if the argument is itself a static object
					return isStaticNode(prop.argument, scope)
				}
				// Computed property keys must also be static
				if (prop.computed && !isStaticNode(prop.key, scope))
					return false
				// Non-computed keys are always static (Identifier or Literal)
				return isStaticNode(prop.value, scope)
			})

		default:
			return false
	}
}

/**
 * Get a human-readable description of why a node is not static.
 */
function getDynamicReason(node: any): string {
	switch (node.type) {
		case 'Identifier':
			return `Variable reference '${node.name}' is not statically analyzable`
		case 'CallExpression':
			return 'Function calls are not statically analyzable'
		case 'TemplateLiteral':
			return 'Template literals with expressions are not statically analyzable'
		case 'ConditionalExpression':
			return 'Conditional expressions are not statically analyzable'
		case 'BinaryExpression':
		case 'LogicalExpression':
			return `'${node.operator}' expressions are not statically analyzable`
		case 'MemberExpression':
			return 'Member expressions are not statically analyzable'
		case 'TaggedTemplateExpression':
			return 'Tagged template expressions are not statically analyzable'
		case 'NewExpression':
			return 'New expressions are not statically analyzable'
		case 'AwaitExpression':
			return 'Await expressions are not statically analyzable'
		case 'YieldExpression':
			return 'Yield expressions are not statically analyzable'
		case 'AssignmentExpression':
			return 'Assignment expressions are not statically analyzable'
		case 'SequenceExpression':
			return 'Sequence expressions are not statically analyzable'
		default:
			return 'This expression is not statically analyzable'
	}
}

function reportDynamicNode(
	context: Rule.RuleContext,
	node: any,
	messageId: 'noDynamicArg' | 'noDynamicProperty' | 'noDynamicSpread' | 'noDynamicComputedKey',
	fnName: string,
	reason?: string,
) {
	context.report({
		node,
		messageId,
		data: reason == null ? { fnName } : { fnName, reason },
	})
}

/**
 * ESLint rule that disallows dynamic arguments in PikaCSS function calls.
 *
 * Every argument passed to the configured PikaCSS callee (and its `.str`,
 * `.arr`, and preview variants) must fall within the same static subset the
 * build-time compiler can evaluate: literals, recursively-static objects and
 * arrays, template literals whose expressions are static, the compiler's
 * unary/binary/logical/conditional operators, and the unshadowed global
 * constants `undefined`/`NaN`/`Infinity`. The rule stays aligned with the
 * compiler so it never flags a call the transform would accept.
 *
 * Calls whose callee root is a local binding (import, variable, parameter,
 * function/class) are skipped — they are the user's own function, not a macro,
 * matching the transformer's scope-based shadowing.
 *
 * Reports four distinct message IDs depending on violation location:
 * `noDynamicArg`, `noDynamicProperty`, `noDynamicSpread`, and
 * `noDynamicComputedKey`.
 *
 * When `vue-eslint-parser` is active, the rule also inspects `<template>`
 * call expressions via `defineTemplateBodyVisitor`.
 *
 * @internal
 */
const rule: Rule.RuleModule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow dynamic arguments in PikaCSS calls when enforcing the predictable static subset recommended for build-time transforms.',
			url: 'https://github.com/pikacss/pikacss/blob/main/packages/eslint-config/docs/rules/no-dynamic-args.md',
		},
		messages: {
			noDynamicArg: 'PikaCSS static-subset violation: {{ reason }}. All arguments to {{ fnName }}() must stay within the predictable literal subset enforced by this rule.',
			noDynamicProperty: 'PikaCSS static-subset violation: {{ reason }}. All property values in {{ fnName }}() arguments must stay within the predictable literal subset enforced by this rule.',
			noDynamicSpread: 'PikaCSS static-subset violation: Spread of dynamic value is not allowed in {{ fnName }}() arguments. Only spread of static object literals is permitted.',
			noDynamicComputedKey: 'PikaCSS static-subset violation: Computed property key {{ reason }}. Only static computed keys are allowed in {{ fnName }}() arguments.',
		},
		schema: [
			{
				type: 'object',
				properties: {
					fnName: {
						type: 'string',
						description: 'The base function name to detect. Defaults to \'pika\'. Dot access and static bracket-access variants are derived automatically.',
					},
				},
				additionalProperties: false,
			},
		],
		defaultOptions: [{ fnName: 'pika' }],
	},
	create(context) {
		const options = context.options[0] as { fnName?: string } | undefined
		const { allNames } = buildFnNamePatterns(options?.fnName)

		function validateObjectExpression(argNode: any, fnName: string, scope: Scope.Scope | null | undefined): void {
			for (const prop of argNode.properties) {
				if (prop.type === 'SpreadElement') {
					if (!isStaticNode(prop.argument, scope))
						reportDynamicNode(context, prop, 'noDynamicSpread', fnName)
					continue
				}

				if (prop.computed && !isStaticNode(prop.key, scope)) {
					reportDynamicNode(context, prop.key, 'noDynamicComputedKey', fnName, getDynamicReason(prop.key))
				}

				if (!isStaticNode(prop.value, scope)) {
					if (prop.value.type === 'ObjectExpression' || prop.value.type === 'ArrayExpression') {
						validateArg(prop.value, fnName, scope)
					}
					else {
						reportDynamicNode(context, prop.value, 'noDynamicProperty', fnName, getDynamicReason(prop.value))
					}
				}
			}
		}

		function validateArrayExpression(argNode: any, fnName: string, scope: Scope.Scope | null | undefined): void {
			for (const el of argNode.elements) {
				if (el === null)
					continue
				if (el.type === 'SpreadElement') {
					if (!isStaticNode(el.argument, scope))
						reportDynamicNode(context, el, 'noDynamicSpread', fnName)
					continue
				}
				if (!isStaticNode(el, scope))
					validateArg(el, fnName, scope)
			}
		}

		/**
		 * Report non-static nodes within a pika() argument, with specific
		 * messages depending on the position (top-level arg, property value,
		 * spread, computed key).
		 */
		function validateArg(argNode: any, fnName: string, scope: Scope.Scope | null | undefined): void {
			if (isStaticNode(argNode, scope))
				return

			if (argNode.type === 'ObjectExpression') {
				validateObjectExpression(argNode, fnName, scope)
				return
			}

			if (argNode.type === 'ArrayExpression') {
				validateArrayExpression(argNode, fnName, scope)
				return
			}

			reportDynamicNode(context, argNode, 'noDynamicArg', fnName, getDynamicReason(argNode))
		}

		function checkCallExpression(node: any): void {
			const calleeName = getCalleeName(node)
			if (calleeName === null || !allNames.has(calleeName))
				return

			// Skip when the callee root is a local binding (import, variable,
			// parameter, function/class): it is the user's own function, not a
			// PikaCSS macro. Mirrors the transformer's Babel-scope shadowing so the
			// rule never flags calls the compiler would leave untouched.
			const scope = context.sourceCode.getScope?.(node)
			const rootName = getCalleeRootName(node)
			if (rootName != null && isDeclaredInScope(rootName, scope))
				return

			// Derive the displayed function name (just the base, e.g. 'pika' or 'pika.str')
			const displayFnName = calleeName

			for (const arg of node.arguments) {
				if (arg.type === 'SpreadElement') {
					if (!isStaticNode(arg.argument, scope)) {
						reportDynamicNode(context, arg, 'noDynamicSpread', displayFnName)
					}
					continue
				}
				validateArg(arg, displayFnName, scope)
			}
		}

		// If vue-eslint-parser is active, also register the visitor for <template>
		const parserServices = context.sourceCode.parserServices as any
		if (parserServices?.defineTemplateBodyVisitor) {
			return parserServices.defineTemplateBodyVisitor(
				{ CallExpression: checkCallExpression },
				{ CallExpression: checkCallExpression },
			)
		}

		return { CallExpression: checkCallExpression }
	},
}

export default rule
