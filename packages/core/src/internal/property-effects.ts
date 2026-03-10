import { PROPERTY_EFFECTS } from './generated-shorthand-map'

const UNIVERSAL_EFFECT = '*'
const propertyEffectsLookup: Record<string, readonly string[]> = PROPERTY_EFFECTS

function isCustomProperty(property: string) {
	return property.startsWith('--')
}

function isVendorPrefixedProperty(property: string) {
	return property.startsWith('-') && property.startsWith('--') === false
}

export function getPropertyEffects(property: string): readonly string[] {
	if (property === 'all')
		return [UNIVERSAL_EFFECT]

	if (isCustomProperty(property) || isVendorPrefixedProperty(property))
		return [property]

	return propertyEffectsLookup[property] || [property]
}

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
