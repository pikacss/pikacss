/* eslint-disable no-template-curly-in-string */
import type { EvaluateContext } from './evaluate'
import * as t from '@babel/types'
import { describe, expect, it } from 'vitest'
import { PikaTransformError } from './errors'
import { evaluateStatic } from './evaluate'
import { parseJsExpression } from './parse'

const ctx: EvaluateContext = {
	id: '/repo/src/mod.ts',
	hasLocalBinding: () => false,
}

function evaluate(source: string, overrides?: Partial<EvaluateContext>) {
	return evaluateStatic(parseJsExpression(source, 'ts'), { ...ctx, ...overrides })
}

describe('evaluateStatic', () => {
	it('evaluates primitive literals', () => {
		expect(evaluate('"red"'))
			.toBe('red')
		expect(evaluate('42'))
			.toBe(42)
		expect(evaluate('true'))
			.toBe(true)
		expect(evaluate('null'))
			.toBe(null)
	})

	it('evaluates global constants only when unshadowed', () => {
		expect(evaluate('undefined'))
			.toBe(undefined)
		expect(evaluate('NaN'))
			.toBeNaN()
		expect(evaluate('Infinity'))
			.toBe(Number.POSITIVE_INFINITY)
		expect(() => evaluate('undefined', { hasLocalBinding: name => name === 'undefined' }))
			.toThrow(PikaTransformError)
	})

	it('rejects unknown identifiers with position info', () => {
		try {
			evaluate('theme')
			expect.unreachable()
		}
		catch (error: any) {
			expect(error)
				.toBeInstanceOf(PikaTransformError)
			expect(error.stage)
				.toBe('evaluate')
			expect(error.loc)
				.toEqual({ line: 1, column: 0 })
			expect(error.message)
				.toContain('identifier "theme" is not statically known')
			expect(error.message)
				.toContain('/repo/src/mod.ts')
		}
	})

	it('evaluates unary operators', () => {
		expect(evaluate('-1'))
			.toBe(-1)
		expect(evaluate('+"2"'))
			.toBe(2)
		expect(evaluate('!false'))
			.toBe(true)
		expect(evaluate('void 0'))
			.toBe(undefined)
		expect(() => evaluate('typeof 1'))
			.toThrow('unsupported unary operator "typeof"')
		expect(() => evaluate('typeof x'))
			.toThrow(PikaTransformError)
	})

	it('evaluates static template literals', () => {
		expect(evaluate('`a ${1} ${"b"} ${true}`'))
			.toBe('a 1 b true')
		expect(evaluate('`plain`'))
			.toBe('plain')
		expect(() => evaluate('`x ${theme}`'))
			.toThrow(PikaTransformError)
		expect(() => evaluate('`x ${{}}`'))
			.toThrow('template expression does not evaluate to a primitive')
	})

	it('evaluates object expressions with all key forms', () => {
		expect(evaluate('{ color: "red", "font-size": "1rem", 12: "x", ["computed" + "Key"]: 1 }'))
			.toEqual({ 'color': 'red', 'font-size': '1rem', '12': 'x', 'computedKey': 1 })
	})

	it('evaluates object spread of static objects', () => {
		expect(evaluate('{ a: 1, ...{ b: 2 }, c: 3 }'))
			.toEqual({ a: 1, b: 2, c: 3 })
		expect(() => evaluate('{ ...[1] }'))
			.toThrow('object spread of a non-object value')
		expect(() => evaluate('{ ...null }'))
			.toThrow('object spread of a non-object value')
	})

	it('rejects object methods and dynamic computed keys', () => {
		expect(() => evaluate('{ m() {} }'))
			.toThrow('object methods are not supported')
		expect(() => evaluate('{ [Symbol.iterator]: 1 }'))
			.toThrow(PikaTransformError)
		expect(() => evaluate('{ [{}]: 1 }'))
			.toThrow('computed object key does not evaluate to a string or number')
	})

	it('evaluates array expressions with spread and holes', () => {
		expect(evaluate('[1, "a", ...[2, 3], , 4]'))
			.toEqual([1, 'a', 2, 3, undefined, 4])
		expect(() => evaluate('[...{}]'))
			.toThrow('array spread of a non-array value')
	})

	it('evaluates conditional expressions on static tests', () => {
		expect(evaluate('true ? "a" : "b"'))
			.toBe('a')
		expect(evaluate('0 ? "a" : "b"'))
			.toBe('b')
		expect(() => evaluate('cond ? "a" : "b"'))
			.toThrow(PikaTransformError)
	})

	it('evaluates logical operators with short-circuiting', () => {
		expect(evaluate('"a" && "b"'))
			.toBe('b')
		expect(evaluate('false && theme'))
			.toBe(false)
		expect(evaluate('"" || "fallback"'))
			.toBe('fallback')
		expect(evaluate('"kept" || theme'))
			.toBe('kept')
		expect(evaluate('null ?? "default"'))
			.toBe('default')
		expect(evaluate('0 ?? theme'))
			.toBe(0)
	})

	it('evaluates supported binary operators', () => {
		expect(evaluate('"a" + "-b"'))
			.toBe('a-b')
		expect(evaluate('"x" + 1'))
			.toBe('x1')
		expect(evaluate('3 + 4'))
			.toBe(7)
		expect(evaluate('10 - 4'))
			.toBe(6)
		expect(evaluate('6 * 7'))
			.toBe(42)
		expect(evaluate('10 / 4'))
			.toBe(2.5)
		expect(evaluate('1 === 1'))
			.toBe(true)
		expect(evaluate('1 !== 1'))
			.toBe(false)
		expect(() => evaluate('true + 1'))
			.toThrow('"+" on non-string/non-number operands')
		expect(() => evaluate('1 % 2'))
			.toThrow('unsupported binary operator')
	})

	it('unwraps TS wrapper expressions', () => {
		expect(evaluate('"red" as const'))
			.toBe('red')
		expect(evaluate('("red")!'))
			.toBe('red')
		expect(evaluate('("red" satisfies string)'))
			.toBe('red')
	})

	it('rejects calls, member access, and other dynamic expressions', () => {
		expect(() => evaluate('getColor()'))
			.toThrow('unsupported expression of type CallExpression')
		expect(() => evaluate('theme.color'))
			.toThrow('unsupported expression of type MemberExpression')
		expect(() => evaluate('() => 1'))
			.toThrow(PikaTransformError)
	})

	// The parser cannot produce these shapes (they are parse errors or gated
	// behind unused plugins), but the evaluator must still reject them cleanly
	// when handed such nodes (e.g. by a future processor).
	describe('constructed AST nodes', () => {
		it('rejects a template quasi without a cooked value', () => {
			const node = t.templateLiteral(
				[t.templateElement({ raw: '\\unicode' }, true)],
				[],
			)
			expect(() => evaluateStatic(node, ctx))
				.toThrow('template literal contains an invalid escape sequence')
		})

		it('rejects a binary expression with a PrivateName operand', () => {
			const node = t.binaryExpression('in', t.privateName(t.identifier('p')), t.objectExpression([]))
			expect(() => evaluateStatic(node, ctx))
				.toThrow('private names are not supported')
		})

		it('rejects an unknown logical operator', () => {
			const node = t.logicalExpression('&&', t.booleanLiteral(true), t.booleanLiteral(true))
			;(node as any).operator = '__unknown__'
			expect(() => evaluateStatic(node, ctx))
				.toThrow('unsupported logical operator')
		})

		it('reports without a position when the node has no loc', () => {
			try {
				evaluateStatic(t.identifier('theme'), ctx)
				expect.unreachable()
			}
			catch (error: any) {
				expect(error)
					.toBeInstanceOf(PikaTransformError)
				expect(error.loc)
					.toBeNull()
				expect(error.message)
					.toContain('(/repo/src/mod.ts)')
			}
		})
	})
})
