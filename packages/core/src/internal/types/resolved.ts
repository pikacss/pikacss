import type { _Autocomplete, EmptyAutocomplete } from './autocomplete'
import type { PikaAugment, Properties, StyleDefinition, StyleItem } from './shared'
import type { ResolveFrom } from './utils'

export type ResolvedAutocomplete = ResolveFrom<PikaAugment, 'Autocomplete', _Autocomplete, EmptyAutocomplete>
export type ResolvedSelector = ResolveFrom<PikaAugment, 'Selector', string, string>
export type ResolvedProperties = ResolveFrom<PikaAugment, 'Properties', any, Properties>
export type ResolvedCSSProperties = Omit<ResolvedProperties, ResolvedAutocomplete['ExtraProperty']>
export type ResolvedStyleDefinition = ResolveFrom<PikaAugment, 'StyleDefinition', any, StyleDefinition>
export type ResolvedStyleItem = ResolveFrom<PikaAugment, 'StyleItem', any, StyleItem>
