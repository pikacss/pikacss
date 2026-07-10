/* eslint-disable no-cond-assign */
import type { Nullish } from '@pikacss/core'
import type { FnUtils } from './types'
import { escapeRegExp, log } from '@pikacss/core'
import { stripLiteral } from 'strip-literal'

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
		.flatMap(set => Array.from(set, name => `(${escapeRegExp(name)})`))
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

const FUNCTION_KEYWORD = 'function'

/**
 * Tests whether the text ending at `position` (exclusive) is a `function`
 * keyword (optionally a generator `function *`), i.e. the equivalent of
 * matching `/\bfunction\s*(?:\*\s*)?$/` against `code.slice(0, position)`.
 * @internal
 *
 * @remarks Implemented as a backwards character scan instead of an anchored
 * regex over the whole prefix, so each check costs only the keyword lookback
 * rather than O(source length) per match.
 */
function isPrecededByFunctionKeyword(code: string, position: number): boolean {
	let i = position - 1
	while (i >= 0 && /\s/.test(code[i]!))
		i--
	if (code[i] === '*') {
		i--
		while (i >= 0 && /\s/.test(code[i]!))
			i--
	}
	const keywordStart = i - FUNCTION_KEYWORD.length + 1
	if (keywordStart < 0 || code.slice(keywordStart, i + 1) !== FUNCTION_KEYWORD)
		return false
	// Word boundary: the keyword must not be the tail of a longer identifier.
	return keywordStart === 0 || !/\w/.test(code[keywordStart - 1]!)
}

/**
 * File extensions (without the leading dot) treated as markup sources by default.
 *
 * @remarks
 * Markup files' top-level syntax is not JavaScript: template attribute values
 * are double-quoted from the markup's perspective, so a whole-file
 * `stripLiteral()` would blank the very `pika()` calls we need to find. Files
 * matching these extensions are scanned in markup mode instead.
 */
export const DEFAULT_MARKUP_EXTENSIONS = ['vue', 'svelte', 'astro', 'html', 'htm']

/**
 * Builds a regex that matches module ids whose file extension marks a markup source.
 *
 * @param extensions - File extensions (leading dots optional) to treat as markup sources.
 * Defaults to {@link DEFAULT_MARKUP_EXTENSIONS}.
 * @returns A case-insensitive regex matching ids ending with one of the extensions
 * (query strings and hashes tolerated), or `null` when the list is empty.
 */
export function createMarkupIdRE(extensions: string[] = DEFAULT_MARKUP_EXTENSIONS): RegExp | null {
	const escaped = extensions
		.map(ext => escapeRegExp(ext.replace(/^\.+/, '')))
		.filter(ext => ext.length > 0)
	if (escaped.length === 0)
		return null
	return new RegExp(`\\.(?:${escaped.join('|')})(?:[?#]|$)`, 'i')
}

const DEFAULT_MARKUP_ID_RE = createMarkupIdRE()

function blankHtmlComments(code: string): string {
	return code.replace(/<!--[\s\S]*?-->/g, match => match.replace(/[^\n]/g, ' '))
}

const SCRIPT_BLOCK_RE = /(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)/gi

/**
 * Produces a length-preserving copy of a markup source with non-code regions blanked:
 * HTML comment contents and JS literal/comment contents inside `<script>` blocks.
 * @internal
 *
 * @remarks
 * Script block contents are JS, so `pika(` inside a script-block string literal
 * or JS comment must not be treated as a call site. `stripLiteral()` is
 * length-preserving, so all offsets stay aligned with the original source.
 * limit: Astro frontmatter (`---` fences) is not JS-stripped, so lookalikes
 * inside frontmatter literals/comments can still match; treating the fences
 * like script blocks here is the upgrade path.
 */
function blankMarkupNonCode(code: string): string {
	return blankHtmlComments(code)
		.replace(
			SCRIPT_BLOCK_RE,
			(_, open: string, content: string, close: string) => `${open}${stripLiteral(content)}${close}`,
		)
}

/**
 * Heuristically detects the quote character of the markup attribute enclosing the given position.
 *
 * @param code - The full markup source code.
 * @param position - Zero-based offset of the expression to locate (e.g., a `pika()` call start).
 * @returns The enclosing attribute's quote character, or `null` when none is found.
 *
 * @remarks
 * Scans backwards from `position` for the nearest quote directly preceded by `=`
 * (whitespace allowed), which marks the opening of an attribute value; the scan
 * stops at a tag-open `<`. Quotes inside the enclosing attribute expression come
 * in pairs, so the backward scan lands on the attribute quote itself.
 * limit: an unpaired quote inside the attribute expression (e.g. a string
 * literal containing a lone quote char) can yield the wrong quote; a full
 * markup parse is the upgrade path.
 */
export function detectEnclosingAttributeQuote(code: string, position: number): '"' | '\'' | null {
	for (let i = position - 1; i >= 0; i--) {
		const char = code[i]
		if (char === '<')
			return null
		if (char !== '"' && char !== '\'')
			continue
		let j = i - 1
		while (j >= 0 && /\s/.test(code[j]!))
			j--
		if (j >= 0 && code[j] === '=')
			return char
	}
	return null
}

/**
 * Counts paren depth from a call's opening paren on the raw source, tracking
 * string literals, escapes, template expressions, and JS comments locally.
 * @internal
 *
 * @param code - The full raw source code.
 * @param start - Zero-based offset where the function name begins.
 * @param fnName - The matched function variant name (its length locates the opening paren).
 * @returns The offset of the call's closing paren, or `-1` when the call is malformed or unterminated.
 */
function findCallEndWithLocalTracking(code: string, start: number, fnName: string): number {
	let end = start + fnName.length
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
 * @param id - Optional module id (file path) of the source. Ids matching `markupIdRE`
 * switch scanning to markup mode.
 * @param markupIdRE - Regex deciding which ids are markup sources, typically built via
 * {@link createMarkupIdRE}. Defaults to the {@link DEFAULT_MARKUP_EXTENSIONS} matcher;
 * pass `null` to disable markup mode entirely.
 * @returns An array of `FunctionCallMatch` objects, one per matched call. Malformed calls (unbalanced parentheses) are logged and skipped.
 *
 * @remarks
 * For JavaScript-like sources, scanning runs against a literal-stripped copy of
 * the source (comments and string/template contents blanked out, offsets
 * preserved), so `pika(` inside strings or comments never matches and
 * parentheses inside literals never confuse the depth counter. Markup sources
 * (Vue SFCs etc.) cannot be JS-lexed as a whole — calls live inside quoted
 * template attributes — so there HTML comments are blanked, `<script>` block
 * contents are additionally JS literal/comment stripped, and paren depth is
 * tracked per call with local string/comment awareness. In both modes,
 * matches preceded by `.` (member access such as `obj.pika(...)`) or a
 * `function` keyword (declarations) are skipped, and each match includes the
 * full call snippet, sliced from the original code, for later evaluation.
 *
 * @example
 * ```ts
 * const fnUtils = createFnUtils('pika')
 * const matches = findFunctionCalls(`pika('bg:red', 'c:white')`, fnUtils)
 * // [{ fnName: 'pika', start: 0, end: 25, snippet: "pika('bg:red', 'c:white')" }]
 * ```
 */
const IDENTIFIER_PREFIX_RE = /^[$_a-z][\w$]*/i

export function findFunctionCalls(code: string, fnUtils: Pick<FnUtils, 'RE'>, id?: string, markupIdRE: RegExp | null = DEFAULT_MARKUP_ID_RE): FunctionCallMatch[] {
	const RE = fnUtils.RE
	const isHtmlLike = id != null && markupIdRE != null && markupIdRE.test(id)
	// Stripped copy with identical offsets, used to tell real call sites apart
	// from lookalikes: JS literal/comment contents blanked for JS-like sources;
	// HTML comment contents plus script-block JS literal/comment contents
	// blanked for markup sources.
	const stripped = isHtmlLike ? blankMarkupNonCode(code) : stripLiteral(code)
	const result: FunctionCallMatch[] = []
	RE.lastIndex = 0
	let matched: RegExpExecArray | Nullish = RE.exec(code)

	while (matched != null) {
		const fnName = matched[1]!
		const start = matched.index
		const identifier = IDENTIFIER_PREFIX_RE.exec(fnName)![0]

		// Skip matches whose identifier sits inside a stripped region, member
		// accesses (`obj.pika(...)`), and function declarations — none of them
		// are style call sites.
		if (
			stripped.slice(start, start + identifier.length) !== identifier
			|| stripped[start - 1] === '.'
			|| isPrecededByFunctionKeyword(stripped, start)
		) {
			matched = RE.exec(code)
			continue
		}

		let end: number
		if (isHtmlLike) {
			// Markup mode: literals are not blanked, so track strings and
			// comments locally while counting paren depth on the raw code.
			end = findCallEndWithLocalTracking(code, start, fnName)
		}
		else {
			// Count paren depth on the stripped copy: parens inside literals are
			// blanked, and parens inside `${...}` expressions are balanced code.
			end = start + fnName.length
			let depth = 1

			while (depth > 0 && end < stripped.length - 1) {
				end++
				const char = stripped[end]
				if (char === '(')
					depth++
				else if (char === ')')
					depth--
			}

			if (depth !== 0)
				end = -1
		}

		if (end < 0) {
			log.warn(`Malformed function call at position ${start}, skipping`)
			matched = RE.exec(code)
			continue
		}

		const snippet = code.slice(start, end + 1)
		result.push({ fnName, start, end, snippet })
		// Resume scanning after the call so its contents are never re-matched.
		RE.lastIndex = end + 1
		matched = RE.exec(code)
	}

	return result
}
