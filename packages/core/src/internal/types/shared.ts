import type { Properties, PropertyValue, StyleDefinition, StyleItem } from '../../types'
import type { Nullish } from './utils'

export interface PikaAugment {}

export type InternalPropertyValue = PropertyValue<string | number>

export type InternalProperties = Properties

export type InternalStyleDefinition = StyleDefinition

export type InternalStyleItem = StyleItem

export interface ExtractedStyleContent {
	selector: string[]
	property: string
	value: string[] | Nullish
}

export interface StyleContent {
	selector: string[]
	property: string
	value: string[]
}

export interface AtomicStyle {
	id: string
	content: StyleContent
}

export interface CSSStyleBlockBody {
	properties: { property: string, value: string }[]
	children?: CSSStyleBlocks
}

export type CSSStyleBlocks = Map<string, CSSStyleBlockBody>
