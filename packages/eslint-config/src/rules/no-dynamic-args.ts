import type { Rule } from 'eslint'
import { buildFnNamePatterns, getCalleeName } from '../utils/fn-names'

/**
 * Check whether a node belongs to the lint-safe subset enforced by this rule.
 *
 * The transformer evaluates matched arguments at build time, but this rule is
 * intentionally stricter: it only allows literals and recursively static
 * object/array structures so builds stay predictable and side-effect free.
 */
function isStaticNode(node: any): boolean {
	switch (node.type) {
		case 'Literal':
			return true

		case 'TemplateLiteral':
			// Only static if there are no expressions
			return node.expressions.length === 0

		case 'UnaryExpression':
			// Allow -1, +2, etc.
			return (node.operator === '-' || node.operator === '+')
				&& isStaticNode(node.argument)

		case 'ArrayExpression':
			return node.elements.every((el: any) => {
				if (el === null)
					return true // sparse arrays: [,]
				if (el.type === 'SpreadElement')
					return isStaticNode(el.argument)
				return isStaticNode(el)
			})

		case 'ObjectExpression':
			return node.properties.every((prop: any) => {
				if (prop.type === 'SpreadElement') {
					// Spread is only allowed if the argument is itself a static object
					return isStaticNode(prop.argument)
				}
				// Computed property keys must also be static
				if (prop.computed && !isStaticNode(prop.key))
					return false
				// Non-computed keys are always static (Identifier or Literal)
				return isStaticNode(prop.value)
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
 * Enforces a strict static-subset constraint: every argument passed to the
 * configured PikaCSS callee (and its `.str`, `.arr`, and preview variants)
 * must be a literal, a recursively static object/array, or a static
 * template literal with no expressions. This ensures build-time transforms
 * can evaluate the call site without runtime information.
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
			url: 'https://github.com/pikacss/pikacss/blob/main/packages/eslint-plugin/docs/rules/no-dynamic-args.md',
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

		function validateObjectExpression(argNode: any, fnName: string): void {
			for (const prop of argNode.properties) {
				if (prop.type === 'SpreadElement') {
					if (!isStaticNode(prop.argument))
						reportDynamicNode(context, prop, 'noDynamicSpread', fnName)
					continue
				}

				if (prop.computed && !isStaticNode(prop.key)) {
					reportDynamicNode(context, prop.key, 'noDynamicComputedKey', fnName, getDynamicReason(prop.key))
				}

				if (!isStaticNode(prop.value)) {
					if (prop.value.type === 'ObjectExpression' || prop.value.type === 'ArrayExpression') {
						validateArg(prop.value, fnName)
					}
					else {
						reportDynamicNode(context, prop.value, 'noDynamicProperty', fnName, getDynamicReason(prop.value))
					}
				}
			}
		}

		function validateArrayExpression(argNode: any, fnName: string): void {
			for (const el of argNode.elements) {
				if (el === null)
					continue
				if (el.type === 'SpreadElement') {
					if (!isStaticNode(el.argument))
						reportDynamicNode(context, el, 'noDynamicSpread', fnName)
					continue
				}
				if (!isStaticNode(el))
					validateArg(el, fnName)
			}
		}

		/**
		 * Report non-static nodes within a pika() argument, with specific
		 * messages depending on the position (top-level arg, property value,
		 * spread, computed key).
		 */
		function validateArg(argNode: any, fnName: string): void {
			if (isStaticNode(argNode))
				return

			if (argNode.type === 'ObjectExpression') {
				validateObjectExpression(argNode, fnName)
				return
			}

			if (argNode.type === 'ArrayExpression') {
				validateArrayExpression(argNode, fnName)
				return
			}

			reportDynamicNode(context, argNode, 'noDynamicArg', fnName, getDynamicReason(argNode))
		}

		function checkCallExpression(node: any): void {
			const calleeName = getCalleeName(node)
			if (calleeName === null || !allNames.has(calleeName))
				return

			// Derive the displayed function name (just the base, e.g. 'pika' or 'pika.str')
			const displayFnName = calleeName

			for (const arg of node.arguments) {
				if (arg.type === 'SpreadElement') {
					if (!isStaticNode(arg.argument)) {
						reportDynamicNode(context, arg, 'noDynamicSpread', displayFnName)
					}
					continue
				}
				validateArg(arg, displayFnName)
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
