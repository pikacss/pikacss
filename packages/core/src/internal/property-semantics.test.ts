import { describe, expect, it } from 'vitest'
import { VARIABLE_SEMANTIC_FAMILIES, VARIABLE_SEMANTIC_FAMILY_PROPERTIES, VARIABLE_SEMANTIC_PROPERTY_FAMILIES } from './generated-property-semantics'

describe('generated property semantics metadata', () => {
	it('should expose the built-in semantic family list', () => {
		expect(VARIABLE_SEMANTIC_FAMILIES)
			.toEqual([
				'color',
				'length',
				'time',
				'number',
				'percentage',
				'angle',
				'image',
				'url',
				'position',
				'easing',
				'font-family',
			])
	})

	it('should map implemented semantic families to stable property sets', () => {
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES.color)
			.toContain('background-color')
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES.length)
			.toContain('width')
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES.time)
			.toContain('transition-duration')
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES.number)
			.toContain('opacity')
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES.easing)
			.toContain('transition-timing-function')
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES['font-family'])
			.toEqual(['font-family'])
	})

	it('should keep deferred semantic families empty in the first pass', () => {
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES.percentage)
			.toEqual([])
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES.angle)
			.toEqual([])
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES.image)
			.toEqual([])
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES.url)
			.toEqual([])
		expect(VARIABLE_SEMANTIC_FAMILY_PROPERTIES.position)
			.toEqual([])
	})

	it('should provide reverse property lookup for implemented families', () => {
		expect(VARIABLE_SEMANTIC_PROPERTY_FAMILIES['background-color'])
			.toEqual(['color'])
		expect(VARIABLE_SEMANTIC_PROPERTY_FAMILIES.width)
			.toEqual(['length'])
		expect(VARIABLE_SEMANTIC_PROPERTY_FAMILIES['transition-duration'])
			.toEqual(['time'])
	})
})
