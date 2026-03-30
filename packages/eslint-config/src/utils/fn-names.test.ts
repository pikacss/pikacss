import { describe, expect, it } from 'vitest'

import { buildFnNamePatterns, getCalleeName } from './fn-names'

describe('buildFnNamePatterns', () => {
	it('derives default base, preview, and member-access names from pika', () => {
		const patterns = buildFnNamePatterns()

		expect(patterns.fnName)
			.toBe('pika')
		expect(patterns.previewFnName)
			.toBe('pikap')
		expect([...patterns.normalNames])
			.toEqual(['pika', 'pika.str', 'pika.arr'])
		expect([...patterns.previewNames])
			.toEqual(['pikap', 'pikap.str', 'pikap.arr'])
		expect(patterns.allNames.has('pikap.arr'))
			.toBe(true)
	})

	it('derives all variants from a custom base function name', () => {
		const patterns = buildFnNamePatterns('styled')

		expect(patterns.previewFnName)
			.toBe('styledp')
		expect(patterns.allNames)
			.toEqual(new Set([
				'styled',
				'styled.str',
				'styled.arr',
				'styledp',
				'styledp.str',
				'styledp.arr',
			]))
	})
})

describe('getCalleeName', () => {
	it('extracts simple identifiers and direct member expressions', () => {
		expect(getCalleeName({
			type: 'CallExpression',
			callee: { type: 'Identifier', name: 'pika' },
		}))
			.toBe('pika')

		expect(getCalleeName({
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				computed: false,
				object: { type: 'Identifier', name: 'pika' },
				property: { type: 'Identifier', name: 'str' },
			},
		}))
			.toBe('pika.str')
	})

	it('extracts computed string and template-literal member access', () => {
		expect(getCalleeName({
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				computed: true,
				object: { type: 'Identifier', name: 'pika' },
				property: { type: 'Literal', value: 'arr' },
			},
		}))
			.toBe('pika.arr')

		expect(getCalleeName({
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				computed: true,
				object: { type: 'Identifier', name: 'pika' },
				property: {
					type: 'TemplateLiteral',
					quasis: [{ value: { cooked: 'str' } }],
					expressions: [],
				},
			},
		}))
			.toBe('pika.str')

		expect(getCalleeName({
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				computed: true,
				object: { type: 'Identifier', name: 'pika' },
				property: {
					type: 'TemplateLiteral',
					quasis: [{ value: { cooked: null } }],
					expressions: [],
				},
			},
		}))
			.toBe('pika.')
	})

	it('returns null for unsupported callee shapes', () => {
		expect(getCalleeName({
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				computed: false,
				object: { type: 'Identifier', name: 'pika' },
				property: { type: 'Literal', value: 'str' },
			},
		}))
			.toBeNull()

		expect(getCalleeName({
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				computed: true,
				object: { type: 'CallExpression' },
				property: { type: 'Literal', value: 'str' },
			},
		}))
			.toBeNull()

		expect(getCalleeName({
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				computed: true,
				object: { type: 'Identifier', name: 'pika' },
				property: {
					type: 'TemplateLiteral',
					quasis: [{ value: { cooked: 'str' } }],
					expressions: [{}],
				},
			},
		}))
			.toBeNull()
	})
})
