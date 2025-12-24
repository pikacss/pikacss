import type { _Autocomplete, EmptyAutocomplete } from './autocomplete'
import type { InternalProperties, InternalStyleDefinition, InternalStyleItem, PikaAugment } from './shared'
import type { ResolveFrom } from './utils'

export type ResolvedAutocomplete = ResolveFrom<PikaAugment, 'Autocomplete', _Autocomplete, EmptyAutocomplete>
export type ResolvedSelector = ResolveFrom<PikaAugment, 'Selector', string, string>
export type ResolvedProperties = ResolveFrom<PikaAugment, 'Properties', any, InternalProperties>
export type ResolvedCSSProperties = Omit<ResolvedProperties, ResolvedAutocomplete['ExtraProperty']>
export type ResolvedStyleDefinition = ResolveFrom<PikaAugment, 'StyleDefinition', any, InternalStyleDefinition>
export type ResolvedStyleItem = ResolveFrom<PikaAugment, 'StyleItem', any, InternalStyleItem>
