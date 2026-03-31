/* eslint-disable no-template-curly-in-string */
import { log } from '@pikacss/core'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { createFnUtils, findFunctionCalls, findTemplateExpressionEnd } from './ctx.transform-utils'

afterEach(() => {
	vi.restoreAllMocks()
	log.setWarnFn(console.warn.bind(console))
	log.setErrorFn(console.error.bind(console))
})

describe('createFnUtils', () => {
	it('classifies normal, forced, and preview call variants', () => {
		const fnUtils = createFnUtils('pika')

		expect(fnUtils.isNormal('pika'))
			.toBe(true)
		expect(fnUtils.isNormal('pikap'))
			.toBe(true)
		expect(fnUtils.isForceString('pika.str'))
			.toBe(true)
		expect(fnUtils.isForceString('pikap["str"]'))
			.toBe(true)
		expect(fnUtils.isForceArray('pika[`arr`]'))
			.toBe(true)
		expect(fnUtils.isForceArray('pikap.arr'))
			.toBe(true)
		expect(fnUtils.isPreview('pikap'))
			.toBe(true)
		expect(fnUtils.isPreview('pika'))
			.toBe(false)
		expect(fnUtils.RE.exec('const value = pika({ color: "red" })')?.[1])
			.toBe('pika')
	})
})

describe('findTemplateExpressionEnd', () => {
	it('resolves nested template expressions, comments, and escaped characters', () => {
		const code = '`${`nested ${1}` /* comment */ + "value"}`'
		const start = code.indexOf('{')

		expect(findTemplateExpressionEnd(code, start))
			.toBe(code.lastIndexOf('}'))
	})

	it('returns -1 for unterminated nested expressions, comments, or line comments at EOF', () => {
		expect(findTemplateExpressionEnd('`${foo', 2))
			.toBe(-1)
		expect(findTemplateExpressionEnd('`${foo /*', 2))
			.toBe(-1)
		expect(findTemplateExpressionEnd('`${foo //', 2))
			.toBe(-1)
		expect(findTemplateExpressionEnd('`${`broken ${`}`', 2))
			.toBe(-1)
	})

	it('tracks escaped characters, nested object braces, and closed block comments inside template expressions', () => {
		const code = '`${({ note: "a\\b" /* block */ }).note}`'
		const start = code.indexOf('{')

		expect(findTemplateExpressionEnd(code, start))
			.toBe(code.lastIndexOf('}'))
	})

	it('advances over successful nested template expressions and closed block comments', () => {
		const nestedTemplate = '`${`inner ${1}`}`'
		const commentedExpression = '`${1 /* kept */ + 2}`'
		const lineCommentExpression = '`${1 // kept\n + 2}`'

		expect(findTemplateExpressionEnd(nestedTemplate, nestedTemplate.indexOf('{')))
			.toBe(nestedTemplate.lastIndexOf('}'))
		expect(findTemplateExpressionEnd(commentedExpression, commentedExpression.indexOf('{')))
			.toBe(commentedExpression.lastIndexOf('}'))
		expect(findTemplateExpressionEnd(lineCommentExpression, lineCommentExpression.indexOf('{')))
			.toBe(lineCommentExpression.lastIndexOf('}'))
	})
})

describe('findFunctionCalls', () => {
	it('finds calls across bracket syntax, comments, nested templates, and nested parentheses', () => {
		const fnUtils = createFnUtils('pika')
		const code = [
			'const a = pika[\'str\']({ color: \'red\' /* inline */ })',
			'const b = pika[`arr`]({ content: `calc(${`1`})` })',
			'const c = pikap((() => ({ color: \'blue\' }))())',
		].join('\n')
		const result = findFunctionCalls(code, fnUtils)

		expect(result.map(match => ({ fnName: match.fnName, snippet: match.snippet })))
			.toEqual([
				{
					fnName: 'pika[\'str\']',
					snippet: 'pika[\'str\']({ color: \'red\' /* inline */ })',
				},
				{
					fnName: 'pika[`arr`]',
					snippet: 'pika[`arr`]({ content: `calc(${`1`})` })',
				},
				{
					fnName: 'pikap',
					snippet: 'pikap((() => ({ color: \'blue\' }))())',
				},
			])
		expect(result.every(match => match.end > match.start))
			.toBe(true)
	})

	it('warns and skips malformed template, unclosed comments, and unterminated calls', () => {
		const fnUtils = createFnUtils('pika')
		const warn = vi.fn()
		log.setWarnFn(warn)

		expect(findFunctionCalls('const a = pika({ color: `red ${`', fnUtils))
			.toEqual([])
		expect(findFunctionCalls('const b = pika({ color: \'red\' /*', fnUtils))
			.toEqual([])
		expect(findFunctionCalls('const c = pika({ color: \'red\' //', fnUtils))
			.toEqual([])

		expect(warn.mock.calls.some(call => call.join(' ')
			.includes('Malformed template literal expression in function call')))
			.toBe(true)
		expect(warn.mock.calls.some(call => call.join(' ')
			.includes('Unclosed comment in function call')))
			.toBe(true)
		expect(warn.mock.calls.some(call => call.join(' ')
			.includes('Unclosed function call')))
			.toBe(true)
		expect(warn.mock.calls.some(call => call.join(' ')
			.includes('Malformed function call')))
			.toBe(true)
	})

	it('keeps scanning through escaped quotes, closed block comments, and trailing line comments', () => {
		const fnUtils = createFnUtils('pika')
		const code = [
			String.raw`const a = pika({ content: "quote \" ) still inside" /* closed */ })`,
			'const b = pika({ color: \'blue\' }) // trailing comment',
			'const c = pika({ content: "next" })',
		].join('\n')

		const result = findFunctionCalls(code, fnUtils)

		expect(result.map(match => match.snippet))
			.toEqual([
				String.raw`pika({ content: "quote \" ) still inside" /* closed */ })`,
				'pika({ color: \'blue\' })',
				'pika({ content: "next" })',
			])
	})
})
