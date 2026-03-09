import type { Arrayable, UnionString } from './utils'

export type AutocompleteKeys<T> = [T] extends [never] ? never : Extract<keyof T, string>

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
