import type { Rule } from 'eslint'
import { buildFnNamePatterns, getCalleeName } from '../utils/fn-names'

/**
 * Check if a node is a statically analyzable expression.
 * PikaCSS requires all arguments to pika() to be evaluatable at build time
 * via `new Function('return ...')`. This means only literals, object/array
 * literals with static values, and specific patterns are allowed.
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
			if (node.expressions.length > 0) {
				return 'Template literals with expressions are not statically analyzable'
			}
			return 'Unknown dynamic value'
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

const rule: Rule.RuleModule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow dynamic (non-static) arguments in PikaCSS function calls. PikaCSS evaluates arguments at build time, so all values must be statically analyzable.',
			url: 'https://github.com/pikacss/pikacss/blob/main/packages/eslint-plugin/docs/rules/no-dynamic-args.md',
		},
		messages: {
			noDynamicArg: 'PikaCSS build-time violation: {{ reason }}. All arguments to {{ fnName }}() must be static literals (strings, numbers, objects with literal values) that can be evaluated at build time.',
			noDynamicProperty: 'PikaCSS build-time violation: {{ reason }}. All property values in {{ fnName }}() arguments must be static literals.',
			noDynamicSpread: 'PikaCSS build-time violation: Spread of dynamic value is not allowed in {{ fnName }}() arguments. Only spread of static object literals is permitted.',
			noDynamicComputedKey: 'PikaCSS build-time violation: Computed property key {{ reason }}. Only static computed keys are allowed in {{ fnName }}() arguments.',
		},
		schema: [
			{
				type: 'object',
				properties: {
					fnName: {
						type: 'string',
						description: 'The base function name to detect. Defaults to \'pika\'. All variants (pika, pika.str, pika.arr, pikap, pikap.str, pikap.arr, etc.) are automatically derived.',
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

		/**
		 * Report non-static nodes within a pika() argument, with specific
		 * messages depending on the position (top-level arg, property value,
		 * spread, computed key).
		 */
		function validateArg(argNode: any, fnName: string): void {
			if (isStaticNode(argNode))
				return

			// For object expressions, drill into properties to give specific reports
			if (argNode.type === 'ObjectExpression') {
				for (const prop of argNode.properties) {
					if (prop.type === 'SpreadElement') {
						if (!isStaticNode(prop.argument)) {
							context.report({
								node: prop,
								messageId: 'noDynamicSpread',
								data: { fnName },
							})
						}
						continue
					}
					// Check computed key
					if (prop.computed && !isStaticNode(prop.key)) {
						context.report({
							node: prop.key,
							messageId: 'noDynamicComputedKey',
							data: {
								reason: getDynamicReason(prop.key),
								fnName,
							},
						})
					}
					// Check property value
					if (!isStaticNode(prop.value)) {
						if (prop.value.type === 'ObjectExpression' || prop.value.type === 'ArrayExpression') {
							// Recurse into nested objects/arrays
							validateArg(prop.value, fnName)
						}
						else {
							context.report({
								node: prop.value,
								messageId: 'noDynamicProperty',
								data: {
									reason: getDynamicReason(prop.value),
									fnName,
								},
							})
						}
					}
				}
				return
			}

			// For array expressions, check each element
			if (argNode.type === 'ArrayExpression') {
				for (const el of argNode.elements) {
					if (el === null)
						continue
					if (el.type === 'SpreadElement') {
						if (!isStaticNode(el.argument)) {
							context.report({
								node: el,
								messageId: 'noDynamicSpread',
								data: { fnName },
							})
						}
						continue
					}
					if (!isStaticNode(el)) {
						validateArg(el, fnName)
					}
				}
				return
			}

			// Top-level non-static argument
			context.report({
				node: argNode,
				messageId: 'noDynamicArg',
				data: {
					reason: getDynamicReason(argNode),
					fnName,
				},
			})
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
						context.report({
							node: arg,
							messageId: 'noDynamicSpread',
							data: { fnName: displayFnName },
						})
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
