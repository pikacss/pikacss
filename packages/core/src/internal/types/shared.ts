import type { Nullish } from './utils'

export interface PikaAugment {}

export type InternalPropertyValue = string | number | [value: string | number, fallback: (string | number)[]] | Nullish

export type InternalProperties = Record<string, InternalPropertyValue>

export interface InternalStyleDefinition {
	[K: string]: InternalPropertyValue | InternalStyleDefinition | InternalStyleItem[]
}

export type InternalStyleItem = string | InternalStyleDefinition

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
