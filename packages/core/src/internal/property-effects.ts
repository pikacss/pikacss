import { PROPERTY_EFFECTS } from './generated-shorthand-map'

const UNIVERSAL_EFFECT = '*'
const propertyEffectsLookup: Record<string, readonly string[]> = PROPERTY_EFFECTS

function isCustomProperty(property: string) {
	return property.startsWith('--')
}

function isVendorPrefixedProperty(property: string) {
	return property.startsWith('-') && property.startsWith('--') === false
}

/**
 * Returns the list of CSS properties that a given property can affect, accounting for shorthand expansion.
 * @internal
 *
 * @param property - A CSS property name in kebab-case.
 * @returns An array of affected property names. For the `all` shorthand, returns `['*']`. For custom or vendor-prefixed properties, returns the property itself. For standard shorthands, returns the set of longhand properties they expand to.
 *
 * @remarks Used by the order-sensitivity detection logic to determine whether two properties in the same scope share overlapping effects (e.g. `margin` and `margin-top`). The lookup map is generated at build time from the CSS shorthand specification.
 *
 * @example
 * ```ts
 * getPropertyEffects('margin')    // ['margin-top', 'margin-right', 'margin-bottom', 'margin-left']
 * getPropertyEffects('color')     // ['color']
 * getPropertyEffects('--my-var')  // ['--my-var']
 * getPropertyEffects('all')       // ['*']
 * ```
 */
export function getPropertyEffects(property: string): readonly string[] {
	if (property === 'all')
		return [UNIVERSAL_EFFECT]

	if (isCustomProperty(property) || isVendorPrefixedProperty(property))
		return [property]

	return propertyEffectsLookup[property] || [property]
}

/**
 * Determines whether two CSS properties have overlapping effects, meaning they can interfere with each other when both are present in the same selector scope.
 * @internal
 *
 * @param left - First CSS property name in kebab-case.
 * @param right - Second CSS property name in kebab-case.
 * @returns `true` if the two properties share at least one common affected property or if either is the universal `all` shorthand.
 *
 * @remarks Custom properties never overlap with other properties. Identical properties always overlap. This check drives the order-sensitivity detection in `optimizeAtomicStyleContents`, ensuring that shorthand/longhand conflicts like `margin` + `margin-top` are correctly handled.
 *
 * @example
 * ```ts
 * hasPropertyEffectOverlap('margin', 'margin-top')  // true
 * hasPropertyEffectOverlap('color', 'font-size')     // false
 * hasPropertyEffectOverlap('all', 'color')            // true
 * ```
 */
export function hasPropertyEffectOverlap(left: string, right: string): boolean {
	if (left === right)
		return true

	if (isCustomProperty(left) || isCustomProperty(right))
		return false

	const leftEffects = getPropertyEffects(left)
	const rightEffects = getPropertyEffects(right)

	if (leftEffects.includes(UNIVERSAL_EFFECT) || rightEffects.includes(UNIVERSAL_EFFECT))
		return true

	const rightEffectSet = new Set(rightEffects)
	return leftEffects.some(effect => rightEffectSet.has(effect))
}
