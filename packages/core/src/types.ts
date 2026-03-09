import type * as CSS from './csstype'
import type { FromKebab, GetValue, Nullish, ResolvedAutocomplete, ResolvedAutocompleteCSSPropertyValue, ResolvedAutocompletePropertyValue, ResolvedExtraCSSProperty, ResolvedExtraProperty, ToKebab, UnionString } from './internal/types'

export interface CSSVariables { [K: (`--${string}` & {})]: UnionString }
export interface CSSProperties extends CSS.Properties, CSS.PropertiesHyphen, CSSVariables {}
export type CSSProperty = Extract<keyof CSSProperties, string>

export type PropertyValue<T> = T | [value: T, fallback: T[]] | Nullish

type _CssPropertiesValue = ResolvedAutocompleteCSSPropertyValue
type _CssPropertiesValueWildcard = GetValue<_CssPropertiesValue, '*'>
type CSSPropertyInputValue<Key extends string, RelatedKey extends string = Key> = PropertyValue<
	| UnionString
	| GetValue<CSSProperties, Key>
	| GetValue<_CssPropertiesValue, RelatedKey>
	| _CssPropertiesValueWildcard
>

type Properties_CSS_Camel = {
	[Key in keyof CSS.Properties]?: CSSPropertyInputValue<Key, Key | ToKebab<Key>>
}
type Properties_CSS_Hyphen = {
	[Key in keyof CSS.PropertiesHyphen]?: CSSPropertyInputValue<Key, Key | FromKebab<Key>>
}
type Properties_CSS_Vars = {
	[K in `--${string}` & {}]?: PropertyValue<
		| UnionString
		| _CssPropertiesValueWildcard
	>
}
type Properties_ExtraCSS = {
	[Key in ResolvedExtraCSSProperty]?: CSSPropertyInputValue<Key, Key | ToKebab<Key> | FromKebab<Key>>
}
type Properties_Extra = {
	[Key in ResolvedExtraProperty]?: GetValue<ResolvedAutocompletePropertyValue, Key>
}

export interface Properties extends Properties_CSS_Camel, Properties_CSS_Hyphen, Properties_CSS_Vars, Properties_ExtraCSS, Properties_Extra {}

type CSSPseudos = `${'$'}${CSS.Pseudos}`
export type CSSSelector = CSS.AtRules.Nested | CSSPseudos
export type Selector = UnionString | ResolvedAutocomplete['Selector'] | CSSSelector

export type StyleDefinitionMap = {
	[K in Selector]?: PropertyValue<UnionString> | Properties | StyleDefinition | StyleItem[] | undefined
}
export type StyleDefinition = Properties | StyleDefinitionMap

export type StyleItem
	=	| UnionString
		| ResolvedAutocomplete['StyleItemString']
		| StyleDefinition
