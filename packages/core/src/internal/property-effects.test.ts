import { describe, expect, it } from 'vitest'
import { PROPERTY_EFFECT_MODES, PROPERTY_EFFECTS } from './generated-shorthand-map'
import { getPropertyEffects, hasPropertyEffectOverlap } from './property-effects'

describe('generated property effects metadata', () => {
	it('should precompute recursive closure for shorthand families', () => {
		expect(PROPERTY_EFFECTS.border)
			.toContain('border-left-width')
		expect(PROPERTY_EFFECTS.grid)
			.toContain('grid-template-columns')
		expect(PROPERTY_EFFECTS.background)
			.toContain('background-position-x')
		expect(PROPERTY_EFFECTS.overflow)
			.toContain('overflow-x')
	})

	it('should keep exact properties as self effects', () => {
		expect(PROPERTY_EFFECTS['padding-left'])
			.toEqual(['padding-left'])
		expect(PROPERTY_EFFECTS.color)
			.toEqual(['color'])
	})

	it('should include reviewable source modes for generated relationships', () => {
		expect(PROPERTY_EFFECT_MODES.border)
			.toBe('shorthand')
		expect(PROPERTY_EFFECT_MODES['border-inline-start'])
			.toBe('patched-shorthand')
		expect(PROPERTY_EFFECT_MODES.overflow)
			.toBe('patched-shorthand')
		expect(PROPERTY_EFFECT_MODES['background-position'])
			.toBe('patched-shorthand')
		expect(PROPERTY_EFFECT_MODES.color)
			.toBe('self')
	})
})

describe('getPropertyEffects', () => {
	it('should expand shorthand properties to leaf effects', () => {
		expect(getPropertyEffects('padding'))
			.toContain('padding-left')
		expect(getPropertyEffects('padding'))
			.toContain('padding-top')
	})

	it('should expand aggregate families recursively', () => {
		expect(getPropertyEffects('border'))
			.toContain('border-left-width')
		expect(getPropertyEffects('grid'))
			.toContain('grid-template-columns')
	})

	it('should treat all as a universal effect', () => {
		expect(getPropertyEffects('all'))
			.toEqual(['*'])
	})

	it('should keep custom properties exact-only', () => {
		expect(getPropertyEffects('--brand-color'))
			.toEqual(['--brand-color'])
	})
})

describe('hasPropertyEffectOverlap', () => {
	it('should detect shorthand to longhand overlap', () => {
		expect(hasPropertyEffectOverlap('padding', 'padding-left'))
			.toBe(true)
	})

	it('should detect shorthand to shorthand overlap through shared leaf effects', () => {
		expect(hasPropertyEffectOverlap('border', 'border-top'))
			.toBe(true)
		expect(hasPropertyEffectOverlap('grid', 'grid-template'))
			.toBe(true)
	})

	it('should detect overlap for patched shorthand families', () => {
		expect(hasPropertyEffectOverlap('background', 'background-position-x'))
			.toBe(true)
		expect(hasPropertyEffectOverlap('overflow', 'overflow-x'))
			.toBe(true)
		expect(hasPropertyEffectOverlap('text-decoration', 'text-decoration-thickness'))
			.toBe(true)
		expect(hasPropertyEffectOverlap('white-space', 'text-wrap-mode'))
			.toBe(true)
	})

	it('should detect universal overlap through all', () => {
		expect(hasPropertyEffectOverlap('all', 'color'))
			.toBe(true)
		expect(hasPropertyEffectOverlap('all', 'background'))
			.toBe(true)
	})

	it('should not overlap unrelated properties', () => {
		expect(hasPropertyEffectOverlap('margin', 'padding-left'))
			.toBe(false)
	})

	it('should not treat custom properties as overlapping standard properties', () => {
		expect(hasPropertyEffectOverlap('--brand-color', 'color'))
			.toBe(false)
	})
})
