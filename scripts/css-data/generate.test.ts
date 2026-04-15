import type { ProcessedCssData, ProcessedCssSource, ProcessedCssSourceKind, ProcessedCssSourceName } from './types'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { buildProcessedAtRule, buildProcessedSelector, generateAndWriteProcessedCssData, generateProcessedCssData, MANUAL_PROPERTY_PATCHES, MANUAL_SHORTHAND_LONGHANDS, MANUAL_SYNTAX_PATCHES, resolvePropertyGroupsFromValues, resolvePropertyMdnUrlFromValues, resolvePropertyStatusFromValue } from './generate'
import { collectAtRulesFromProcessedData, generateCssTypeOutput, getBaselineStatus } from './generate-csstype'
import { generatePropertyEffectsOutput } from './generate-property-effects'
import { loadProcessedCssData } from './index'

const VALID_SOURCE_KINDS = new Set<ProcessedCssSourceKind>(['default', 'derived', 'extracted', 'manual'])
const VALID_SOURCE_NAMES = new Set<ProcessedCssSourceName>(['@mdn/browser-compat-data', '@webref/css', 'generated-fallback', 'manual', 'mdn-data', 'web-features'])

function expectValidSource(source: ProcessedCssSource) {
	expect(VALID_SOURCE_KINDS.has(source.kind))
		.toBe(true)
	expect(VALID_SOURCE_NAMES.has(source.source))
		.toBe(true)

	switch (source.kind) {
		case 'manual':
			expect(source.source)
				.toBe('manual')
			expect(source.via)
				.toBeUndefined()
			expect(typeof source.note)
				.toBe('string')
			break
		case 'default':
			expect(source.source)
				.toBe('generated-fallback')
			expect(source.via)
				.toBeUndefined()
			expect(typeof source.note)
				.toBe('string')
			break
		case 'derived':
			expect(source.source)
				.not.toBe('manual')
			expect(source.source)
				.not.toBe('generated-fallback')
			expect(typeof source.note)
				.toBe('string')
			if (source.via != null) {
				expect(VALID_SOURCE_NAMES.has(source.via))
					.toBe(true)
			}
			break
		case 'extracted':
			expect(source.source)
				.not.toBe('manual')
			expect(source.source)
				.not.toBe('generated-fallback')
			expect(source.via)
				.toBeUndefined()
			break
	}
}

describe('generateProcessedCssData', () => {
	let processedCssData: ProcessedCssData

	beforeAll(async () => {
		processedCssData = await generateProcessedCssData()
	}, 30_000)

	it('annotates every generated bucket with provenance metadata', () => {
		for (const syntax of Object.values(processedCssData.syntaxes)) {
			expectValidSource(syntax.source)
		}

		for (const atRule of Object.values(processedCssData.atRules)) {
			expectValidSource(atRule.source)
			expectValidSource(atRule.kindSource)
		}

		for (const selector of Object.values(processedCssData.selectors)) {
			expect(selector.presenceSources.length)
				.toBeGreaterThan(0)
			for (const source of selector.presenceSources) {
				expectValidSource(source)
			}
			if (selector.syntax != null) {
				expect(selector.syntaxSource)
					.toBeDefined()
			}
			if (selector.syntaxSource != null) {
				expectValidSource(selector.syntaxSource)
			}
		}

		for (const property of Object.values(processedCssData.properties)) {
			expectValidSource(property.syntaxSource)
			expectValidSource(property.initialSource)
			expectValidSource(property.inheritedSource)
			expectValidSource(property.groupsSource)
			if (property.mdnUrlSource != null) {
				expectValidSource(property.mdnUrlSource)
			}
			if (property.statusSource != null) {
				expectValidSource(property.statusSource)
			}
			if (property.shorthand != null) {
				expectValidSource(property.shorthand.longhandsSource)
				expectValidSource(property.shorthand.resetLonghandsSource)
			}
			if (property.compatibility != null) {
				expectValidSource(property.compatibility.experimentalSource)
				expectValidSource(property.compatibility.deprecatedSource)
				expectValidSource(property.compatibility.baseline.source)
			}
		}
	})

	it('applies manual property patches as overrides with manual provenance', () => {
		for (const [name, patch] of Object.entries(MANUAL_PROPERTY_PATCHES)) {
			const property = processedCssData.properties[name]
			expect(property, `Missing manual property patch target ${name}`)
				.toBeDefined()
			expect(property?.syntax)
				.toBe(patch.syntax)
			expect(property?.syntaxSource.kind)
				.toBe('manual')
			expect(property?.initial)
				.toEqual(patch.initial)
			expect(property?.initialSource.kind)
				.toBe('manual')
			expect(property?.inherited)
				.toBe(patch.inherited)
			expect(property?.inheritedSource.kind)
				.toBe('manual')
		}
	})

	it('marks manual syntax patches as manual provenance', () => {
		for (const [name, syntax] of Object.entries(MANUAL_SYNTAX_PATCHES)) {
			const generatedSyntax = processedCssData.syntaxes[name]
			expect(generatedSyntax?.syntax)
				.toBe(syntax)
			expect(generatedSyntax?.source.kind)
				.toBe('manual')
			expect(generatedSyntax?.source.source)
				.toBe('manual')
		}
	})

	it('marks manual shorthand longhands as manual provenance', () => {
		for (const [name, longhands] of Object.entries(MANUAL_SHORTHAND_LONGHANDS)) {
			const shorthand = processedCssData.properties[name]?.shorthand
			expect(shorthand)
				.toBeDefined()
			expect(shorthand?.longhands)
				.toEqual([...longhands].sort((left, right) => left.localeCompare(right)))
			expect(shorthand?.longhandsSource.kind)
				.toBe('manual')
			expect(shorthand?.longhandsSource.source)
				.toBe('manual')
		}
	})

	it('keeps shorthand references resolvable to known properties', () => {
		for (const [name, property] of Object.entries(processedCssData.properties)) {
			if (property.shorthand == null)
				continue

			for (const longhand of [...property.shorthand.longhands, ...property.shorthand.resetLonghands]) {
				expect(processedCssData.properties[longhand], `${name} references missing property ${longhand}`)
					.toBeDefined()
			}
		}
	})

	it('uses webref selector syntax as a fallback when mdn-data has no syntax', () => {
		const selector = buildProcessedSelector('::fixture', undefined, undefined, {
			name: '::fixture',
			syntax: '::fixture( <selector> )',
		})

		expect(selector.syntax)
			.toBe('::fixture( <selector> )')
		expect(selector.syntaxSource?.kind)
			.toBe('extracted')
		expect(selector.syntaxSource?.source)
			.toBe('@webref/css')
	})

	it('treats empty mdn selector syntax as missing and falls back to webref syntax', () => {
		const selector = buildProcessedSelector('::fixture', { syntax: '' }, undefined, {
			name: '::fixture',
			syntax: '::fixture( <selector> )',
		})

		expect(selector.syntax)
			.toBe('::fixture( <selector> )')
		expect(selector.syntaxSource?.source)
			.toBe('@webref/css')
	})

	it('stays in sync with the checked-in generated css-data artifact', () => {
		expect(loadProcessedCssData())
			.toEqual(processedCssData)
	})

	it('keeps checked-in core generated outputs in sync with their generators', () => {
		expect(fs.readFileSync(path.resolve(process.cwd(), 'packages/core/src/generated/csstype.ts'), 'utf8'))
			.toBe(generateCssTypeOutput())
		expect(fs.readFileSync(path.resolve(process.cwd(), 'packages/core/src/generated/property-effects.ts'), 'utf8'))
			.toBe(generatePropertyEffectsOutput())
	})

	it('locks key provenance sentinel cases', () => {
		expect(processedCssData.properties['-moz-float-edge']?.compatibility?.baseline.source)
			.toMatchObject({
				kind: 'default',
				source: 'generated-fallback',
			})

		expect(processedCssData.properties['baseline-shift'])
			.toMatchObject({
				mdnUrlSource: {
					source: '@mdn/browser-compat-data',
				},
				compatibility: {
					baseline: {
						featureId: 'baseline-shift',
						source: {
							kind: 'derived',
							source: 'web-features',
							via: '@mdn/browser-compat-data',
						},
					},
				},
			})
		expect(processedCssData.properties['baseline-shift']?.mdnUrl)
			.toContain('baseline-shift')

		expect(processedCssData.properties['-moz-outline-radius']?.shorthand?.longhandsSource)
			.toMatchObject({
				kind: 'derived',
				source: 'mdn-data',
			})

		expect(processedCssData.selectors['::clear-icon'])
			.toMatchObject({
				syntax: '::clear-icon',
				syntaxSource: {
					source: '@webref/css',
				},
			})

		expect(processedCssData.atRules['@-webkit-keyframes'])
			.toMatchObject({
				kind: 'nested',
			})

		const collectedAtRules = collectAtRulesFromProcessedData(processedCssData.atRules)
		expect(collectedAtRules.nested)
			.toContain('@-webkit-keyframes')
		expect(collectedAtRules.regular)
			.not.toContain('@-webkit-keyframes')
		expect(collectedAtRules.nested)
			.toContain('@layer')
		expect(collectedAtRules.regular)
			.toContain('@layer')
	})

	it('prefers mdn-data metadata over fallbacks and uses deterministic defaults otherwise', () => {
		expect(resolvePropertyMdnUrlFromValues('https://example.com/mdn', 'https://example.com/bcd'))
			.toMatchObject({
				value: 'https://example.com/mdn',
				source: {
					source: 'mdn-data',
				},
			})
		expect(resolvePropertyMdnUrlFromValues(undefined, 'https://example.com/bcd'))
			.toMatchObject({
				value: 'https://example.com/bcd',
				source: {
					source: '@mdn/browser-compat-data',
				},
			})
		expect(resolvePropertyStatusFromValue('standard'))
			.toMatchObject({
				value: 'standard',
				source: {
					source: 'mdn-data',
				},
			})
		expect(resolvePropertyGroupsFromValues(['Layout', 'Animation']))
			.toMatchObject({
				value: ['Animation', 'Layout'],
				source: {
					source: 'mdn-data',
				},
			})
		expect(resolvePropertyGroupsFromValues(undefined))
			.toMatchObject({
				value: [],
				source: {
					kind: 'default',
					source: 'generated-fallback',
				},
			})
	})

	it('treats null baseline as unknown instead of a negative compatibility claim', () => {
		expect(getBaselineStatus({
			experimental: false,
			deprecated: false,
			experimentalSource: {
				kind: 'extracted',
				source: '@mdn/browser-compat-data',
			},
			deprecatedSource: {
				kind: 'extracted',
				source: '@mdn/browser-compat-data',
			},
			baseline: {
				level: null,
				source: {
					kind: 'default',
					source: 'generated-fallback',
					note: 'No baseline mapping available.',
				},
			},
		}))
			.toBe('')
	})

	it('prefers mdn at-rule syntax and falls back to webref when needed', () => {
		expect(buildProcessedAtRule('@fixture', { syntax: '@fixture mdn' }, { name: '@fixture', syntax: '@fixture webref' }))
			.toMatchObject({
				syntax: '@fixture mdn',
				source: {
					source: 'mdn-data',
				},
				kind: 'regular',
				kindSource: {
					source: 'mdn-data',
				},
			})
		expect(buildProcessedAtRule('@fixture', undefined, { name: '@fixture', syntax: '@fixture webref' }))
			.toMatchObject({
				syntax: '@fixture webref',
				source: {
					source: '@webref/css',
				},
				kind: 'regular',
				kindSource: {
					source: '@webref/css',
				},
			})
	})

	it('treats empty mdn at-rule syntax as missing and falls back to webref', () => {
		expect(buildProcessedAtRule('@fixture', { syntax: '' }, { name: '@fixture', syntax: '@fixture webref' }))
			.toMatchObject({
				syntax: '@fixture webref',
				source: {
					source: '@webref/css',
				},
			})
	})

	it('treats empty webref at-rule syntax as missing and falls back to default provenance', () => {
		expect(buildProcessedAtRule('@fixture', undefined, { name: '@fixture', syntax: '' }))
			.toMatchObject({
				syntax: '',
				source: {
					kind: 'default',
					source: 'generated-fallback',
				},
				kind: 'unknown',
				kindSource: {
					kind: 'default',
					source: 'generated-fallback',
				},
			})
	})

	it('derives nested at-rule kind from canonical aliases when syntax is missing', () => {
		expect(processedCssData.atRules['@-webkit-keyframes'])
			.toMatchObject({
				kind: 'nested',
				kindSource: {
					kind: 'derived',
				},
			})
	})

	it('can generate and write processed css data to an explicit output path', async () => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pikacss-css-data-'))
		const outputPath = path.join(tempDir, 'generated-css-data.json')

		try {
			const generatedData = await generateAndWriteProcessedCssData(outputPath)
			expect(fs.existsSync(outputPath))
				.toBe(true)
			expect(loadProcessedCssData(outputPath))
				.toEqual(generatedData)
		}
		finally {
			fs.rmSync(tempDir, { recursive: true, force: true })
		}
	})

	it('marks resolved baseline data as derived from web-features when feature ids exist', () => {
		const propertiesWithDerivedBaseline = Object.values(processedCssData.properties)
			.filter(property => property.compatibility?.baseline.source.kind === 'derived')

		expect(propertiesWithDerivedBaseline.length)
			.toBeGreaterThan(0)

		for (const property of propertiesWithDerivedBaseline) {
			expect(property.compatibility?.baseline.source.kind)
				.toBe('derived')
			expect(property.compatibility?.baseline.source.source)
				.toBe('web-features')
			expect(property.compatibility?.baseline.source.via)
				.toBe('@mdn/browser-compat-data')
		}

		for (const property of Object.values(processedCssData.properties)) {
			if (property.compatibility?.baseline.featureId == null)
				continue
			expect(['default', 'derived'])
				.toContain(property.compatibility.baseline.source.kind)
		}
	})
})
