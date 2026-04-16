export type ProcessedCssSourceKind = 'extracted' | 'manual' | 'derived' | 'default'

export type ProcessedCssSourceName = 'mdn-data' | '@webref/css' | '@mdn/browser-compat-data' | 'web-features' | 'manual' | 'generated-fallback'

export interface ProcessedCssSource {
	kind: ProcessedCssSourceKind
	source: ProcessedCssSourceName
	via?: ProcessedCssSourceName
	note?: string
}

export type ProcessedCssPropertyEffectMode = 'self' | 'shorthand' | 'patched-shorthand'

export type ProcessedCssAtRuleKind = 'regular' | 'nested' | 'unknown'

export type ProcessedCssBaselineLevel = 'high' | 'low' | false | null

export interface ProcessedCssBaselineStatus {
	level: ProcessedCssBaselineLevel
	featureId?: string
	baselineLowDate?: string
	baselineHighDate?: string
	source: ProcessedCssSource
}

export interface ProcessedCssCompatibility {
	experimental: boolean
	deprecated: boolean
	experimentalSource: ProcessedCssSource
	deprecatedSource: ProcessedCssSource
	baseline: ProcessedCssBaselineStatus
}

export interface ProcessedCssShorthand {
	mode: Exclude<ProcessedCssPropertyEffectMode, 'self'>
	longhands: string[]
	resetLonghands: string[]
	longhandsSource: ProcessedCssSource
	resetLonghandsSource: ProcessedCssSource
}

export interface ProcessedCssSourcePresence {
	webref: boolean
	mdnData: boolean
	bcd: boolean
	webFeatures: boolean
}

export interface ProcessedCssProperty {
	sourcePresence: ProcessedCssSourcePresence
	syntax: string
	syntaxSource: ProcessedCssSource
	initial: string | string[]
	initialSource: ProcessedCssSource
	inherited: boolean
	inheritedSource: ProcessedCssSource
	mdnUrl?: string
	mdnUrlSource?: ProcessedCssSource
	status?: string
	statusSource?: ProcessedCssSource
	groups: string[]
	groupsSource: ProcessedCssSource
	shorthand?: ProcessedCssShorthand
	compatibility?: ProcessedCssCompatibility
}

export interface ProcessedCssSyntax {
	syntax: string
	source: ProcessedCssSource
}

export interface ProcessedCssAtRule {
	syntax: string
	source: ProcessedCssSource
	kind: ProcessedCssAtRuleKind
	kindSource: ProcessedCssSource
}

export interface ProcessedCssSelector {
	syntax?: string
	syntaxSource?: ProcessedCssSource
	presenceSources: ProcessedCssSource[]
}

export interface ProcessedCssData {
	properties: Record<string, ProcessedCssProperty>
	syntaxes: Record<string, ProcessedCssSyntax>
	atRules: Record<string, ProcessedCssAtRule>
	selectors: Record<string, ProcessedCssSelector>
}
