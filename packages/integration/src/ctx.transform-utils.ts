/* eslint-disable no-cond-assign */
import type { Nullish } from '@pikacss/core'
import type { FnUtils } from './types'
import { log } from '@pikacss/core'

/**
 * Describes a single matched `pika()` function call found in source code, including its position and raw text.
 * @internal
 */
export interface FunctionCallMatch {
	/** The matched function variant name (e.g., `'pika'`, `'pika.str'`, `'pikap.arr'`). */
	fnName: string
	/** Zero-based character offset where the function call begins in the source. */
	start: number
	/** Zero-based character offset of the closing parenthesis of the function call. */
	end: number
	/** The raw source text of the full function call, from the function name through the closing parenthesis. */
	snippet: string
}

const ESCAPE_REPLACE_RE = /[.*+?^${}()|[\]\\/]/g

/**
 * Builds classifier functions and a compiled regex for all `pika()` function call variants derived from the given base name.
 * @internal
 *
 * @param fnName - The base function name (e.g., `'pika'`). All variants (`.str`, `.arr`, `p` suffix, bracket notation) are derived from this.
 * @returns An `FnUtils` object with classifier methods and a global regex for matching all call variants.
 *
 * @remarks
 * The generated regex handles bracket-notation property access (e.g., `pika['str']`)
 * in addition to dot notation, and includes word-boundary anchors to avoid false
 * matches within longer identifiers.
 *
 * @example
 * ```ts
 * const fnUtils = createFnUtils('pika')
 * fnUtils.isNormal('pika')         // true
 * fnUtils.isForceString('pika.str') // true
 * fnUtils.RE.test('pika(')         // true
 * ```
 */
export function createFnUtils(fnName: string): FnUtils {
	const available = {
		normal: new Set([fnName]),
		forceString: new Set([`${fnName}.str`, `${fnName}['str']`, `${fnName}["str"]`, `${fnName}[\`str\`]`]),
		forceArray: new Set([`${fnName}.arr`, `${fnName}['arr']`, `${fnName}["arr"]`, `${fnName}[\`arr\`]`]),
		normalPreview: new Set([`${fnName}p`]),
		forceStringPreview: new Set([`${fnName}p.str`, `${fnName}p['str']`, `${fnName}p["str"]`, `${fnName}p[\`str\`]`]),
		forceArrayPreview: new Set([`${fnName}p.arr`, `${fnName}p['arr']`, `${fnName}p["arr"]`, `${fnName}p[\`arr\`]`]),
	}
	const RE = new RegExp(`\\b(${Object.values(available)
		.flatMap(set => [...set].map(name => `(${name.replace(ESCAPE_REPLACE_RE, '\\$&')})`))
		.join('|')})\\(`, 'g')

	return {
		isNormal: name => available.normal.has(name) || available.normalPreview.has(name),
		isForceString: name => available.forceString.has(name) || available.forceStringPreview.has(name),
		isForceArray: name => available.forceArray.has(name) || available.forceArrayPreview.has(name),
		isPreview: name => available.normalPreview.has(name) || available.forceStringPreview.has(name) || available.forceArrayPreview.has(name),
		RE,
	}
}

/**
 * Finds the index of the closing `}` that terminates a template literal `${...}` expression.
 * @internal
 *
 * @param code - The full source code string to search within.
 * @param start - The index of the opening `{` of the template expression.
 * @returns The index of the matching closing `}`, or `-1` if the expression is malformed or unterminated.
 *
 * @remarks
 * Tracks nested braces, string literals (single, double, and backtick), escape sequences,
 * line comments, and block comments. Recursively handles nested template expressions
 * within backtick strings.
 */
export function findTemplateExpressionEnd(code: string, start: number): number {
	let end = start
	let depth = 1
	let inString: '\'' | '"' | '`' | false = false
	let isEscaped = false

	while (depth > 0 && end < code.length - 1) {
		end++
		const char = code[end]

		if (isEscaped) {
			isEscaped = false
			continue
		}

		if (char === '\\') {
			isEscaped = true
			continue
		}

		if (inString !== false) {
			if (char === inString) {
				inString = false
			}
			else if (inString === '`' && char === '$' && code[end + 1] === '{') {
				if ((end = findTemplateExpressionEnd(code, end + 1)) < 0) {
					return -1
				}
			}
			continue
		}

		if (char === '{') {
			depth++
		}
		else if (char === '}') {
			depth--
		}
		else if (char === '\'' || char === '"' || char === '`') {
			inString = char
		}
		else if (char === '/' && code[end + 1] === '/') {
			const lineEnd = code.indexOf('\n', end)
			if (lineEnd === -1) {
				return -1
			}
			end = lineEnd
		}
		else if (char === '/' && code[end + 1] === '*') {
			if ((end = code.indexOf('*/', end + 2) + 1) === 0) {
				return -1
			}
		}
	}

	return depth === 0 ? end : -1
}

/**
 * Scans source code and returns all `pika()` function call matches found by the provided regex.
 * @internal
 *
 * @param code - The full source code string to scan for function calls.
 * @param fnUtils - An object providing the `RE` regex used to locate function call start positions.
 * @returns An array of `FunctionCallMatch` objects, one per matched call. Malformed calls (unbalanced parentheses) are logged and skipped.
 *
 * @remarks
 * Correctly handles nested parentheses, string literals, template expressions,
 * line comments, and block comments within function arguments. Each match
 * includes the full call snippet for later evaluation.
 *
 * @example
 * ```ts
 * const fnUtils = createFnUtils('pika')
 * const matches = findFunctionCalls(`pika('bg:red', 'c:white')`, fnUtils)
 * // [{ fnName: 'pika', start: 0, end: 25, snippet: "pika('bg:red', 'c:white')" }]
 * ```
 */
export function findFunctionCalls(code: string, fnUtils: Pick<FnUtils, 'RE'>): FunctionCallMatch[] {
	const RE = fnUtils.RE
	const result: FunctionCallMatch[] = []
	let matched: RegExpExecArray | Nullish = RE.exec(code)

	while (matched != null) {
		const fnName = matched[1]!
		const start = matched.index
		let end = start + fnName.length
		let depth = 1
		let inString: '\'' | '"' | '`' | false = false
		let isEscaped = false

		while (depth > 0 && end < code.length) {
			end++
			const char = code[end]

			if (isEscaped) {
				isEscaped = false
				continue
			}

			if (char === '\\') {
				isEscaped = true
				continue
			}

			if (inString !== false) {
				if (char === inString) {
					inString = false
				}
				else if (inString === '`' && char === '$' && code[end + 1] === '{') {
					const templateExpressionEnd = findTemplateExpressionEnd(code, end + 1)
					if (templateExpressionEnd === -1) {
						log.warn(`Malformed template literal expression in function call at position ${start}`)
						break
					}
					end = templateExpressionEnd
				}
				continue
			}

			if (char === '(') {
				depth++
			}
			else if (char === ')') {
				depth--
			}
			else if (char === '\'' || char === '"' || char === '`') {
				inString = char
			}
			else if (char === '/' && code[end + 1] === '/') {
				const lineEnd = code.indexOf('\n', end)
				if (lineEnd === -1) {
					log.warn(`Unclosed function call at position ${start}`)
					break
				}
				end = lineEnd
			}
			else if (char === '/' && code[end + 1] === '*') {
				const commentEnd = code.indexOf('*/', end + 2)
				if (commentEnd === -1) {
					log.warn(`Unclosed comment in function call at position ${start}`)
					break
				}
				end = commentEnd + 1
			}
		}

		if (depth !== 0) {
			log.warn(`Malformed function call at position ${start}, skipping`)
			matched = RE.exec(code)
			continue
		}

		const snippet = code.slice(start, end + 1)
		result.push({ fnName, start, end, snippet })
		matched = RE.exec(code)
	}

	return result
}
