import type {
	ProcessedCssAtRule,
	ProcessedCssAtRuleKind,
	ProcessedCssBaselineLevel,
	ProcessedCssCompatibility,
	ProcessedCssData,
	ProcessedCssProperty,
	ProcessedCssSelector,
	ProcessedCssShorthand,
	ProcessedCssSource,
	ProcessedCssSourceName,
	ProcessedCssSyntax,
} from './types'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import bcd from '@mdn/browser-compat-data'
// @ts-expect-error - mdn-data doesn't have types, so we import as any and assert a minimal shape below
import mdnData from 'mdn-data'
import { features as webFeatures } from 'web-features'
import { PROCESSED_CSS_DATA_PATH, writeProcessedCssData } from './index'

interface MdnPropertyData {
	syntax: string
	initial: string | string[]
	inherited: boolean
	mdn_url?: string
	status?: string
	groups?: string[]
	computed?: string | string[]
}

interface MdnSyntaxData {
	syntax: string
}

interface MdnAtRuleData {
	syntax: string
}

interface MdnSelectorData {
	syntax?: string
}

interface WebrefCssProperty {
	name: string
	syntax?: string
	initial?: string
	inherited?: string
	longhands?: string[]
	resetLonghands?: string[]
}

interface WebrefCssType {
	name: string
	syntax?: string
}

interface WebrefCssAtRule {
	name: string
	syntax?: string
}

interface WebrefCssSelector {
	name: string
	syntax?: string
}

interface WebrefCssIndex {
	properties: Record<string, WebrefCssProperty>
	types: Record<string, WebrefCssType>
	atrules: Record<string, WebrefCssAtRule>
	selectors: Record<string, WebrefCssSelector>
}

const mdnProperties = mdnData.css.properties as Record<string, MdnPropertyData>
const mdnSyntaxes = mdnData.css.syntaxes as Record<string, MdnSyntaxData>
const mdnAtRules = mdnData.css.atRules as Record<string, MdnAtRuleData>
const mdnSelectors = mdnData.css.selectors as Record<string, MdnSelectorData>
const RE_AT_RULE_VENDOR_PREFIX = /^@-(webkit|moz|ms|o)-/

type ExtractedCssSource = Exclude<ProcessedCssSourceName, 'manual' | 'generated-fallback'>

interface SourcedValue<T> {
	value: T
	source: ProcessedCssSource
}

function createSource(kind: ProcessedCssSource['kind'], source: ProcessedCssSourceName, note?: string, via?: ProcessedCssSourceName): ProcessedCssSource {
	return {
		kind,
		source,
		...(via ? { via } : {}),
		...(note ? { note } : {}),
	}
}

function extractedSource(source: ExtractedCssSource, note?: string): ProcessedCssSource {
	return createSource('extracted', source, note)
}

function manualSource(note: string): ProcessedCssSource {
	return createSource('manual', 'manual', note)
}

function derivedSource(source: ExtractedCssSource, note: string, via?: ProcessedCssSourceName): ProcessedCssSource {
	return createSource('derived', source, note, via)
}

function defaultSource(note: string): ProcessedCssSource {
	return createSource('default', 'generated-fallback', note)
}

export const MANUAL_SYNTAX_PATCHES: Record<string, string> = {
	'hex-color': '<string>',
	'reversed-counter-name': '<string>',
	'dashed-ident': '<string>',
	'unicode-range-token': '<string>',
	'declaration-value': '<string>',
	'autospace': 'no-autospace | [ ideograph-alpha || ideograph-numeric || punctuation ] || [ insert | replace ]',
	'content-list': '[ <string> | <image> | <attr()> | <quote> | <counter> ]+',
	'paint': 'none | child | child(<integer>) | <color> | <url> [ none | <color> ]? | context-fill | context-stroke',
	'dasharray': '[ <length> | <percentage> | <number> ]#',
}

export const MANUAL_PROPERTY_PATCHES: Record<string, Pick<ProcessedCssProperty, 'syntax' | 'initial' | 'inherited'>> = {
	'alignment-baseline': {
		syntax: 'auto | baseline | before-edge | text-before-edge | middle | central | after-edge | text-after-edge | ideographic | alphabetic | hanging | mathematical',
		initial: 'see property description',
		inherited: false,
	},
	'baseline-shift': {
		syntax: 'baseline | sub | super | <percentage> | <length>',
		initial: 'baseline',
		inherited: false,
	},
	'clip-rule': {
		syntax: 'nonzero | evenodd',
		initial: 'nonzero',
		inherited: true,
	},
	'color-interpolation': {
		syntax: 'auto | sRGB | linearRGB',
		initial: 'sRGB',
		inherited: true,
	},
	'color-rendering': {
		syntax: 'auto | optimizeSpeed | optimizeQuality',
		initial: 'auto',
		inherited: true,
	},
	'dominant-baseline': {
		syntax: 'auto | use-script | no-change | reset-size | ideographic | alphabetic | hanging | mathematical | central | middle | text-after-edge | text-before-edge',
		initial: 'auto',
		inherited: false,
	},
	'fill': {
		syntax: '<paint>',
		initial: 'black',
		inherited: true,
	},
	'fill-opacity': {
		syntax: '<number>',
		initial: '1',
		inherited: true,
	},
	'fill-rule': {
		syntax: 'nonzero | evenodd',
		initial: 'nonzero',
		inherited: true,
	},
	'flood-color': {
		syntax: 'currentColor | <color>',
		initial: 'black',
		inherited: false,
	},
	'flood-opacity': {
		syntax: '<number>',
		initial: '1',
		inherited: false,
	},
	'glyph-orientation-vertical': {
		syntax: 'auto | <angle> | <number>',
		initial: 'auto',
		inherited: true,
	},
	'lighting-color': {
		syntax: 'currentColor | <color>',
		initial: 'white',
		inherited: false,
	},
	'marker': {
		syntax: 'none | <url>',
		initial: 'none',
		inherited: true,
	},
	'marker-end': {
		syntax: 'none | <url>',
		initial: 'none',
		inherited: true,
	},
	'marker-mid': {
		syntax: 'none | <url>',
		initial: 'none',
		inherited: true,
	},
	'marker-start': {
		syntax: 'none | <url>',
		initial: 'none',
		inherited: true,
	},
	'shape-rendering': {
		syntax: 'auto | optimizeSpeed | crispEdges | geometricPrecision',
		initial: 'auto',
		inherited: true,
	},
	'stop-color': {
		syntax: 'currentColor | <color>',
		initial: 'black',
		inherited: false,
	},
	'stop-opacity': {
		syntax: '<number>',
		initial: '1',
		inherited: false,
	},
	'stroke': {
		syntax: '<paint>',
		initial: 'none',
		inherited: true,
	},
	'stroke-dasharray': {
		syntax: 'none | <dasharray>',
		initial: 'none',
		inherited: true,
	},
	'stroke-dashoffset': {
		syntax: '<percentage> | <length>',
		initial: '0',
		inherited: true,
	},
	'stroke-linecap': {
		syntax: 'butt | round | square',
		initial: 'butt',
		inherited: true,
	},
	'stroke-linejoin': {
		syntax: 'miter | round | bevel',
		initial: 'miter',
		inherited: true,
	},
	'stroke-miterlimit': {
		syntax: '<number>',
		initial: '4',
		inherited: true,
	},
	'stroke-opacity': {
		syntax: '<number>',
		initial: '1',
		inherited: true,
	},
	'stroke-width': {
		syntax: '<percentage> | <length>',
		initial: '1',
		inherited: true,
	},
	'text-anchor': {
		syntax: 'start | middle | end',
		initial: 'start',
		inherited: true,
	},
	'vector-effect': {
		syntax: 'non-scaling-stroke | none',
		initial: 'none',
		inherited: false,
	},
}

export const MANUAL_SHORTHAND_LONGHANDS: Record<string, string[]> = {
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

export async function loadWebrefCssIndex(): Promise<WebrefCssIndex> {
	// @ts-expect-error - @webref/css does not ship declarations
	const imported = await import('@webref/css')
	const webrefCss = (imported.default ?? imported) as { index: () => Promise<WebrefCssIndex> }
	return webrefCss.index()
}

function sortEntries<T>(record: Record<string, T>): Record<string, T> {
	return Object.fromEntries(
		Object.entries(record)
			.sort(([left], [right]) => left.localeCompare(right)),
	) as Record<string, T>
}

function uniqueSorted(values: readonly string[]): string[] {
	return [...new Set(values)]
		.sort((left, right) => left.localeCompare(right))
}

function toStringArray(value: unknown): string[] {
	if (!Array.isArray(value))
		return []
	return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function normalizeInitial(value: string | string[] | undefined): string | string[] {
	if (Array.isArray(value))
		return toStringArray(value)
	return typeof value === 'string' ? value : ''
}

function normalizeInherited(value: boolean | string | undefined): boolean | undefined {
	if (typeof value === 'boolean')
		return value
	if (value === 'yes')
		return true
	if (value === 'no')
		return false
	return undefined
}

function getMdnShorthandFallback(property: MdnPropertyData | undefined): string[] {
	if (!property)
		return []

	if (Array.isArray(property.initial))
		return toStringArray(property.initial)

	if (Array.isArray(property.computed))
		return toStringArray(property.computed)

	return []
}

function getBcdProperty(name: string): any {
	return (bcd.css as any)?.properties?.[name]
}

function buildCompatibility(name: string): ProcessedCssCompatibility | undefined {
	const compatData = getBcdProperty(name)?.__compat
	if (!compatData)
		return undefined

	const tags: string[] = compatData.tags || []
	const wfTag = tags.find((tag: string) => tag.startsWith('web-features:'))
	const compatSource = extractedSource('@mdn/browser-compat-data')
	const baseline: ProcessedCssCompatibility['baseline'] = wfTag == null
		? {
				level: null,
				source: defaultSource('No web-features tag found in browser-compat-data.'),
			}
		: {
				level: null,
				featureId: wfTag.replace('web-features:', ''),
				source: defaultSource(`Missing web-features entry for ${wfTag.replace('web-features:', '')}.`),
			}

	if (wfTag) {
		const featureId = wfTag.replace('web-features:', '')
		const feature = (webFeatures as Record<string, any>)[featureId]
		if (feature?.kind === 'feature') {
			const compatKey = `css.properties.${name}`
			const status = feature.status.by_compat_key?.[compatKey] ?? feature.status
			baseline.level = (status?.baseline ?? null) as ProcessedCssBaselineLevel
			baseline.featureId = featureId
			baseline.source = derivedSource('web-features', `Resolved baseline from web-features feature ${featureId}.`, '@mdn/browser-compat-data')
			if (status?.baseline_low_date)
				baseline.baselineLowDate = status.baseline_low_date
			if (status?.baseline_high_date)
				baseline.baselineHighDate = status.baseline_high_date
		}
	}

	return {
		experimental: compatData.status?.experimental === true,
		deprecated: compatData.status?.deprecated === true,
		experimentalSource: compatSource,
		deprecatedSource: compatSource,
		baseline,
	}
}

function buildShorthand(name: string, property: MdnPropertyData | undefined, webrefProperty: WebrefCssProperty | undefined): ProcessedCssShorthand | undefined {
	const manualLonghands = MANUAL_SHORTHAND_LONGHANDS[name]
	const webrefLonghands = toStringArray(webrefProperty?.longhands)
	const resetLonghands = toStringArray(webrefProperty?.resetLonghands)
	const fallbackLonghands = getMdnShorthandFallback(property)
	const longhands = manualLonghands ?? (webrefLonghands.length > 0 ? webrefLonghands : fallbackLonghands)

	if (longhands.length === 0 && resetLonghands.length === 0)
		return undefined

	return {
		mode: manualLonghands ? 'patched-shorthand' : 'shorthand',
		longhands: uniqueSorted(longhands),
		resetLonghands: uniqueSorted(resetLonghands),
		longhandsSource: manualLonghands != null
			? manualSource(`Longhands patched in MANUAL_SHORTHAND_LONGHANDS for ${name}.`)
			: webrefLonghands.length > 0
				? extractedSource('@webref/css')
				: derivedSource('mdn-data', `Longhands derived from mdn-data fallback fields for ${name}.`),
		resetLonghandsSource: resetLonghands.length > 0
			? extractedSource('@webref/css')
			: defaultSource(`No resetLonghands available for ${name}.`),
	}
}

function resolvePropertySyntax(mdnProperty: MdnPropertyData | undefined, webrefProperty: WebrefCssProperty | undefined, manualProperty: Pick<ProcessedCssProperty, 'syntax'> | undefined): SourcedValue<string> | undefined {
	if (typeof manualProperty?.syntax === 'string' && manualProperty.syntax.length > 0) {
		return { value: manualProperty.syntax, source: manualSource('Syntax patched in MANUAL_PROPERTY_PATCHES.') }
	}

	if (typeof mdnProperty?.syntax === 'string' && mdnProperty.syntax.length > 0) {
		return { value: mdnProperty.syntax, source: extractedSource('mdn-data') }
	}

	if (typeof webrefProperty?.syntax === 'string' && webrefProperty.syntax.length > 0) {
		return { value: webrefProperty.syntax, source: extractedSource('@webref/css') }
	}

	return undefined
}

function resolvePropertyInitial(mdnProperty: MdnPropertyData | undefined, webrefProperty: WebrefCssProperty | undefined, manualProperty: Pick<ProcessedCssProperty, 'initial'> | undefined): SourcedValue<string | string[]> {
	if (manualProperty?.initial != null) {
		return { value: normalizeInitial(manualProperty.initial), source: manualSource('Initial value patched in MANUAL_PROPERTY_PATCHES.') }
	}

	if (mdnProperty != null) {
		return { value: mdnProperty.initial, source: extractedSource('mdn-data') }
	}

	if (webrefProperty?.initial != null) {
		return { value: normalizeInitial(webrefProperty.initial), source: extractedSource('@webref/css') }
	}

	return { value: '', source: defaultSource('No initial value available from upstream sources.') }
}

function resolvePropertyInherited(mdnProperty: MdnPropertyData | undefined, webrefProperty: WebrefCssProperty | undefined, manualProperty: Pick<ProcessedCssProperty, 'inherited'> | undefined): SourcedValue<boolean> {
	const manualInherited = normalizeInherited(manualProperty?.inherited)
	if (manualInherited != null) {
		return { value: manualInherited, source: manualSource('Inherited flag patched in MANUAL_PROPERTY_PATCHES.') }
	}

	if (typeof mdnProperty?.inherited === 'boolean') {
		return { value: mdnProperty.inherited, source: extractedSource('mdn-data') }
	}

	const webrefInherited = normalizeInherited(webrefProperty?.inherited)
	if (webrefInherited != null) {
		return { value: webrefInherited, source: extractedSource('@webref/css') }
	}

	return { value: false, source: defaultSource('Inherited flag defaulted to false because upstream data omitted it.') }
}

export function resolvePropertyMdnUrlFromValues(mdnUrl: string | undefined, bcdUrl: string | undefined): SourcedValue<string> | undefined {
	if (typeof mdnUrl === 'string' && mdnUrl.length > 0) {
		return { value: mdnUrl, source: extractedSource('mdn-data') }
	}

	if (typeof bcdUrl === 'string' && bcdUrl.length > 0) {
		return { value: bcdUrl, source: extractedSource('@mdn/browser-compat-data') }
	}

	return undefined
}

function resolvePropertyMdnUrl(mdnProperty: MdnPropertyData | undefined, name: string): SourcedValue<string> | undefined {
	return resolvePropertyMdnUrlFromValues(mdnProperty?.mdn_url, getBcdProperty(name)?.__compat?.mdn_url)
}

export function resolvePropertyStatusFromValue(status: string | undefined): SourcedValue<string> | undefined {
	if (typeof status === 'string' && status.length > 0) {
		return { value: status, source: extractedSource('mdn-data') }
	}

	return undefined
}

function resolvePropertyStatus(mdnProperty: MdnPropertyData | undefined): SourcedValue<string> | undefined {
	return resolvePropertyStatusFromValue(mdnProperty?.status)
}

export function resolvePropertyGroupsFromValues(groups: string[] | undefined): SourcedValue<string[]> {
	if (groups != null) {
		return { value: uniqueSorted(groups), source: extractedSource('mdn-data') }
	}

	return { value: [], source: defaultSource('No groups available in mdn-data.') }
}

function resolvePropertyGroups(mdnProperty: MdnPropertyData | undefined): SourcedValue<string[]> {
	return resolvePropertyGroupsFromValues(mdnProperty?.groups)
}

function buildProcessedProperties(webrefProperties: Record<string, WebrefCssProperty>): Record<string, ProcessedCssProperty> {
	const propertyNames = new Set<string>([
		...Object.keys(mdnProperties),
		...Object.keys(webrefProperties),
		...Object.keys(MANUAL_PROPERTY_PATCHES),
	])
	const properties: Record<string, ProcessedCssProperty> = {}

	for (const name of propertyNames) {
		if (name === '--*')
			continue

		const mdnProperty = mdnProperties[name]
		const webrefProperty = webrefProperties[name]
		const manualProperty = MANUAL_PROPERTY_PATCHES[name]
		const syntax = resolvePropertySyntax(mdnProperty, webrefProperty, manualProperty)
		if (syntax == null)
			continue

		const initial = resolvePropertyInitial(mdnProperty, webrefProperty, manualProperty)
		const inherited = resolvePropertyInherited(mdnProperty, webrefProperty, manualProperty)
		const mdnUrl = resolvePropertyMdnUrl(mdnProperty, name)
		const status = resolvePropertyStatus(mdnProperty)
		const groups = resolvePropertyGroups(mdnProperty)

		const shorthand = buildShorthand(name, mdnProperty, webrefProperty)
		const compatibility = buildCompatibility(name)

		properties[name] = {
			syntax: syntax.value,
			syntaxSource: syntax.source,
			initial: initial.value,
			initialSource: initial.source,
			inherited: inherited.value,
			inheritedSource: inherited.source,
			groups: groups.value,
			groupsSource: groups.source,
			...(mdnUrl ? { mdnUrl: mdnUrl.value, mdnUrlSource: mdnUrl.source } : {}),
			...(status ? { status: status.value, statusSource: status.source } : {}),
			...(shorthand ? { shorthand } : {}),
			...(compatibility ? { compatibility } : {}),
		}
	}

	return sortEntries(properties)
}

function buildProcessedSyntaxes(webrefTypes: Record<string, WebrefCssType>): Record<string, ProcessedCssSyntax> {
	const syntaxes: Record<string, ProcessedCssSyntax> = {}

	for (const [name, data] of Object.entries(mdnSyntaxes)) {
		if (typeof data.syntax === 'string' && data.syntax.length > 0)
			syntaxes[name] = { syntax: data.syntax, source: extractedSource('mdn-data') }
	}

	for (const [key, data] of Object.entries(webrefTypes)) {
		if (key !== data.name)
			continue
		if (typeof data.syntax !== 'string' || data.syntax.length === 0)
			continue
		syntaxes[data.name] ??= { syntax: data.syntax, source: extractedSource('@webref/css') }
	}

	for (const [name, syntax] of Object.entries(MANUAL_SYNTAX_PATCHES)) {
		syntaxes[name] = {
			syntax,
			source: manualSource(`Syntax patched in MANUAL_SYNTAX_PATCHES for ${name}.`),
		}
	}

	return sortEntries(syntaxes)
}

function inferAtRuleKindFromSyntax(syntax: string | undefined): Exclude<ProcessedCssAtRuleKind, 'unknown'> | undefined {
	if (typeof syntax !== 'string' || syntax.length === 0)
		return undefined

	return syntax.includes(' {\n') && syntax.includes('\n}')
		? 'nested'
		: 'regular'
}

function getCanonicalAtRuleName(name: string): string | undefined {
	const canonicalName = name.replace(RE_AT_RULE_VENDOR_PREFIX, '@')
	return canonicalName === name ? undefined : canonicalName
}

function resolveAtRuleKind(
	name: string,
	mdnSyntax: string | undefined,
	webrefSyntax: string | undefined,
	canonicalSyntax: string | undefined,
	canonicalSource: ExtractedCssSource | undefined,
): SourcedValue<ProcessedCssAtRuleKind> {
	const mdnKind = inferAtRuleKindFromSyntax(mdnSyntax)
	if (mdnKind != null) {
		return { value: mdnKind, source: extractedSource('mdn-data') }
	}

	const webrefKind = inferAtRuleKindFromSyntax(webrefSyntax)
	if (webrefKind != null) {
		return { value: webrefKind, source: extractedSource('@webref/css') }
	}

	const canonicalKind = inferAtRuleKindFromSyntax(canonicalSyntax)
	if (canonicalKind != null && canonicalSource != null) {
		return {
			value: canonicalKind,
			source: derivedSource(canonicalSource, `At-rule kind derived from canonical rule ${getCanonicalAtRuleName(name)}.`),
		}
	}

	return {
		value: 'unknown',
		source: defaultSource(`No at-rule kind available for ${name}.`),
	}
}

function buildProcessedAtRuleWithCanonical(
	name: string,
	mdnAtRule: MdnAtRuleData | undefined,
	webrefAtRule: WebrefCssAtRule | undefined,
	canonicalAtRule?: { syntax?: string },
	canonicalSource?: ExtractedCssSource,
): ProcessedCssAtRule {
	const mdnSyntax = mdnAtRule?.syntax
	const webrefSyntax = webrefAtRule?.syntax
	const hasMdnSyntax = typeof mdnSyntax === 'string' && mdnSyntax.length > 0
	const hasWebrefSyntax = typeof webrefSyntax === 'string' && webrefSyntax.length > 0
	const kind = resolveAtRuleKind(name, mdnSyntax, webrefSyntax, canonicalAtRule?.syntax, canonicalSource)

	return hasMdnSyntax
		? { syntax: mdnSyntax, source: extractedSource('mdn-data'), kind: kind.value, kindSource: kind.source }
		: hasWebrefSyntax
			? { syntax: webrefSyntax, source: extractedSource('@webref/css'), kind: kind.value, kindSource: kind.source }
			: {
					syntax: '',
					source: defaultSource(`No syntax available for at-rule ${name}.`),
					kind: kind.value,
					kindSource: kind.source,
				}
}

export function buildProcessedAtRule(name: string, mdnAtRule: MdnAtRuleData | undefined, webrefAtRule: WebrefCssAtRule | undefined): ProcessedCssAtRule {
	return buildProcessedAtRuleWithCanonical(name, mdnAtRule, webrefAtRule)
}

function buildProcessedAtRules(webrefAtRules: Record<string, WebrefCssAtRule>): Record<string, ProcessedCssAtRule> {
	const atRuleNames = new Set<string>([
		...Object.keys(mdnAtRules),
		...Object.keys(webrefAtRules),
	])
	const atRules: Record<string, ProcessedCssAtRule> = {}

	for (const name of atRuleNames) {
		if (!name.startsWith('@'))
			continue

		const canonicalName = getCanonicalAtRuleName(name)
		const canonicalMdnAtRule = canonicalName ? mdnAtRules[canonicalName] : undefined
		const canonicalWebrefAtRule = canonicalName ? webrefAtRules[canonicalName] : undefined
		const canonicalAtRule = canonicalMdnAtRule ?? canonicalWebrefAtRule
		const canonicalSource = canonicalMdnAtRule != null
			? 'mdn-data'
			: canonicalWebrefAtRule != null
				? '@webref/css'
				: undefined

		atRules[name] = buildProcessedAtRuleWithCanonical(name, mdnAtRules[name], webrefAtRules[name], canonicalAtRule, canonicalSource)
	}

	return sortEntries(atRules)
}

export function buildProcessedSelector(name: string, mdnSelector: MdnSelectorData | undefined, bcdSelector: unknown, webrefSelector: WebrefCssSelector | undefined): ProcessedCssSelector {
	const presenceSources: ProcessedCssSource[] = []
	const mdnSyntax = mdnSelector?.syntax
	const webrefSyntax = webrefSelector?.syntax
	const hasMdnSyntax = typeof mdnSyntax === 'string' && mdnSyntax.length > 0

	if (mdnSelector != null)
		presenceSources.push(extractedSource('mdn-data'))
	if (bcdSelector != null)
		presenceSources.push(extractedSource('@mdn/browser-compat-data'))
	if (webrefSelector != null)
		presenceSources.push(extractedSource('@webref/css'))

	return {
		presenceSources,
		...(hasMdnSyntax ? { syntax: mdnSyntax, syntaxSource: extractedSource('mdn-data') } : {}),
		...(!hasMdnSyntax && typeof webrefSyntax === 'string' && webrefSyntax.length > 0
			? { syntax: webrefSyntax, syntaxSource: extractedSource('@webref/css') }
			: {}),
	}
}

function buildProcessedSelectors(webrefSelectors: Record<string, WebrefCssSelector>): Record<string, ProcessedCssSelector> {
	const selectorNames = new Set<string>([
		...Object.keys(mdnSelectors),
		...Object.keys((bcd.css as any)?.selectors ?? {}),
		...Object.keys(webrefSelectors),
	])
	const selectors: Record<string, ProcessedCssSelector> = {}
	const bcdSelectors = (bcd.css as any)?.selectors ?? {}

	for (const name of selectorNames) {
		selectors[name] = buildProcessedSelector(name, mdnSelectors[name], bcdSelectors[name], webrefSelectors[name])
	}

	return sortEntries(selectors)
}

export async function generateProcessedCssData(): Promise<ProcessedCssData> {
	const webrefCss = await loadWebrefCssIndex()
	return {
		properties: buildProcessedProperties(webrefCss.properties),
		syntaxes: buildProcessedSyntaxes(webrefCss.types),
		atRules: buildProcessedAtRules(webrefCss.atrules),
		selectors: buildProcessedSelectors(webrefCss.selectors),
	}
}

export async function generateAndWriteProcessedCssData(outputPath = PROCESSED_CSS_DATA_PATH): Promise<ProcessedCssData> {
	const processedCssData = await generateProcessedCssData()
	writeProcessedCssData(processedCssData, outputPath)
	return processedCssData
}

async function main() {
	const processedCssData = await generateAndWriteProcessedCssData()

	console.log(
		[
			`Generated processed CSS data at ${PROCESSED_CSS_DATA_PATH}`,
			`- properties: ${Object.keys(processedCssData.properties).length}`,
			`- syntaxes: ${Object.keys(processedCssData.syntaxes).length}`,
			`- at-rules: ${Object.keys(processedCssData.atRules).length}`,
			`- selectors: ${Object.keys(processedCssData.selectors).length}`,
		].join('\n'),
	)
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href) {
	void main()
}
