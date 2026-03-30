import { describe, expect, it } from 'vitest'

import rule from './no-dynamic-args'

interface Report {
	messageId: string
	data: Record<string, string>
	node: unknown
}

function createContext(options?: { fnName?: string }) {
	const reports: Report[] = []

	return {
		context: {
			options: options == null ? [] : [options],
			report(report: Report) {
				reports.push(report)
			},
			sourceCode: {
				parserServices: undefined,
			},
		},
		reports,
	}
}

function createCallExpression(callee: any, args: any[]) {
	return {
		type: 'CallExpression',
		callee,
		arguments: args,
	}
}

function runRule(node: any, options?: { fnName?: string }) {
	const { context, reports } = createContext(options)
	const visitor = rule.create(context as any) as { CallExpression: (node: any) => void }

	visitor.CallExpression(node)

	return reports
}

describe('no-dynamic-args rule metadata', () => {
	it('declares messages, schema, and a default fnName option', () => {
		expect(rule.meta)
			.toMatchObject({
				type: 'problem',
				defaultOptions: [{ fnName: 'pika' }],
				messages: {
					noDynamicArg: expect.stringContaining('static-subset violation'),
					noDynamicProperty: expect.stringContaining('static-subset violation'),
					noDynamicSpread: expect.stringContaining('Spread of dynamic value'),
					noDynamicComputedKey: expect.stringContaining('Computed property key'),
				},
			})
		expect(rule.meta?.schema)
			.toHaveLength(1)
	})
})

describe('no-dynamic-args rule visitor creation', () => {
	it('registers the same call-expression visitor for script and template bodies when parser services expose one', () => {
		const defineTemplateBodyVisitor = (templateVisitor: unknown, scriptVisitor: unknown) => ({
			templateVisitor,
			scriptVisitor,
		})
		const context = {
			options: [],
			report() {},
			sourceCode: {
				parserServices: {
					defineTemplateBodyVisitor,
				},
			},
		}

		const visitor = rule.create(context as any) as unknown as Record<string, Record<string, unknown>>

		expect(visitor.templateVisitor)
			.toEqual({ CallExpression: expect.any(Function) })
		expect(visitor.scriptVisitor)
			.toEqual({ CallExpression: expect.any(Function) })
		expect(visitor.templateVisitor)
			.toEqual(visitor.scriptVisitor)
	})
})

describe('no-dynamic-args rule behavior', () => {
	it('ignores calls whose callee name does not match the configured pika patterns', () => {
		expect(runRule(createCallExpression(
			{ type: 'Identifier', name: 'notPika' },
			[{ type: 'Identifier', name: 'value' }],
		)))
			.toEqual([])
	})

	it('accepts static literals, unary expressions, static arrays, and static objects', () => {
		expect(runRule(createCallExpression(
			{ type: 'Identifier', name: 'pika' },
			[
				{ type: 'Literal', value: 'red' },
				{
					type: 'TemplateLiteral',
					expressions: [],
					quasis: [{ value: { cooked: 'solid' } }],
				},
				{
					type: 'UnaryExpression',
					operator: '-',
					argument: { type: 'Literal', value: 1 },
				},
				{
					type: 'UnaryExpression',
					operator: '+',
					argument: { type: 'Literal', value: 2 },
				},
				{
					type: 'ArrayExpression',
					elements: [
						null,
						{ type: 'Literal', value: 'value' },
						{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } },
					],
				},
				{
					type: 'ObjectExpression',
					properties: [
						{
							type: 'Property',
							computed: false,
							key: { type: 'Identifier', name: 'color' },
							value: { type: 'Literal', value: 'red' },
						},
						{
							type: 'Property',
							computed: true,
							key: { type: 'Literal', value: 'margin' },
							value: { type: 'ArrayExpression', elements: [{ type: 'Literal', value: '0' }] },
						},
						{
							type: 'SpreadElement',
							argument: {
								type: 'ObjectExpression',
								properties: [],
							},
						},
					],
				},
			],
		)))
			.toEqual([])
	})

	it('reports dynamic property values, computed keys, nested array items, and dynamic spreads', () => {
		const reports = runRule(createCallExpression(
			{ type: 'Identifier', name: 'pika' },
			[
				{
					type: 'ObjectExpression',
					properties: [
						{
							type: 'Property',
							computed: true,
							key: { type: 'Identifier', name: 'dynamicKey' },
							value: { type: 'Literal', value: 'red' },
						},
						{
							type: 'Property',
							computed: false,
							key: { type: 'Identifier', name: 'nested' },
							value: {
								type: 'ArrayExpression',
								elements: [
									{ type: 'Literal', value: 'ok' },
									{ type: 'CallExpression' },
								],
							},
						},
						{
							type: 'SpreadElement',
							argument: { type: 'Identifier', name: 'spreadValue' },
						},
					],
				},
			],
		))

		expect(reports)
			.toEqual([
				{
					messageId: 'noDynamicComputedKey',
					data: {
						fnName: 'pika',
						reason: 'Variable reference \'dynamicKey\' is not statically analyzable',
					},
					node: { type: 'Identifier', name: 'dynamicKey' },
				},
				{
					messageId: 'noDynamicArg',
					data: {
						fnName: 'pika',
						reason: 'Function calls are not statically analyzable',
					},
					node: { type: 'CallExpression' },
				},
				{
					messageId: 'noDynamicSpread',
					data: {
						fnName: 'pika',
					},
					node: {
						type: 'SpreadElement',
						argument: { type: 'Identifier', name: 'spreadValue' },
					},
				},
			])
	})

	it('reports non-static property values and dynamic array spreads with property-level messages', () => {
		const reports = runRule(createCallExpression(
			{ type: 'Identifier', name: 'pika' },
			[
				{
					type: 'ObjectExpression',
					properties: [
						{
							type: 'Property',
							computed: false,
							key: { type: 'Identifier', name: 'color' },
							value: { type: 'MemberExpression' },
						},
						{
							type: 'Property',
							computed: false,
							key: { type: 'Identifier', name: 'tokens' },
							value: {
								type: 'ArrayExpression',
								elements: [
									{
										type: 'SpreadElement',
										argument: { type: 'Identifier', name: 'dynamicList' },
									},
								],
							},
						},
					],
				},
			],
		))

		expect(reports)
			.toEqual([
				{
					messageId: 'noDynamicProperty',
					data: {
						fnName: 'pika',
						reason: 'Member expressions are not statically analyzable',
					},
					node: { type: 'MemberExpression' },
				},
				{
					messageId: 'noDynamicSpread',
					data: {
						fnName: 'pika',
					},
					node: {
						type: 'SpreadElement',
						argument: { type: 'Identifier', name: 'dynamicList' },
					},
				},
			])
	})

	it('skips sparse entries while still reporting dynamic members inside a non-static array argument', () => {
		const reports = runRule(createCallExpression(
			{ type: 'Identifier', name: 'pika' },
			[
				{
					type: 'ArrayExpression',
					elements: [
						null,
						{ type: 'Identifier', name: 'value' },
					],
				},
			],
		))

		expect(reports)
			.toEqual([
				{
					messageId: 'noDynamicArg',
					data: {
						fnName: 'pika',
						reason: 'Variable reference \'value\' is not statically analyzable',
					},
					node: { type: 'Identifier', name: 'value' },
				},
			])
	})

	it.each([
		['Identifier', { type: 'Identifier', name: 'value' }, 'noDynamicArg', 'Variable reference \'value\' is not statically analyzable'],
		['TemplateLiteral', { type: 'TemplateLiteral', expressions: [{}], quasis: [] }, 'noDynamicArg', 'Template literals with expressions are not statically analyzable'],
		['ConditionalExpression', { type: 'ConditionalExpression' }, 'noDynamicArg', 'Conditional expressions are not statically analyzable'],
		['BinaryExpression', { type: 'BinaryExpression', operator: '+' }, 'noDynamicArg', '\'+\' expressions are not statically analyzable'],
		['LogicalExpression', { type: 'LogicalExpression', operator: '&&' }, 'noDynamicArg', '\'&&\' expressions are not statically analyzable'],
		['MemberExpression', { type: 'MemberExpression' }, 'noDynamicArg', 'Member expressions are not statically analyzable'],
		['TaggedTemplateExpression', { type: 'TaggedTemplateExpression' }, 'noDynamicArg', 'Tagged template expressions are not statically analyzable'],
		['NewExpression', { type: 'NewExpression' }, 'noDynamicArg', 'New expressions are not statically analyzable'],
		['AwaitExpression', { type: 'AwaitExpression' }, 'noDynamicArg', 'Await expressions are not statically analyzable'],
		['YieldExpression', { type: 'YieldExpression' }, 'noDynamicArg', 'Yield expressions are not statically analyzable'],
		['AssignmentExpression', { type: 'AssignmentExpression' }, 'noDynamicArg', 'Assignment expressions are not statically analyzable'],
		['SequenceExpression', { type: 'SequenceExpression' }, 'noDynamicArg', 'Sequence expressions are not statically analyzable'],
		['UnknownExpression', { type: 'UnknownExpression' }, 'noDynamicArg', 'This expression is not statically analyzable'],
	])('reports %s nodes with a specific reason', (_type, argNode, messageId, reason) => {
		const reports = runRule(createCallExpression(
			{ type: 'Identifier', name: 'pika' },
			[argNode],
		))

		expect(reports)
			.toEqual([
				{
					messageId,
					data: {
						fnName: 'pika',
						reason,
					},
					node: argNode,
				},
			])
	})

	it('reports dynamic top-level spread arguments and honors custom function-name patterns', () => {
		expect(runRule(createCallExpression(
			{
				type: 'MemberExpression',
				computed: false,
				object: { type: 'Identifier', name: 'styledp' },
				property: { type: 'Identifier', name: 'arr' },
			},
			[
				{
					type: 'SpreadElement',
					argument: { type: 'Identifier', name: 'tokens' },
				},
			],
		), { fnName: 'styled' }))
			.toEqual([
				{
					messageId: 'noDynamicSpread',
					data: {
						fnName: 'styledp.arr',
					},
					node: {
						type: 'SpreadElement',
						argument: { type: 'Identifier', name: 'tokens' },
					},
				},
			])
	})

	it('skips static spreads inside otherwise non-static objects, arrays, and top-level arguments', () => {
		// static spread in a non-static object: only the dynamic prop is reported
		const objReports = runRule(createCallExpression(
			{ type: 'Identifier', name: 'pika' },
			[{
				type: 'ObjectExpression',
				properties: [
					{ type: 'SpreadElement', argument: { type: 'ObjectExpression', properties: [] } },
					{ type: 'Property', computed: false, key: { type: 'Identifier', name: 'x' }, value: { type: 'Identifier', name: 'dyn' } },
				],
			}],
		))
		expect(objReports)
			.toHaveLength(1)
		expect(objReports[0]!.messageId)
			.toBe('noDynamicProperty')

		// static spread in a non-static array: only the dynamic element is reported
		const arrReports = runRule(createCallExpression(
			{ type: 'Identifier', name: 'pika' },
			[{
				type: 'ArrayExpression',
				elements: [
					{ type: 'SpreadElement', argument: { type: 'ArrayExpression', elements: [] } },
					{ type: 'Identifier', name: 'dyn' },
				],
			}],
		))
		expect(arrReports)
			.toHaveLength(1)
		expect(arrReports[0]!.messageId)
			.toBe('noDynamicArg')

		// static top-level spread alongside a dynamic argument
		const topReports = runRule(createCallExpression(
			{ type: 'Identifier', name: 'pika' },
			[
				{ type: 'SpreadElement', argument: { type: 'ObjectExpression', properties: [] } },
				{ type: 'Identifier', name: 'dyn' },
			],
		))
		expect(topReports)
			.toHaveLength(1)
		expect(topReports[0]!.messageId)
			.toBe('noDynamicArg')
	})
})
