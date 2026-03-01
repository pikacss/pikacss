import type * as CSS from './csstype'
import type { FromKebab, GetValue, Nullish, ResolvedAutocomplete, ToKebab, UnionString } from './internal/types'

export interface CSSVariables { [K: (`--${string}` & {})]: UnionString }
export interface CSSProperties extends CSS.Properties, CSS.PropertiesHyphen, CSSVariables {}
export type CSSProperty = keyof CSSProperties

export type PropertyValue<T> = T | [value: T, fallback: T[]] | Nullish

type _CssPropertiesValue = ResolvedAutocomplete['CssPropertiesValue']
type _CssPropertiesValueWildcard = GetValue<_CssPropertiesValue, '*'>

type Properties_CSS_Camel = {
	[Key in keyof CSS.Properties]?: PropertyValue<
		| UnionString
		| GetValue<CSSProperties, Key>
		| GetValue<_CssPropertiesValue, Key>
		| GetValue<_CssPropertiesValue, ToKebab<Key>>
		| _CssPropertiesValueWildcard
	>
}
type Properties_CSS_Hyphen = {
	[Key in keyof CSS.PropertiesHyphen]?: PropertyValue<
		| UnionString
		| GetValue<CSSProperties, Key>
		| GetValue<_CssPropertiesValue, Key>
		| GetValue<_CssPropertiesValue, FromKebab<Key>>
		| _CssPropertiesValueWildcard
	>
}
type Properties_CSS_Vars = {
	[K in `--${string}` & {}]?: PropertyValue<
		| UnionString
		| _CssPropertiesValueWildcard
	>
}
type Properties_ExtraCSS = {
	[Key in ResolvedAutocomplete['ExtraCssProperty']]?: PropertyValue<
		| UnionString
		| GetValue<CSSProperties, Key>
		| GetValue<_CssPropertiesValue, ToKebab<Key>>
		| _CssPropertiesValueWildcard
	>
}
type Properties_Extra = {
	[Key in ResolvedAutocomplete['ExtraProperty']]?: GetValue<ResolvedAutocomplete['PropertiesValue'], Key>
}

export interface Properties extends Properties_CSS_Camel, Properties_CSS_Hyphen, Properties_CSS_Vars, Properties_ExtraCSS, Properties_Extra {}

type CSSPseudos = `${'$'}${CSS.Pseudos}`
type CSSBlockAtRules = Exclude<CSS.AtRules, '@charset' | '@import' | '@namespace'>
export type CSSSelector = CSSBlockAtRules | CSSPseudos
export type Selector = UnionString | ResolvedAutocomplete['Selector'] | CSSSelector

export type StyleDefinitionMap = {
	[K in Selector]?: PropertyValue<UnionString> | Properties | StyleDefinition | StyleItem[] | undefined
}
export type StyleDefinition = Properties | StyleDefinitionMap

export type StyleItem
	=	| UnionString
		| ResolvedAutocomplete['StyleItemString']
		| StyleDefinition
