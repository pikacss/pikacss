import { describe, expect, it } from 'vitest'
import { parseJs, parseJsExpression } from './parse'

describe('parseJs', () => {
	it('parses angle-bracket casts in ts (no jsx plugin)', () => {
		expect(() => parseJs('const a = <string>value', 'ts'))
			.not.toThrow()
	})

	it('parses JSX in tsx and jsx dialects', () => {
		expect(() => parseJs('const a = <div className={pika({ color: \'red\' })} />', 'tsx'))
			.not.toThrow()
		expect(() => parseJs('const a = <div className={pika({ color: \'red\' })} />', 'jsx'))
			.not.toThrow()
	})

	it('rejects angle-bracket casts in tsx (jsx wins)', () => {
		expect(() => parseJs('const a = <string>value', 'tsx'))
			.toThrow()
	})

	it('parses modern syntax: decorators, import attributes, using declarations', () => {
		expect(() => parseJs('@sealed class A {}', 'ts'))
			.not.toThrow()
		expect(() => parseJs('import data from "./x.json" with { type: "json" }', 'ts'))
			.not.toThrow()
		expect(() => parseJs('async function f() { await using res = open() }', 'ts'))
			.not.toThrow()
	})

	it('parses both module and script sources (unambiguous)', () => {
		expect(() => parseJs('import { a } from "b"; export const c = 1', 'js'))
			.not.toThrow()
		expect(() => parseJs('with (obj) { a = 1 }', 'js'))
			.not.toThrow()
	})

	it('throws a SyntaxError with loc on invalid syntax', () => {
		try {
			parseJs('const a = {', 'js')
			expect.unreachable()
		}
		catch (error: any) {
			expect(error.loc)
				.toMatchObject({ line: 1 })
		}
	})

	it('applies offsets so node positions are absolute', () => {
		const ast = parseJs('const a = 1', 'js', { startIndex: 100, startLine: 5, startColumn: 2 })
		const statement = ast.program.body[0]!
		expect(statement.start)
			.toBe(100)
		expect(statement.loc!.start.line)
			.toBe(5)
		expect(statement.loc!.start.column)
			.toBe(2)
	})
})

describe('parseJsExpression', () => {
	it('parses a bare expression', () => {
		const node = parseJsExpression('pika({ color: "red" })', 'js')
		expect(node.type)
			.toBe('CallExpression')
	})

	it('applies offsets to expression positions', () => {
		const node = parseJsExpression('pika()', 'js', { startIndex: 42 })
		expect(node.start)
			.toBe(42)
		expect(node.end)
			.toBe(48)
	})
})
