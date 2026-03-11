import type { CSSPropertyData } from './mdn-data-types'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-expect-error - mdn-data doesn't have types, so we import as any and assert types above
import mdnData from 'mdn-data'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = path.resolve(__dirname, '..', 'src', 'internal', 'generated-property-semantics.ts')

const mdnProperties = mdnData.css.properties as Record<string, CSSPropertyData>

type VariableSemanticFamily = 'color' | 'length' | 'time' | 'number' | 'percentage' | 'angle' | 'image' | 'url' | 'position' | 'easing' | 'font-family'

const VARIABLE_SEMANTIC_FAMILIES: readonly VariableSemanticFamily[] = [
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
]

const SAFE_COLOR_PROPERTIES = new Set([
	'accent-color',
	'background-color',
	'border-block-color',
	'border-block-end-color',
	'border-block-start-color',
	'border-bottom-color',
	'border-inline-color',
	'border-inline-end-color',
	'border-inline-start-color',
	'border-left-color',
	'border-right-color',
	'border-top-color',
	'caret-color',
	'color',
	'column-rule-color',
	'flood-color',
	'lighting-color',
	'outline-color',
	'stop-color',
	'stroke-color',
	'text-decoration-color',
	'text-emphasis-color',
])

const SAFE_LENGTH_PROPERTIES = new Set([
	'block-size',
	'border-bottom-width',
	'border-left-width',
	'border-right-width',
	'border-spacing',
	'border-top-width',
	'bottom',
	'font-size',
	'height',
	'inline-size',
	'inset-block-end',
	'inset-block-start',
	'inset-inline-end',
	'inset-inline-start',
	'left',
	'letter-spacing',
	'max-height',
	'max-width',
	'min-height',
	'min-width',
	'outline-offset',
	'right',
	'top',
	'width',
])

const SAFE_TIME_PROPERTIES = new Set([
	'animation-delay',
	'animation-duration',
	'transition-delay',
	'transition-duration',
])

const SAFE_NUMBER_PROPERTIES = new Set([
	'fill-opacity',
	'flex-grow',
	'flex-shrink',
	'flood-opacity',
	'opacity',
	'order',
	'orphans',
	'stop-opacity',
	'stroke-opacity',
	'widows',
])

const SAFE_EASING_PROPERTIES = new Set([
	'animation-timing-function',
	'transition-timing-function',
])

const SAFE_FONT_FAMILY_PROPERTIES = new Set([
	'font-family',
])

function formatStringArray(values: readonly string[]) {
	return `[${values.map(value => `'${value}'`)
		.join(', ')}]`
}

function formatReadonlyStringArrayRecord(record: Record<string, readonly string[]>) {
	return Object.entries(record)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([key, values]) => `\t'${key}': ${formatStringArray(values)},`)
		.join('\n')
}

function shouldIncludeProperty(property: string) {
	if (property === '--*')
		return false
	if (property.startsWith('--'))
		return false
	if (property.startsWith('-'))
		return false
	return true
}

function buildVariableSemanticFamilyProperties() {
	const familyProperties = Object.fromEntries(
		VARIABLE_SEMANTIC_FAMILIES.map(family => [family, [] as string[]]),
	) as Record<VariableSemanticFamily, string[]>

	for (const property of Object.keys(mdnProperties)) {
		if (shouldIncludeProperty(property) === false)
			continue

		if (isSafeColorProperty(property))
			familyProperties.color.push(property)

		if (isSafeLengthProperty(property))
			familyProperties.length.push(property)

		if (isSafeTimeProperty(property))
			familyProperties.time.push(property)

		if (isSafeNumberProperty(property))
			familyProperties.number.push(property)

		if (isSafeEasingProperty(property))
			familyProperties.easing.push(property)

		if (isSafeFontFamilyProperty(property))
			familyProperties['font-family'].push(property)
	}

	for (const family of VARIABLE_SEMANTIC_FAMILIES) {
		familyProperties[family] = [...new Set(familyProperties[family])].sort((left, right) => left.localeCompare(right))
	}

	return familyProperties as Record<VariableSemanticFamily, readonly string[]>
}

function buildVariableSemanticPropertyFamilies(
	familyProperties: Record<VariableSemanticFamily, readonly string[]>,
) {
	const propertyFamilies: Record<string, VariableSemanticFamily[]> = {}

	for (const [family, properties] of Object.entries(familyProperties) as [VariableSemanticFamily, readonly string[]][]) {
		for (const property of properties) {
			propertyFamilies[property] ||= []
			propertyFamilies[property]!.push(family)
		}
	}

	for (const property of Object.keys(propertyFamilies)) {
		propertyFamilies[property] = [...new Set(propertyFamilies[property])].sort((left, right) => left.localeCompare(right))
	}

	return propertyFamilies as Record<string, readonly VariableSemanticFamily[]>
}

function isSafeColorProperty(property: string) {
	return SAFE_COLOR_PROPERTIES.has(property)
}

function isSafeLengthProperty(property: string) {
	return SAFE_LENGTH_PROPERTIES.has(property)
}

function isSafeTimeProperty(property: string) {
	return SAFE_TIME_PROPERTIES.has(property)
}

function isSafeNumberProperty(property: string) {
	return SAFE_NUMBER_PROPERTIES.has(property)
}

function isSafeEasingProperty(property: string) {
	return SAFE_EASING_PROPERTIES.has(property)
}

function isSafeFontFamilyProperty(property: string) {
	return SAFE_FONT_FAMILY_PROPERTIES.has(property)
}

function main() {
	const variableSemanticFamilyProperties = buildVariableSemanticFamilyProperties()
	const variableSemanticPropertyFamilies = buildVariableSemanticPropertyFamilies(variableSemanticFamilyProperties)
	const source = [
		'// This file is auto-generated by packages/core/scripts/generate-property-semantics.ts.',
		'// Do not edit this file manually.',
		'',
		`export const VARIABLE_SEMANTIC_FAMILIES = ${formatStringArray(VARIABLE_SEMANTIC_FAMILIES)} as const`,
		'',
		'export type VariableSemanticFamily = typeof VARIABLE_SEMANTIC_FAMILIES[number]',
		'',
		'export const VARIABLE_SEMANTIC_FAMILY_PROPERTIES = {',
		formatReadonlyStringArrayRecord(variableSemanticFamilyProperties),
		'} as const satisfies Record<VariableSemanticFamily, readonly string[]>',
		'',
		'export const VARIABLE_SEMANTIC_PROPERTY_FAMILIES = {',
		formatReadonlyStringArrayRecord(variableSemanticPropertyFamilies),
		'} as const satisfies Record<string, readonly VariableSemanticFamily[]>',
		'',
	].join('\n')

	fs.writeFileSync(OUTPUT_PATH, source)
	console.log(`Generated semantic metadata at ${OUTPUT_PATH}`)
}

main()
