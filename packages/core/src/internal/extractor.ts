import type { ExtractedStyleContent, InternalPropertyValue, InternalStyleDefinition, InternalStyleItem, Nullish } from './types'
import {
	ATOMIC_STYLE_ID_PLACEHOLDER,
	ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL,
} from './constants'
import { isPropertyValue, toKebab } from './utils'

function replaceBySplitAndJoin(
	str: string,
	split: RegExp,
	mapFn: ((a: string) => string) | Nullish,
	join: string,
) {
	let splitted = str.split(split)
	if (mapFn != null)
		splitted = splitted.map(mapFn)
	return splitted
		.join(join)
}

const RE_SPLIT = /\s*,\s*/g
const DEFAULT_SELECTOR_PLACEHOLDER_RE_GLOBAL = /\$/g
const ATTRIBUTE_SUFFIX_MATCH = '$='
const ATTRIBUTE_SUFFIX_MATCH_RE_GLOBAL = /\$=/g
/**
 * Normalizes selector strings by replacing placeholders (`$` → `defaultSelector`, `%` → atomic style ID placeholder) and splitting comma-separated selectors.
 * @internal
 *
 * @param options - Object containing the raw `selectors` array and the `defaultSelector` template.
 * @returns An array of normalized selector strings with all placeholders resolved.
 *
 * @remarks The `$` character in a selector is replaced with the engine's `defaultSelector`. The `%` character is the atomic style ID placeholder, preserved for later substitution. Attribute suffix matches (`$=`) are protected from the `$` replacement.
 *
 * @example
 * ```ts
 * normalizeSelectors({ selectors: ['$hover $'], defaultSelector: '.%' })
 * // ['.%:hover .%'] (conceptually)
 * ```
 */
export function normalizeSelectors({
	selectors,
	defaultSelector,
}: {
	selectors: string[]
	defaultSelector: string
}) {
	const normalized = selectors.map(s =>
		replaceBySplitAndJoin(
			s.replace(RE_SPLIT, ','),
			ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL,
			a => replaceBySplitAndJoin(
				a,
				ATTRIBUTE_SUFFIX_MATCH_RE_GLOBAL,
				b => replaceBySplitAndJoin(
					b,
					DEFAULT_SELECTOR_PLACEHOLDER_RE_GLOBAL,
					null,
					defaultSelector,
				),
				ATTRIBUTE_SUFFIX_MATCH,
			),
			ATOMIC_STYLE_ID_PLACEHOLDER,
		),
	)

	return normalized
}

/**
 * Normalizes a raw `InternalPropertyValue` into the extraction output format: an array of trimmed, deduplicated CSS value strings with fallbacks ordered before the primary value, or `null`/`undefined` to signal removal.
 * @internal
 *
 * @param value - The raw property value to normalize.
 * @returns An array of CSS value strings (fallbacks first, primary last), or `null`/`undefined` for removal.
 *
 * @remarks For tuple values `[primary, fallbacks]`, duplicates among fallbacks are removed and the primary value is appended last so CSS cascade uses it as the effective value while older browsers fall back to earlier entries.
 *
 * @example
 * ```ts
 * normalizeValue('red')                 // ['red']
 * normalizeValue(['red', ['blue']])     // ['blue', 'red']
 * normalizeValue(null)                  // null
 * ```
 */
export function normalizeValue(value: InternalPropertyValue): ExtractedStyleContent['value'] {
	if (value == null)
		return value

	if (Array.isArray(value)) {
		const [primary, fallbacks] = value
		const p = primary.trim()
		const seen = new Set<string>([p])
		const result: string[] = []
		for (const v of fallbacks) {
			const s = v.trim()
			if (!seen.has(s)) {
				seen.add(s)
				result.push(s)
			}
		}
		result.push(p)
		return result
	}

	return [value.trim()]
}

/**
 * Recursively walks a style definition tree, extracting each CSS property-value pair into a flat list of `ExtractedStyleContent` entries with their full selector chain.
 * @internal
 *
 * @param options - Extraction context: the `styleDefinition` to walk, current nesting `levels`, accumulated `result`, `defaultSelector`, and plugin transform hooks for selectors, style items, and style definitions.
 * @returns The accumulated array of `ExtractedStyleContent` entries.
 *
 * @remarks Property values are identified using `isPropertyValue`. Array values are treated as style item lists (resolved via `transformStyleItems`). Object values are treated as nested style definitions and recursed into. The transform hooks allow plugins (shortcuts, selectors) to intercept and expand values during extraction.
 *
 * @example
 * ```ts
 * const contents = await extract({
 *   styleDefinition: { color: 'red', '$hover': { color: 'blue' } },
 *   defaultSelector: '.%',
 *   transformSelectors: async s => s,
 *   transformStyleItems: async i => i,
 *   transformStyleDefinitions: async d => d,
 * })
 * ```
 */
export async function extract({
	styleDefinition,
	levels = [],
	result = [],
	defaultSelector,
	transformSelectors,
	transformStyleItems,
	transformStyleDefinitions,
}: {
	styleDefinition: InternalStyleDefinition
	levels?: string[]
	result?: ExtractedStyleContent[]
	defaultSelector: string
	transformSelectors: (selectors: string[]) => Promise<string[]>
	transformStyleItems: (styleItems: InternalStyleItem[]) => Promise<InternalStyleItem[]>
	transformStyleDefinitions: (styleDefinitions: InternalStyleDefinition[]) => Promise<InternalStyleDefinition[]>
}): Promise<ExtractedStyleContent[]> {
	for (const definition of await transformStyleDefinitions([styleDefinition])) {
		for (const [k, v] of Object.entries(definition)) {
			if (isPropertyValue(v)) {
				const selector = normalizeSelectors({
					selectors: await transformSelectors(levels),
					defaultSelector,
				})

				if (selector.length === 0 || selector.every(s => s.includes(ATOMIC_STYLE_ID_PLACEHOLDER) === false))
					selector.push(defaultSelector)

				result.push({
					selector,
					property: toKebab(k),
					value: normalizeValue(v),
				})
			}
			else if (Array.isArray(v)) {
				for (const styleItem of await transformStyleItems(v)) {
					if (typeof styleItem === 'string')
						continue

					await extract({
						styleDefinition: styleItem,
						levels: [...levels, k],
						result,
						transformSelectors,
						transformStyleItems,
						transformStyleDefinitions,
						defaultSelector,
					})
				}
			}
			else {
				await extract({
					styleDefinition: v,
					levels: [...levels, k],
					result,
					transformSelectors,
					transformStyleItems,
					transformStyleDefinitions,
					defaultSelector,
				})
			}
		}
	}
	return result
}

/**
 * Function signature for the bound extraction function created by `createExtractFn`.
 * @internal
 *
 * @remarks Accepts a single style definition and returns the extracted content list. The plugin transform hooks and default selector are captured in the closure.
 *
 * @example
 * ```ts
 * const extractFn: ExtractFn = createExtractFn({ ... })
 * const contents = await extractFn({ color: 'red' })
 * ```
 */
export type ExtractFn = (styleDefinition: InternalStyleDefinition) => Promise<ExtractedStyleContent[]>

/**
 * Creates a bound extraction function that closes over the default selector and plugin transform hooks.
 * @internal
 *
 * @param options - The extraction options: `defaultSelector`, `transformSelectors`, `transformStyleItems`, and `transformStyleDefinitions`.
 * @returns An `ExtractFn` that accepts a style definition and returns extracted contents.
 *
 * @remarks Called once during engine construction. The returned function is stored as `engine.extract` and used for all subsequent `engine.use()` calls.
 *
 * @example
 * ```ts
 * const extractFn = createExtractFn({
 *   defaultSelector: '.%',
 *   transformSelectors: async s => s,
 *   transformStyleItems: async i => i,
 *   transformStyleDefinitions: async d => d,
 * })
 * ```
 */
export function createExtractFn(options: {
	defaultSelector: string
	transformSelectors: (selectors: string[]) => Promise<string[]>
	transformStyleItems: (styleItems: InternalStyleItem[]) => Promise<InternalStyleItem[]>
	transformStyleDefinitions: (styleDefinitions: InternalStyleDefinition[]) => Promise<InternalStyleDefinition[]>
}): ExtractFn {
	return (styleDefinition: InternalStyleDefinition) => extract({
		styleDefinition,
		...options,
	})
}
