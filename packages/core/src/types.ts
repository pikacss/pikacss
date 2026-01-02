import type * as CSS from 'csstype'
import type { FromKebab, GetValue, Nullish, ResolvedAutocomplete, ToKebab, UnionNumber, UnionString } from './internal/types'

export interface CSSVariables { [K: (`--${string}` & {})]: UnionString | UnionNumber }
export interface CSSProperties extends CSS.Properties, CSS.PropertiesHyphen, CSSVariables {}
export type CSSProperty = keyof CSSProperties

type PropertyValue<T> = T | [value: T, fallback: T[]] | Nullish
type Properties_CSS
	= {
		[Key in keyof CSSProperties]?: PropertyValue<
			Exclude<
				| UnionString
				| UnionNumber
				| GetValue<CSSProperties, Key>
				| GetValue<ResolvedAutocomplete['CssPropertiesValue'], ToKebab<Key>>
				| GetValue<ResolvedAutocomplete['CssPropertiesValue'], FromKebab<Key>>
				| GetValue<ResolvedAutocomplete['CssPropertiesValue'], '*'>,
				Nullish
			>
		>
	}
type Properties_ExtraCSS = {
	[Key in keyof ResolvedAutocomplete['ExtraCssProperty']]?: PropertyValue<
		Exclude<
			| UnionString
			| UnionNumber
			| GetValue<CSSProperties, Key & string>
			| GetValue<ResolvedAutocomplete['CssPropertiesValue'], ToKebab<Key & string>>
			| GetValue<ResolvedAutocomplete['CssPropertiesValue'], FromKebab<Key & string>>
			| GetValue<ResolvedAutocomplete['CssPropertiesValue'], '*'>,
			Nullish
		>
	>
}
type Properties_Extra = {
	[Key in keyof ResolvedAutocomplete['ExtraProperty']]?: GetValue<ResolvedAutocomplete['PropertiesValue'], Key & string>
}

export interface Properties extends Properties_CSS, Properties_ExtraCSS, Properties_Extra {}

type CSSPseudos = `${'$'}${CSS.Pseudos}`
type CSSBlockAtRules = Exclude<CSS.AtRules, '@charset' | 'import' | '@namespace'>
export type CSSSelector = CSSBlockAtRules | CSSPseudos
export type Selector = UnionString | ResolvedAutocomplete['Selector'] | CSSSelector

export type StyleDefinition = Properties | {
	[K in Selector]?: Properties | StyleDefinition | StyleItem[]
}

export type StyleItem
	=	| UnionString
		| ResolvedAutocomplete['StyleItemString']
		| StyleDefinition
