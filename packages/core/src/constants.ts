import { transformOutsideQuotes } from './utils'

/**
 * CSS `@layer` at-rule prefix used when constructing layer-scoped selectors
 * in generated stylesheet output.
 *
 * @internal
 */
const LAYER_SELECTOR_PREFIX = '@layer '
/**
 * Default prefix prepended to generated atomic CSS class names (e.g. `pk-abc123`).
 *
 * Overridden at engine level via {@link EngineConfig.prefix}.
 *
 * @internal
 */
const DEFAULT_ATOMIC_STYLE_ID_PREFIX = 'pk-'
/**
 * Placeholder character in selector templates that is replaced with the
 * computed atomic style ID during CSS generation.
 *
 * @see {@link ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL} for the global-match regex.
 *
 * @internal
 */
const ATOMIC_STYLE_ID_PLACEHOLDER = '%'
/**
 * Global regex matching all occurrences of {@link ATOMIC_STYLE_ID_PLACEHOLDER}
 * for batch replacement in selector templates.
 *
 * A `%` directly preceded by a digit is treated as a literal percentage
 * (e.g. `@supports (width: 50%)`), not a placeholder.
 *
 * @internal
 */
const ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL = /(?<!\d)%/g

/**
 * Tests whether a selector string contains the atomic style ID placeholder.
 *
 * Uses the same digit-protection rule as {@link ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL}:
 * `%` preceded by a digit is a literal percentage, not a placeholder.
 * A `%` inside single- or double-quoted content (e.g. an attribute value)
 * is never treated as a placeholder.
 *
 * @internal
 */
function hasAtomicStyleIdPlaceholder(selector: string): boolean {
	let found = false
	transformOutsideQuotes(selector, (segment) => {
		if (found === false) {
			ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL.lastIndex = 0
			found = ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL.test(segment)
		}
		return segment
	})
	return found
}

/**
 * Replaces every atomic style ID placeholder in a selector string with the given atomic style ID.
 *
 * Applies the same rules as {@link hasAtomicStyleIdPlaceholder}: a `%` directly
 * preceded by a digit is a literal percentage, and quoted content is never rewritten.
 *
 * @internal
 */
function replaceAtomicStyleIdPlaceholder(selector: string, atomicStyleId: string): string {
	return transformOutsideQuotes(
		selector,
		segment => segment.replace(ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL, () => atomicStyleId),
	)
}

export {
	ATOMIC_STYLE_ID_PLACEHOLDER,
	ATOMIC_STYLE_ID_PLACEHOLDER_RE_GLOBAL,
	DEFAULT_ATOMIC_STYLE_ID_PREFIX,
	hasAtomicStyleIdPlaceholder,
	LAYER_SELECTOR_PREFIX,
	replaceAtomicStyleIdPlaceholder,
}
