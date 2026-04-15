import { describe, expect, it } from 'vitest'

import { getPropertyEffects, hasPropertyEffectOverlap } from './property-effects'

describe('getPropertyEffects', () => {
	it('returns special handling for universal, custom, vendor-prefixed, and unknown properties', () => {
		expect(getPropertyEffects('all'))
			.toEqual(['*'])
		expect(getPropertyEffects('--token'))
			.toEqual(['--token'])
		expect(getPropertyEffects('-webkit-line-clamp'))
			.toEqual(['-webkit-line-clamp'])
		expect(getPropertyEffects('made-up-property'))
			.toEqual(['made-up-property'])
	})
})

describe('hasPropertyEffectOverlap', () => {
	it('detects identity, shorthand, universal, and disjoint overlaps correctly', () => {
		expect(hasPropertyEffectOverlap('color', 'color'))
			.toBe(true)
		expect(hasPropertyEffectOverlap('padding', 'padding-top'))
			.toBe(true)
		expect(hasPropertyEffectOverlap('all', 'margin'))
			.toBe(true)
		expect(hasPropertyEffectOverlap('--token', '--other-token'))
			.toBe(false)
		expect(hasPropertyEffectOverlap('-webkit-line-clamp', 'line-clamp'))
			.toBe(false)
		expect(hasPropertyEffectOverlap('color', 'margin'))
			.toBe(false)
	})
})
