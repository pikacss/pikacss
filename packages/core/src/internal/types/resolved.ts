import type { _Autocomplete, AutocompleteKeys, EmptyAutocomplete } from './autocomplete'
import type { InternalProperties, InternalStyleDefinition, InternalStyleItem, PikaAugment } from './shared'
import type { IsNever, ResolveFrom, UnionString } from './utils'

export type ResolvedAutocomplete = ResolveFrom<PikaAugment, 'Autocomplete', _Autocomplete, EmptyAutocomplete>
export type ResolvedAutocompletePropertyValue = ResolvedAutocomplete['PropertyValue']
export type ResolvedAutocompleteCSSPropertyValue = ResolvedAutocomplete['CSSPropertyValue']
export type ResolvedExtraProperty = AutocompleteKeys<ResolvedAutocompletePropertyValue>
export type ResolvedExtraCSSProperty = AutocompleteKeys<ResolvedAutocompleteCSSPropertyValue>
export type ResolvedLayerName = IsNever<ResolvedAutocomplete['Layer']> extends true ? UnionString : ResolvedAutocomplete['Layer']
export type ResolvedSelector = ResolveFrom<PikaAugment, 'Selector', string, string>
export type ResolvedProperties = ResolveFrom<PikaAugment, 'Properties', any, InternalProperties>
export type ResolvedCSSProperties = Omit<ResolvedProperties, ResolvedExtraProperty>
export type ResolvedStyleDefinition = ResolveFrom<PikaAugment, 'StyleDefinition', any, InternalStyleDefinition>
export type ResolvedStyleItem = ResolveFrom<PikaAugment, 'StyleItem', any, InternalStyleItem>
