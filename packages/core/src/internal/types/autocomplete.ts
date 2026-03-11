import type { Arrayable, UnionString } from './utils'

export type AutocompleteKeys<T> = [T] extends [never] ? never : Extract<keyof T, string>

export interface AutocompletePatternsConfig {
	selectors?: Arrayable<string>
	styleItemStrings?: Arrayable<string>
	properties?: Record<string, Arrayable<string>>
	cssProperties?: Record<string, Arrayable<string>>
}

export interface AutocompleteContribution {
	selectors?: Arrayable<string>
	styleItemStrings?: Arrayable<string>
	extraProperties?: Arrayable<string>
	extraCssProperties?: Arrayable<string>
	properties?: Record<string, Arrayable<string>>
	cssProperties?: Record<string, Arrayable<string>>
	patterns?: AutocompletePatternsConfig
}

export interface AutocompleteConfig {
	selectors?: Arrayable<string>
	styleItemStrings?: Arrayable<string>
	extraProperties?: Arrayable<string>
	extraCssProperties?: Arrayable<string>
	properties?: [property: string, tsType: Arrayable<string>][] | Record<string, Arrayable<string>>
	cssProperties?: [property: string, value: Arrayable<string>][] | Record<string, Arrayable<string>>
	patterns?: AutocompletePatternsConfig
}

export interface ResolvedAutocompletePatternsConfig {
	selectors: Set<string>
	styleItemStrings: Set<string>
	properties: Map<string, string[]>
	cssProperties: Map<string, string[]>
}

export interface ResolvedAutocompleteConfig {
	selectors: Set<string>
	styleItemStrings: Set<string>
	extraProperties: Set<string>
	extraCssProperties: Set<string>
	properties: Map<string, string[]>
	cssProperties: Map<string, string[]>
	patterns: ResolvedAutocompletePatternsConfig
}

export interface _Autocomplete {
	Selector: UnionString
	StyleItemString: UnionString
	Layer: UnionString
	PropertyValue: Record<string, unknown>
	CSSPropertyValue: Record<string, UnionString>
}

export type DefineAutocomplete<A extends _Autocomplete> = A

export type EmptyAutocomplete = DefineAutocomplete<{
	Selector: never
	StyleItemString: never
	Layer: never
	PropertyValue: never
	CSSPropertyValue: never
}>
