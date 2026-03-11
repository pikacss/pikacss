import type { Arrayable, AutocompleteConfig, AutocompleteContribution, CSSStyleBlocks, InternalPropertyValue, ResolvedEngineConfig } from './types'

export function createLogger(prefix: string) {
	let currentPrefix = prefix
	let enabledDebug = false
	// eslint-disable-next-line no-console
	let _debug: (prefix: string, ...args: unknown[]) => void = console.log
	// eslint-disable-next-line no-console
	let _info: (prefix: string, ...args: unknown[]) => void = console.log
	let _warn: (prefix: string, ...args: unknown[]) => void = console.warn
	let _error: (prefix: string, ...args: unknown[]) => void = console.error

	const log: {
		debug: (...args: unknown[]) => void
		info: (...args: unknown[]) => void
		warn: (...args: unknown[]) => void
		error: (...args: unknown[]) => void
		toggleDebug: () => void
		setPrefix: (newPrefix: string) => void
		setDebugFn: (fn: (prefix: string, ...args: unknown[]) => void) => void
		setInfoFn: (fn: (prefix: string, ...args: unknown[]) => void) => void
		setWarnFn: (fn: (prefix: string, ...args: unknown[]) => void) => void
		setErrorFn: (fn: (prefix: string, ...args: unknown[]) => void) => void
	} = {
		debug: (...args: unknown[]) => {
			if (!enabledDebug)
				return
			_debug(`${currentPrefix}[DEBUG]`, ...args)
		},
		info: (...args: unknown[]) => {
			_info(`${currentPrefix}[INFO]`, ...args)
		},
		warn: (...args: unknown[]) => {
			_warn(`${currentPrefix}[WARN]`, ...args)
		},
		error: (...args: unknown[]) => {
			_error(`${currentPrefix}[ERROR]`, ...args)
		},
		toggleDebug() {
			enabledDebug = !enabledDebug
		},
		setPrefix(newPrefix: string) {
			currentPrefix = newPrefix
		},
		setDebugFn(fn: (prefix: string, ...args: unknown[]) => void) {
			_debug = fn
		},
		setInfoFn(fn: (prefix: string, ...args: unknown[]) => void) {
			_info = fn
		},
		setWarnFn(fn: (prefix: string, ...args: unknown[]) => void) {
			_warn = fn
		},
		setErrorFn(fn: (prefix: string, ...args: unknown[]) => void) {
			_error = fn
		},
	}

	return log
}
export const log = createLogger('[PikaCSS]')

const chars = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']
const numOfChars = chars.length
export function numberToChars(num: number) {
	if (num < numOfChars)
		return chars[num]!

	let result = ''
	let n = num
	// Handle the case when num >= numOfChars
	while (n >= 0) {
		result += chars[n % numOfChars]
		n = Math.floor(n / numOfChars) - 1
	}
	return result
}

const UPPER_CASE = /[A-Z]/g
export function toKebab(str: string) {
	if (str.startsWith('--'))
		return str
	return str.replace(UPPER_CASE, c => `-${c.toLowerCase()}`)
}

export function isNotNullish<T>(value: T): value is NonNullable<T> {
	return value != null
}

export function isString(value: unknown): value is string {
	return typeof value === 'string'
}

export function isNotString<V>(value: V): value is Exclude<V, string> {
	return typeof value !== 'string'
}

export function isPropertyValue(v: unknown): v is InternalPropertyValue {
	if (Array.isArray(v)) {
		return v.length === 2
			&& typeof v[0] === 'string'
			&& Array.isArray(v[1])
			&& v[1].every(i => typeof i === 'string')
	}

	if (v == null)
		return true

	if (typeof v === 'string')
		return true

	return false
}

export function serialize(value: unknown): string {
	return JSON.stringify(value)
}

export function addToSet<T>(set: Set<T>, ...values: T[]) {
	const before = set.size
	values.forEach(value => set.add(value))
	return set.size !== before
}

export function appendAutocompleteEntries(set: Set<string>, values?: Arrayable<string>) {
	if (values == null)
		return false

	return addToSet(set, ...[values].flat())
}

export function appendAutocompleteRecordEntries(map: Map<string, string[]>, entries?: Record<string, Arrayable<string>>) {
	if (entries == null)
		return false

	let changed = false
	for (const [key, value] of Object.entries(entries)) {
		const nextValues = [value].flat()
		if (nextValues.length === 0)
			continue

		const current = map.get(key) || []
		map.set(key, [...current, ...nextValues])
		changed = true
	}

	return changed
}

function normalizeAutocompleteRecordEntries(
	entries?: Record<string, Arrayable<string>> | [key: string, value: Arrayable<string>][],
) {
	if (entries == null)
		return undefined

	return Array.isArray(entries)
		? Object.fromEntries(entries)
		: entries
}

export function appendAutocomplete(
	config: Pick<ResolvedEngineConfig, 'autocomplete'>,
	contribution: AutocompleteContribution | AutocompleteConfig,
) {
	const { patterns, properties, cssProperties, ...literals } = contribution
	return [
		appendAutocompleteEntries(config.autocomplete.selectors, literals.selectors),
		appendAutocompleteEntries(config.autocomplete.styleItemStrings, literals.styleItemStrings),
		appendAutocompleteEntries(config.autocomplete.extraProperties, literals.extraProperties),
		appendAutocompleteEntries(config.autocomplete.extraCssProperties, literals.extraCssProperties),
		appendAutocompleteRecordEntries(config.autocomplete.properties, normalizeAutocompleteRecordEntries(properties)),
		appendAutocompleteRecordEntries(config.autocomplete.cssProperties, normalizeAutocompleteRecordEntries(cssProperties)),
		appendAutocompleteEntries(config.autocomplete.patterns.selectors, patterns?.selectors),
		appendAutocompleteEntries(config.autocomplete.patterns.styleItemStrings, patterns?.styleItemStrings),
		appendAutocompleteRecordEntries(config.autocomplete.patterns.properties, patterns?.properties),
		appendAutocompleteRecordEntries(config.autocomplete.patterns.cssProperties, patterns?.cssProperties),
	].some(Boolean)
}

export function renderCSSStyleBlocks(blocks: CSSStyleBlocks, isFormatted: boolean, depth = 0) {
	const blockIndent = isFormatted ? '  '.repeat(depth) : ''
	const blockBodyIndent = isFormatted ? '  '.repeat(depth + 1) : ''
	const selectorEnd = isFormatted ? ' ' : ''
	const propertySpace = isFormatted ? ' ' : ''
	const lineEnd = isFormatted ? '\n' : ''
	const lines: string[] = []
	blocks.forEach(({ properties, children }, selector) => {
		if (properties.length === 0 && (children == null || children.size === 0))
			return

		lines.push(...[
			`${blockIndent}${selector}${selectorEnd}{`,
			...properties.map(({ property, value }) => `${blockBodyIndent}${property}:${propertySpace}${value};`),
			...(children != null && children.size > 0)
				? [renderCSSStyleBlocks(children, isFormatted, depth + 1)]
				: [],
			`${blockIndent}}`,
		])
	})
	return lines.join(lineEnd)
}
