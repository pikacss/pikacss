import type { ExtractedStyleContent, StyleContent } from './types'
import { describe, expect, it } from 'vitest'
import { getAtomicStyleId, optimizeAtomicStyleContents } from './atomic-style'

function withLayerSelector(layer: string, ...selector: string[]) {
	return [`@layer ${layer}`, ...selector]
}

// ─── getAtomicStyleId ────────────────────────────────────────────────────────

describe('getAtomicStyleId', () => {
	it('should generate an id from content hash', () => {
		const stored = new Map<string, string>()
		const content: StyleContent = {
			selector: ['.%'],
			property: 'color',
			value: ['red'],
		}
		const id = getAtomicStyleId({ content, prefix: '', stored })
		expect(typeof id)
			.toBe('string')
		expect(id.length)
			.toBeGreaterThan(0)
	})

	it('should cache and return the same id for the same content', () => {
		const stored = new Map<string, string>()
		const content: StyleContent = {
			selector: ['.%'],
			property: 'color',
			value: ['red'],
		}
		const id1 = getAtomicStyleId({ content, prefix: '', stored })
		const id2 = getAtomicStyleId({ content, prefix: '', stored })
		expect(id1)
			.toBe(id2)
		expect(stored.size)
			.toBe(1)
	})

	it('should generate different ids for different content', () => {
		const stored = new Map<string, string>()
		const c1: StyleContent = { selector: ['.%'], property: 'color', value: ['red'] }
		const c2: StyleContent = { selector: ['.%'], property: 'color', value: ['blue'] }
		const id1 = getAtomicStyleId({ content: c1, prefix: '', stored })
		const id2 = getAtomicStyleId({ content: c2, prefix: '', stored })
		expect(id1).not.toBe(id2)
	})

	it('should prepend prefix to the id', () => {
		const stored = new Map<string, string>()
		const content: StyleContent = { selector: ['.%'], property: 'color', value: ['red'] }
		const id = getAtomicStyleId({ content, prefix: 'pk-', stored })
		expect(id.startsWith('pk-'))
			.toBe(true)
	})

	it('should generate incremental names based on stored size', () => {
		const stored = new Map<string, string>()
		const ids: string[] = []
		for (let i = 0; i < 5; i++) {
			const content: StyleContent = {
				selector: ['.%'],
				property: 'color',
				value: [`val${i}`],
			}
			ids.push(getAtomicStyleId({ content, prefix: '', stored }))
		}
		expect(new Set(ids).size)
			.toBe(5)
		expect(ids[0])
			.toBe('a')
	})

	it('should differentiate by selector', () => {
		const stored = new Map<string, string>()
		const c1: StyleContent = { selector: ['.%'], property: 'color', value: ['red'] }
		const c2: StyleContent = { selector: ['&:hover', '.%'], property: 'color', value: ['red'] }
		const id1 = getAtomicStyleId({ content: c1, prefix: '', stored })
		const id2 = getAtomicStyleId({ content: c2, prefix: '', stored })
		expect(id1).not.toBe(id2)
	})

	it('should differentiate by layer', () => {
		const stored = new Map<string, string>()
		const c1: StyleContent = { selector: withLayerSelector('a', '.%'), property: 'color', value: ['red'] }
		const c2: StyleContent = { selector: withLayerSelector('b', '.%'), property: 'color', value: ['red'] }
		const c3: StyleContent = { selector: ['.%'], property: 'color', value: ['red'] }
		const id1 = getAtomicStyleId({ content: c1, prefix: '', stored })
		const id2 = getAtomicStyleId({ content: c2, prefix: '', stored })
		const id3 = getAtomicStyleId({ content: c3, prefix: '', stored })
		expect(id1).not.toBe(id2)
		expect(id1).not.toBe(id3)
		expect(id2).not.toBe(id3)
	})

	it('should always generate a fresh id for order-sensitive content', () => {
		const stored = new Map<string, string>()
		const content: StyleContent = {
			selector: ['.%'],
			property: 'padding-left',
			value: ['8px'],
			orderSensitiveTo: ['dependency'],
		}
		const id1 = getAtomicStyleId({ content, prefix: '', stored })
		const id2 = getAtomicStyleId({ content, prefix: '', stored })
		expect(id1).not.toBe(id2)
		expect(stored.size)
			.toBe(2)
	})
})

// ─── optimizeAtomicStyleContents ─────────────────────────────────────────────

describe('optimizeAtomicStyleContents', () => {
	it('should keep unique selector+property combinations', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'color', value: ['red'] },
			{ selector: ['.%'], property: 'font-size', value: ['16px'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(2)
	})

	it('should let later entries override earlier ones for same selector+property', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'color', value: ['red'] },
			{ selector: ['.%'], property: 'color', value: ['blue'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(1)
		expect(result[0]!.value)
			.toEqual(['blue'])
	})

	it('should remove entry when null value is used', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'color', value: ['red'] },
			{ selector: ['.%'], property: 'color', value: null },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(0)
	})

	it('should remove entry when undefined value is used', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'color', value: ['red'] },
			{ selector: ['.%'], property: 'color', value: undefined },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(0)
	})

	it('should treat different selectors as separate entries', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'color', value: ['red'] },
			{ selector: ['&:hover', '.%'], property: 'color', value: ['blue'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(2)
	})

	it('should handle empty list', () => {
		const result = optimizeAtomicStyleContents([])
		expect(result)
			.toEqual([])
	})

	it('should handle complex override then re-add scenario', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'color', value: ['red'] },
			{ selector: ['.%'], property: 'color', value: null },
			{ selector: ['.%'], property: 'color', value: ['green'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(1)
		expect(result[0]!.value)
			.toEqual(['green'])
	})

	it('should preserve order based on last occurrence', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'color', value: ['red'] },
			{ selector: ['.%'], property: 'font-size', value: ['14px'] },
			{ selector: ['.%'], property: 'color', value: ['blue'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(2)
		expect(result[0]!.property)
			.toBe('font-size')
		expect(result[1]!.property)
			.toBe('color')
	})

	it('should treat same selector+property with different layers as separate entries', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: withLayerSelector('a', '.%'), property: 'color', value: ['red'] },
			{ selector: withLayerSelector('b', '.%'), property: 'color', value: ['blue'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(2)
	})

	it('should override entry with same selector+property+layer', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: withLayerSelector('a', '.%'), property: 'color', value: ['red'] },
			{ selector: withLayerSelector('a', '.%'), property: 'color', value: ['blue'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(1)
		expect(result[0]!.value)
			.toEqual(['blue'])
	})

	it('should treat entry without layer and entry with layer as separate entries for same selector+property', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'color', value: ['red'] },
			{ selector: withLayerSelector('a', '.%'), property: 'color', value: ['blue'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(2)
	})

	it('should mark later shorthand and longhand overlaps as order-sensitive', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'padding', value: ['16px'] },
			{ selector: ['.%'], property: 'padding-left', value: ['8px'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(2)
		expect(result[0]!.orderSensitiveTo)
			.toBeUndefined()
		expect(result[1]!.orderSensitiveTo)
			.toEqual([JSON.stringify([['.%'], 'padding', ['16px']])])
	})

	it('should mark later shorthand overlaps for aggregate families', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'background-color', value: ['red'] },
			{ selector: ['.%'], property: 'background', value: ['blue'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(2)
		expect(result[1]!.orderSensitiveTo)
			.toEqual([JSON.stringify([['.%'], 'background-color', ['red']])])
	})

	it('should mark later overlaps for patched shorthand families', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'overflow-x', value: ['hidden'] },
			{ selector: ['.%'], property: 'overflow', value: ['auto'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(2)
		expect(result[1]!.orderSensitiveTo)
			.toEqual([JSON.stringify([['.%'], 'overflow-x', ['hidden']])])
	})

	it('should keep non-overlapping properties reusable', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'margin', value: ['16px'] },
			{ selector: ['.%'], property: 'padding-left', value: ['8px'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(2)
		expect(result.every(content => content.orderSensitiveTo == null))
			.toBe(true)
	})

	it('should mark every later step in a shorthand chain as order-sensitive', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'border-top-width', value: ['1px'] },
			{ selector: ['.%'], property: 'border-top', value: ['solid red'] },
			{ selector: ['.%'], property: 'border', value: ['2px solid blue'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(3)
		expect(result[0]!.orderSensitiveTo)
			.toBeUndefined()
		expect(result[1]!.orderSensitiveTo)
			.toEqual([JSON.stringify([['.%'], 'border-top-width', ['1px']])])
		expect(result[2]!.orderSensitiveTo)
			.toEqual([
				JSON.stringify([['.%'], 'border-top-width', ['1px']]),
				JSON.stringify([['.%'], 'border-top', ['solid red']]),
			])
	})

	it('should mark later steps in reverse shorthand chain as order-sensitive', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'border', value: ['2px solid blue'] },
			{ selector: ['.%'], property: 'border-top', value: ['solid red'] },
			{ selector: ['.%'], property: 'border-top-width', value: ['1px'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(3)
		expect(result[0]!.orderSensitiveTo)
			.toBeUndefined()
		expect(result[1]!.orderSensitiveTo)
			.toEqual([JSON.stringify([['.%'], 'border', ['2px solid blue']])])
		expect(result[2]!.orderSensitiveTo)
			.toEqual([
				JSON.stringify([['.%'], 'border', ['2px solid blue']]),
				JSON.stringify([['.%'], 'border-top', ['solid red']]),
			])
	})

	it('should mark later declarations when all appears in the chain', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: 'color', value: ['red'] },
			{ selector: ['.%'], property: 'all', value: ['unset'] },
			{ selector: ['.%'], property: 'background-color', value: ['blue'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(3)
		expect(result[1]!.orderSensitiveTo)
			.toEqual([JSON.stringify([['.%'], 'color', ['red']])])
		expect(result[2]!.orderSensitiveTo)
			.toEqual([JSON.stringify([['.%'], 'all', ['unset']])])
	})

	it('should keep custom properties exact-only in the same chain', () => {
		const list: ExtractedStyleContent[] = [
			{ selector: ['.%'], property: '--brand-color', value: ['red'] },
			{ selector: ['.%'], property: 'color', value: ['blue'] },
		]
		const result = optimizeAtomicStyleContents(list)
		expect(result)
			.toHaveLength(2)
		expect(result.every(content => content.orderSensitiveTo == null))
			.toBe(true)
	})
})
