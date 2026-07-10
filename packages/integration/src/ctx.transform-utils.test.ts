/* eslint-disable no-template-curly-in-string */
import { log } from '@pikacss/core'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { createFnUtils, createMarkupIdRE, detectEnclosingAttributeQuote, findFunctionCalls, findTemplateExpressionEnd } from './ctx.transform-utils'

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

describe('createMarkupIdRE', () => {
	it('matches default markup extensions with optional query strings and hashes', () => {
		const re = createMarkupIdRE()!

		expect(re.test('/project/src/App.vue'))
			.toBe(true)
		expect(re.test('/project/src/App.vue?vue&type=template'))
			.toBe(true)
		expect(re.test('/project/src/Page.HTML'))
			.toBe(true)
		expect(re.test('/project/src/main.ts'))
			.toBe(false)
		expect(re.test('/project/src/not-a-vue'))
			.toBe(false)
	})

	it('builds a matcher from custom extensions, normalizing leading dots', () => {
		const re = createMarkupIdRE(['.riot', 'marko'])!

		expect(re.test('/project/src/App.riot'))
			.toBe(true)
		expect(re.test('/project/src/App.marko#section'))
			.toBe(true)
		expect(re.test('/project/src/App.vue'))
			.toBe(false)
	})

	it('returns null when no usable extensions remain', () => {
		expect(createMarkupIdRE([]))
			.toBeNull()
		expect(createMarkupIdRE(['.']))
			.toBeNull()
	})
})

describe('detectEnclosingAttributeQuote', () => {
	it('detects the enclosing attribute quote for markup call sites', () => {
		const doubleQuoted = '<div :class="pika({ color: \'red\' })">'
		expect(detectEnclosingAttributeQuote(doubleQuoted, doubleQuoted.indexOf('pika')))
			.toBe('"')

		const singleQuoted = '<div :class=\'pika({ color: "red" })\'>'
		expect(detectEnclosingAttributeQuote(singleQuoted, singleQuoted.indexOf('pika')))
			.toBe('\'')

		const spaced = '<div :class = "pika({ color: \'red\' })">'
		expect(detectEnclosingAttributeQuote(spaced, spaced.indexOf('pika')))
			.toBe('"')
	})

	it('skips paired quotes inside the enclosing attribute expression', () => {
		const nested = '<div :class=\'cond("x") ? pika({}) : fallback\'>'
		expect(detectEnclosingAttributeQuote(nested, nested.indexOf('pika')))
			.toBe('\'')
	})

	it('returns null when no enclosing attribute quote exists', () => {
		const scriptStatement = '<script>\nconst a = pika({ color: \'red\' })\n</script>'
		expect(detectEnclosingAttributeQuote(scriptStatement, scriptStatement.indexOf('pika')))
			.toBeNull()
		expect(detectEnclosingAttributeQuote('pika({})', 0))
			.toBeNull()
		// A quote at the start of the source has nothing before it.
		expect(detectEnclosingAttributeQuote('"x pika({})', '"x pika({})'.indexOf('pika')))
			.toBeNull()
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

	it('warns and skips unterminated calls (malformed templates, unclosed comments, trailing line comments)', () => {
		const fnUtils = createFnUtils('pika')
		const warn = vi.fn()
		log.setWarnFn(warn)

		expect(findFunctionCalls('const a = pika({ color: `red ${`', fnUtils))
			.toEqual([])
		expect(findFunctionCalls('const b = pika({ color: \'red\' /*', fnUtils))
			.toEqual([])
		expect(findFunctionCalls('const c = pika({ color: \'red\' //', fnUtils))
			.toEqual([])

		expect(warn.mock.calls.filter(call => call.join(' ')
			.includes('Malformed function call')))
			.toHaveLength(3)
	})

	it('ignores calls inside strings and comments, member accesses, and function declarations', () => {
		const fnUtils = createFnUtils('pika')
		const code = [
			'// pika({ color: \'red\' })',
			'/* pika({ color: \'green\' }) */',
			'const s = "call pika(x) here"',
			'const t = `template pika(y)`',
			'api.pika({ color: \'blue\' })',
			'api?.pika({ color: \'cyan\' })',
			'function pika(args) {}',
			'const real = pika({ color: \'gold\' })',
		].join('\n')

		expect(findFunctionCalls(code, fnUtils)
			.map(match => match.snippet))
			.toEqual(['pika({ color: \'gold\' })'])
	})

	it('does not re-match content inside an already matched call', () => {
		const fnUtils = createFnUtils('pika')
		const code = 'const a = pika({ content: \'pika(oops)\' })'

		expect(findFunctionCalls(code, fnUtils)
			.map(match => match.snippet))
			.toEqual(['pika({ content: \'pika(oops)\' })'])
	})

	it('handles regex literals containing parens inside arguments', () => {
		const fnUtils = createFnUtils('pika')
		const code = 'const a = pika({ content: String(/[)]/) }) '

		expect(findFunctionCalls(code, fnUtils)
			.map(match => match.snippet))
			.toEqual(['pika({ content: String(/[)]/) })'])
	})

	it('finds calls inside Vue SFC template attributes when the id is html-like', () => {
		const fnUtils = createFnUtils('pika')
		const code = [
			'<script setup lang="ts">',
			'const scriptCall = pika({ color: \'gold\' })',
			'</script>',
			'',
			'<template>',
			'\t<div :class="pika({ height: \'100vh\', width: \'100vw\' })">',
			'\t\t<span :class="pika({ content: \'")("\' })">text</span>',
			'\t</div>',
			'</template>',
		].join('\n')

		expect(findFunctionCalls(code, fnUtils, '/project/src/App.vue')
			.map(match => match.snippet))
			.toEqual([
				'pika({ color: \'gold\' })',
				'pika({ height: \'100vh\', width: \'100vw\' })',
				'pika({ content: \'")("\' })',
			])
	})

	it('tracks strings, escapes, template expressions, nested parens, and comments in html-like sources', () => {
		const fnUtils = createFnUtils('pika')
		const code = [
			'<script setup lang="ts">',
			'const a = pika({ content: \'quote \\\' ) still inside\' })',
			'const b = pika({ content: `calc(${`1`})` /* block ) */ })',
			'const c = pika((() => ({ color: \'blue\' // trailing )',
			'}))())',
			'</script>',
		].join('\n')

		expect(findFunctionCalls(code, fnUtils, '/project/src/App.vue')
			.map(match => match.snippet))
			.toEqual([
				'pika({ content: \'quote \\\' ) still inside\' })',
				'pika({ content: `calc(${`1`})` /* block ) */ })',
				'pika((() => ({ color: \'blue\' // trailing )\n}))())',
			])
	})

	it('warns and skips malformed calls in html-like sources', () => {
		const fnUtils = createFnUtils('pika')
		const warn = vi.fn()
		log.setWarnFn(warn)

		expect(findFunctionCalls('<script>const a = pika({ color: `red ${`</script>', fnUtils, 'a.vue'))
			.toEqual([])
		expect(findFunctionCalls('<script>const b = pika({ color: \'red\' /*</script>', fnUtils, 'b.vue'))
			.toEqual([])
		expect(findFunctionCalls('<script>const c = pika({ color: \'red\' //</script>', fnUtils, 'c.vue'))
			.toEqual([])
		expect(findFunctionCalls('<script>const d = pika({ color: \'red\' }</script>', fnUtils, 'd.vue'))
			.toEqual([])

		expect(warn.mock.calls.filter(call => call.join(' ')
			.includes('Malformed function call')))
			.toHaveLength(4)
	})

	it('honors a custom markup id matcher and allows disabling markup mode', () => {
		const fnUtils = createFnUtils('pika')
		const code = '<div class="pika({ color: \'gold\' })"></div>'

		expect(findFunctionCalls(code, fnUtils, '/project/src/App.riot', createMarkupIdRE(['riot']))
			.map(match => match.snippet))
			.toEqual(['pika({ color: \'gold\' })'])
		// Without a matching markup matcher the attribute value is JS-stripped away.
		expect(findFunctionCalls(code, fnUtils, '/project/src/App.riot'))
			.toEqual([])
		expect(findFunctionCalls(code, fnUtils, '/project/src/App.vue', null))
			.toEqual([])
	})

	it('ignores script-block string literals and JS comments in html-like sources', () => {
		const fnUtils = createFnUtils('pika')
		const code = [
			'<script setup lang="ts">',
			'const tip = "use pika(\'bg:red\') here"',
			'const tpl = `template pika(1)`',
			'// pika({ color: \'red\' })',
			'/* pika({ color: \'green\' }) */',
			'const real = pika({ color: \'gold\' })',
			'</script>',
			'',
			'<template>',
			'\t<div :class="pika({ color: \'blue\' })">',
			'</template>',
		].join('\n')

		expect(findFunctionCalls(code, fnUtils, '/project/src/App.vue')
			.map(match => match.snippet))
			.toEqual([
				'pika({ color: \'gold\' })',
				'pika({ color: \'blue\' })',
			])
	})

	it('ignores calls inside HTML comments and member accesses in html-like sources', () => {
		const fnUtils = createFnUtils('pika')
		const code = [
			'<template>',
			'\t<!-- <div :class="pika({ color: \'red\' })"> -->',
			'\t<div :class="obj.pika({ color: \'blue\' })">',
			'\t<div :class="pika({ color: \'gold\' })">',
			'</template>',
		].join('\n')

		expect(findFunctionCalls(code, fnUtils, '/project/src/App.vue')
			.map(match => match.snippet))
			.toEqual(['pika({ color: \'gold\' })'])
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
