import type { CSSPropertyData } from './mdn-data-types'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
// @ts-expect-error - mdn-data doesn't have types, so we import as any and assert types above
import mdnData from 'mdn-data'
import path from 'pathe'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = path.resolve(__dirname, '..', 'src', 'internal', 'generated-shorthand-map.ts')

const mdnProperties = mdnData.css.properties as Record<string, CSSPropertyData>

const OVERRIDES: Record<string, string[]> = {
	'background-position': ['background-position-x', 'background-position-y'],
	'border-block-color': ['border-block-end-color', 'border-block-start-color'],
	'border-block-end': ['border-block-end-color', 'border-block-end-style', 'border-block-end-width'],
	'border-block-style': ['border-block-end-style', 'border-block-start-style'],
	'border-block-start': ['border-block-start-color', 'border-block-start-style', 'border-block-start-width'],
	'border-block-width': ['border-block-end-width', 'border-block-start-width'],
	'border-inline-color': ['border-inline-end-color', 'border-inline-start-color'],
	'border-inline-end': ['border-inline-end-color', 'border-inline-end-style', 'border-inline-end-width'],
	'border-inline-style': ['border-inline-end-style', 'border-inline-start-style'],
	'border-inline-start': ['border-inline-start-color', 'border-inline-start-style', 'border-inline-start-width'],
	'border-inline-width': ['border-inline-end-width', 'border-inline-start-width'],
	'font-synthesis': ['font-synthesis-position', 'font-synthesis-small-caps', 'font-synthesis-style', 'font-synthesis-weight'],
	'font-variant': ['font-variant-alternates', 'font-variant-caps', 'font-variant-east-asian', 'font-variant-emoji', 'font-variant-ligatures', 'font-variant-numeric', 'font-variant-position'],
	'overflow': ['overflow-x', 'overflow-y'],
	'overscroll-behavior': ['overscroll-behavior-x', 'overscroll-behavior-y'],
	'text-box': ['text-box-edge', 'text-box-trim'],
	'text-decoration': ['text-decoration-color', 'text-decoration-line', 'text-decoration-style', 'text-decoration-thickness'],
	'text-wrap': ['text-wrap-mode', 'text-wrap-style'],
	'white-space': ['text-wrap-mode', 'white-space-collapse'],
}

type PropertyEffectMode = 'self' | 'shorthand' | 'patched-shorthand'

function shouldIncludeProperty(property: string, longhands: string[]) {
	if (property === '--*')
		return false
	if (property.startsWith('--'))
		return false
	if (property.startsWith('-'))
		return false
	if (longhands.length === 0)
		return false
	return longhands.every(longhand => typeof longhand === 'string' && longhand.length > 0)
}

function formatObjectRecord(record: Record<string, string[]>) {
	return Object.entries(record)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([property, longhands]) => {
			const formattedLonghands = longhands
				.map(longhand => `'${longhand}'`)
				.join(', ')
			return `\t'${property}': [${formattedLonghands}],`
		})
		.join('\n')
}

function formatStringRecord(record: Record<string, string>) {
	return Object.entries(record)
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([property, value]) => `\t'${property}': '${value}',`)
		.join('\n')
}

function buildShorthandMap() {
	const shorthandMap: Record<string, string[]> = {}

	for (const [property, data] of Object.entries(mdnProperties)) {
		const longhands = OVERRIDES[property] || (Array.isArray(data.initial)
			? data.initial.filter((value): value is string => typeof value === 'string')
			: [])

		if (!shouldIncludeProperty(property, longhands))
			continue

		shorthandMap[property] = [...new Set(longhands)].sort((left, right) => left.localeCompare(right))
	}

	return shorthandMap
}

function buildPropertyEffects(shorthandMap: Record<string, string[]>) {
	const effectCache = new Map<string, string[]>()

	function expand(property: string, stack = new Set<string>()): string[] {
		const cached = effectCache.get(property)
		if (cached != null)
			return cached

		const longhands = shorthandMap[property]
		if (longhands == null) {
			const effects = [property]
			effectCache.set(property, effects)
			return effects
		}

		if (stack.has(property))
			return longhands

		const nextStack = new Set(stack)
		nextStack.add(property)

		const effectSet = new Set<string>()
		for (const longhand of longhands) {
			for (const effect of expand(longhand, nextStack)) {
				effectSet.add(effect)
			}
		}
		const effects = [...effectSet]

		effectCache.set(property, effects)
		return effects
	}

	const effects: Record<string, string[]> = {}
	for (const property of Object.keys(mdnProperties)) {
		if (property === '--*' || property.startsWith('--') || property.startsWith('-'))
			continue
		effects[property] = expand(property)
	}

	return effects
}

function buildPropertyEffectModes(shorthandMap: Record<string, string[]>) {
	const modes: Record<string, PropertyEffectMode> = {}
	for (const property of Object.keys(mdnProperties)) {
		if (property === '--*' || property.startsWith('--') || property.startsWith('-'))
			continue

		if (OVERRIDES[property] != null) {
			modes[property] = 'patched-shorthand'
			continue
		}

		if (shorthandMap[property] != null) {
			modes[property] = 'shorthand'
			continue
		}

		modes[property] = 'self'
	}

	return modes
}

function main() {
	const shorthandMap = buildShorthandMap()
	const propertyEffects = buildPropertyEffects(shorthandMap)
	const propertyEffectModes = buildPropertyEffectModes(shorthandMap)
	const source = [
		'// This file is auto-generated by packages/core/scripts/generate-property-effects.ts.',
		'// Do not edit this file manually.',
		'',
		'export type PropertyEffectMode = \'self\' | \'shorthand\' | \'patched-shorthand\'',
		'',
		'export const PROPERTY_EFFECTS = {',
		formatObjectRecord(propertyEffects),
		'} as const satisfies Record<string, readonly string[]>',
		'',
		'export const PROPERTY_EFFECT_MODES = {',
		formatStringRecord(propertyEffectModes),
		'} as const satisfies Record<string, PropertyEffectMode>',
		'',
	].join('\n')

	fs.writeFileSync(OUTPUT_PATH, source)
	console.log(`Generated ${Object.keys(shorthandMap).length} shorthand relationships at ${OUTPUT_PATH}`)
}

main()
