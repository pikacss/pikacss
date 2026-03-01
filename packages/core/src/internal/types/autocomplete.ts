import type { Arrayable, UnionString } from './utils'

export interface AutocompleteConfig {
	selectors?: string[]
	styleItemStrings?: string[]
	extraProperties?: string[]
	extraCssProperties?: string[]
	properties?: [property: string, tsType: Arrayable<string>][]
	cssProperties?: [property: string, value: Arrayable<string>][]
}

export interface ResolvedAutocompleteConfig {
	selectors: Set<string>
	styleItemStrings: Set<string>
	extraProperties: Set<string>
	extraCssProperties: Set<string>
	properties: Map<string, string[]>
	cssProperties: Map<string, string[]>
}

export interface _Autocomplete {
	Selector: UnionString
	StyleItemString: UnionString
	ExtraProperty: UnionString
	ExtraCssProperty: UnionString
	Layer: UnionString
	PropertiesValue: Record<string, unknown>
	CssPropertiesValue: Record<string, UnionString>
}

export type DefineAutocomplete<A extends _Autocomplete> = A

export type EmptyAutocomplete = DefineAutocomplete<{
	Selector: never
	StyleItemString: never
	ExtraProperty: never
	ExtraCssProperty: never
	Layer: never
	PropertiesValue: never
	CssPropertiesValue: never
}>
