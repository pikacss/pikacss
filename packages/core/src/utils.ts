import type { Arrayable, AutocompleteConfig, AutocompleteContribution, CSSStyleBlocks, InternalPropertyValue, ResolvedEngineConfig } from './types'

/**
 * Creates a scoped logger with configurable log-level functions and a toggleable debug mode.
 *
 * @param prefix - Label prepended to every log message (e.g. `'[PikaCSS]'`).
 * @returns A logger object with `debug`, `info`, `warn`, `error` methods and configuration setters.
 *
 * @remarks Debug messages are suppressed by default. Call `log.toggleDebug()` to enable them. Each log level can be replaced with a custom implementation via the `set*Fn` methods, which is useful for redirecting output in non-browser environments.
 *
 * @example
 * ```ts
 * const log = createLogger('[MyPlugin]')
 * log.info('initialized')  // '[MyPlugin][INFO] initialized'
 * log.toggleDebug()
 * log.debug('verbose info') // '[MyPlugin][DEBUG] verbose info'
 * ```
 */
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
/**
 * Default logger instance used throughout the PikaCSS core engine, prefixed with `[PikaCSS]`.
 *
 * @remarks Shared across all internal modules. Plugins and integration code can call `log.toggleDebug()` to enable verbose output during development.
 *
 * @example
 * ```ts
 * log.info('Engine created')
 * log.warn('Unknown layer detected')
 * ```
 */
export const log = createLogger('[PikaCSS]')

const chars = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ']
const numOfChars = chars.length
/**
 * Converts a non-negative integer to a compact alphabetic string using a bijective base-52 encoding (a-z, A-Z).
 * @internal
 *
 * @param num - The non-negative integer to encode.
 * @returns A short alphabetic string unique to the given integer.
 *
 * @remarks Used to generate compact, human-readable atomic style class IDs. The encoding is deterministic: the same number always produces the same string.
 *
 * @example
 * ```ts
 * numberToChars(0)  // 'a'
 * numberToChars(51) // 'Z'
 * numberToChars(52) // 'ba'
 * ```
 */
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
/**
 * Converts a camelCase string to kebab-case at runtime. CSS custom properties (`--*`) are returned unchanged.
 * @internal
 *
 * @param str - The camelCase string to convert.
 * @returns The kebab-case equivalent of the input string.
 *
 * @remarks Runtime counterpart of the `ToKebab` type utility. Used during style extraction to normalize JavaScript-style property names to CSS property names.
 *
 * @example
 * ```ts
 * toKebab('backgroundColor') // 'background-color'
 * toKebab('--my-var')        // '--my-var'
 * ```
 */
export function toKebab(str: string) {
	if (str.startsWith('--'))
		return str
	return str.replace(UPPER_CASE, c => `-${c.toLowerCase()}`)
}

/**
 * Type-narrowing guard that returns `true` when the value is neither `null` nor `undefined`.
 * @internal
 *
 * @typeParam T - The type of the input value.
 * @param value - The value to test.
 * @returns `true` if the value is non-nullish, narrowing the type to `NonNullable<T>`.
 *
 * @remarks Commonly used as a `.filter()` predicate to strip nullish entries from arrays while preserving the narrowed type.
 *
 * @example
 * ```ts
 * [1, null, 2, undefined].filter(isNotNullish) // [1, 2] typed as number[]
 * ```
 */
export function isNotNullish<T>(value: T): value is NonNullable<T> {
	return value != null
}

/**
 * Type-narrowing guard that returns `true` when the value is a string.
 * @internal
 *
 * @param value - The value to test.
 * @returns `true` if the value is a `string`.
 *
 * @remarks Used in pipeline steps to distinguish between string-based style items (shortcuts / class names) and object-based style definitions.
 *
 * @example
 * ```ts
 * isString('hello') // true
 * isString(42)      // false
 * ```
 */
export function isString(value: unknown): value is string {
	return typeof value === 'string'
}

/**
 * Type-narrowing guard that returns `true` when the value is not a string, narrowing the type to `Exclude<V, string>`.
 * @internal
 *
 * @typeParam V - The union type of the input value.
 * @param value - The value to test.
 * @returns `true` if the value is not a `string`.
 *
 * @remarks Useful for filtering processed style items to separate resolved definition objects from unresolved string references.
 *
 * @example
 * ```ts
 * const items: (string | object)[] = ['btn', { color: 'red' }]
 * const objects = items.filter(isNotString) // [{ color: 'red' }]
 * ```
 */
export function isNotString<V>(value: V): value is Exclude<V, string> {
	return typeof value !== 'string'
}

/**
 * Tests whether a value conforms to the `InternalPropertyValue` shape: a string, a `[value, fallback[]]` tuple, or nullish.
 * @internal
 *
 * @param v - The value to inspect.
 * @returns `true` if the value is a valid property value.
 *
 * @remarks During extraction, the engine uses this guard to distinguish CSS property values from nested selector objects or style item arrays.
 *
 * @example
 * ```ts
 * isPropertyValue('red')                  // true
 * isPropertyValue(['red', ['blue']])       // true
 * isPropertyValue(null)                    // true
 * isPropertyValue({ color: 'red' })        // false
 * ```
 */
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

/**
 * Serializes a value to a JSON string for use as a deterministic cache key.
 * @internal
 *
 * @param value - The value to serialize.
 * @returns The JSON string representation.
 *
 * @remarks Used to produce stable keys for selector chains and property content when building deduplication maps in the optimization pipeline.
 *
 * @example
 * ```ts
 * serialize(['.pk-%', 'color']) // '[[".pk-%"],"color"]'
 * ```
 */
export function serialize(value: unknown): string {
	return JSON.stringify(value)
}

/**
 * Adds one or more values to a `Set` and returns whether the set's size increased.
 * @internal
 *
 * @typeParam T - The element type of the set.
 * @param set - The target set to append to.
 * @param values - Values to add.
 * @returns `true` if at least one new element was added (the set grew).
 *
 * @remarks The boolean return is used by `appendAutocomplete` to determine whether the autocomplete config actually changed, avoiding unnecessary notification callbacks.
 *
 * @example
 * ```ts
 * const s = new Set(['a'])
 * addToSet(s, 'a', 'b') // true (added 'b')
 * addToSet(s, 'a')      // false (no change)
 * ```
 */
export function addToSet<T>(set: Set<T>, ...values: T[]) {
	const before = set.size
	values.forEach(value => set.add(value))
	return set.size !== before
}

/**
 * Flattens an `Arrayable<string>` value and adds all entries to a `Set`, returning whether the set grew.
 * @internal
 *
 * @param set - The target set to append to.
 * @param values - A single string or array of strings to add, or `undefined`/`null` to skip.
 * @returns `true` if at least one new entry was added; `false` if the input was nullish or all entries already existed.
 *
 * @remarks Short-circuits on nullish input for convenience, since many autocomplete contribution fields are optional.
 *
 * @example
 * ```ts
 * const s = new Set<string>()
 * appendAutocompleteEntries(s, 'hover')       // true
 * appendAutocompleteEntries(s, ['hover'])      // false (already present)
 * appendAutocompleteEntries(s, undefined)      // false
 * ```
 */
export function appendAutocompleteEntries(set: Set<string>, values?: Arrayable<string>) {
	if (values == null)
		return false

	return addToSet(set, ...[values].flat())
}

/**
 * Merges a record of `Arrayable<string>` values into a `Map<string, string[]>`, returning whether any entry was added.
 * @internal
 *
 * @param map - The target map to append entries to.
 * @param entries - A record mapping keys to single or arrayed string values, or `undefined` to skip.
 * @returns `true` if at least one entry was added or extended; `false` if the input was nullish or empty.
 *
 * @remarks Existing map entries are extended (not replaced) with the new values, maintaining all previously registered suggestions for a given key. This accumulative behavior allows multiple plugins to contribute value suggestions for the same property.
 *
 * @example
 * ```ts
 * const map = new Map<string, string[]>()
 * appendAutocompleteRecordEntries(map, { color: ['red', 'blue'] }) // true
 * appendAutocompleteRecordEntries(map, { color: 'green' })         // true (now ['red','blue','green'])
 * ```
 */
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

/**
 * Merges an `AutocompleteContribution` or `AutocompleteConfig` into the resolved autocomplete state, returning whether any entry changed.
 *
 * @param config - The resolved engine config (or a subset with the `autocomplete` field) to mutate.
 * @param contribution - The autocomplete entries to merge in.
 * @returns `true` if any selector, shortcut, property, CSS property, or pattern entry was added or extended.
 *
 * @remarks Called by `engine.appendAutocomplete()` and during initial config resolution. Each sub-field (selectors, shortcuts, etc.) is independently merged and the function returns `true` if any of them changed, which triggers an `autocompleteConfigUpdated` notification.
 *
 * @example
 * ```ts
 * const changed = appendAutocomplete(resolvedConfig, {
 *   selectors: 'dark',
 *   cssProperties: { color: 'primary' },
 * })
 * ```
 */
export function appendAutocomplete(
	config: Pick<ResolvedEngineConfig, 'autocomplete'>,
	contribution: AutocompleteContribution | AutocompleteConfig,
) {
	const { patterns, properties, cssProperties, ...literals } = contribution
	return [
		appendAutocompleteEntries(config.autocomplete.selectors, literals.selectors),
		appendAutocompleteEntries(config.autocomplete.shortcuts, literals.shortcuts),
		appendAutocompleteEntries(config.autocomplete.extraProperties, literals.extraProperties),
		appendAutocompleteEntries(config.autocomplete.extraCssProperties, literals.extraCssProperties),
		appendAutocompleteRecordEntries(config.autocomplete.properties, normalizeAutocompleteRecordEntries(properties)),
		appendAutocompleteRecordEntries(config.autocomplete.cssProperties, normalizeAutocompleteRecordEntries(cssProperties)),
		appendAutocompleteEntries(config.autocomplete.patterns.selectors, patterns?.selectors),
		appendAutocompleteEntries(config.autocomplete.patterns.shortcuts, patterns?.shortcuts),
		appendAutocompleteRecordEntries(config.autocomplete.patterns.properties, patterns?.properties),
		appendAutocompleteRecordEntries(config.autocomplete.patterns.cssProperties, patterns?.cssProperties),
	].some(Boolean)
}

/**
 * Serializes a `CSSStyleBlocks` tree into a CSS string, optionally formatted with indentation and newlines.
 *
 * @param blocks - The CSS block tree to render.
 * @param isFormatted - When `true`, output includes indentation and newlines for readability; when `false`, output is minified.
 * @param depth - Current nesting depth for indentation (defaults to `0`).
 * @returns The rendered CSS string.
 *
 * @remarks Recursively renders nested blocks (e.g. media queries wrapping selectors). Empty blocks (no properties and no children) are omitted from the output.
 *
 * @example
 * ```ts
 * const blocks: CSSStyleBlocks = new Map()
 * blocks.set('.pk-a', { properties: [{ property: 'color', value: 'red' }] })
 * renderCSSStyleBlocks(blocks, true)
 * // '.pk-a {\n  color: red;\n}'
 * ```
 */
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
