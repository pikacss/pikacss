import { describe, expect, it } from 'vitest'
import { createFnConfig, resolveOutputFormat } from './fnConfig'

describe('createFnConfig', () => {
	it('derives all six dot-form variants from the base name', () => {
		const config = createFnConfig('pika')

		expect(new Set(config.variants.keys()))
			.toEqual(new Set(['pika', 'pika.str', 'pika.arr', 'pikap', 'pikap.str', 'pikap.arr']))
		expect(config.fnName)
			.toBe('pika')
		expect(config.previewFnName)
			.toBe('pikap')
		expect(config.roots)
			.toEqual(new Set(['pika', 'pikap']))
	})

	it('classifies output kind and preview per variant', () => {
		const config = createFnConfig('pika')

		expect(config.variants.get('pika'))
			.toEqual({ name: 'pika', root: 'pika', property: null, kind: 'normal', preview: false })
		expect(config.variants.get('pika.str'))
			.toEqual({ name: 'pika.str', root: 'pika', property: 'str', kind: 'forceString', preview: false })
		expect(config.variants.get('pika.arr'))
			.toEqual({ name: 'pika.arr', root: 'pika', property: 'arr', kind: 'forceArray', preview: false })
		expect(config.variants.get('pikap'))
			.toEqual({ name: 'pikap', root: 'pikap', property: null, kind: 'normal', preview: true })
		expect(config.variants.get('pikap.str'))
			.toEqual({ name: 'pikap.str', root: 'pikap', property: 'str', kind: 'forceString', preview: true })
		expect(config.variants.get('pikap.arr'))
			.toEqual({ name: 'pikap.arr', root: 'pikap', property: 'arr', kind: 'forceArray', preview: true })
	})

	it('derives variants from a custom base name', () => {
		const config = createFnConfig('styled')

		expect(new Set(config.variants.keys()))
			.toEqual(new Set(['styled', 'styled.str', 'styled.arr', 'styledp', 'styledp.str', 'styledp.arr']))
		expect(config.roots)
			.toEqual(new Set(['styled', 'styledp']))
	})
})

describe('resolveOutputFormat', () => {
	it('follows transformedFormat for normal variants', () => {
		const config = createFnConfig('pika')

		expect(resolveOutputFormat(config.variants.get('pika')!, 'string'))
			.toBe('string')
		expect(resolveOutputFormat(config.variants.get('pikap')!, 'array'))
			.toBe('array')
	})

	it('forces the format for str/arr variants regardless of transformedFormat', () => {
		const config = createFnConfig('pika')

		expect(resolveOutputFormat(config.variants.get('pika.str')!, 'array'))
			.toBe('string')
		expect(resolveOutputFormat(config.variants.get('pika.arr')!, 'string'))
			.toBe('array')
		expect(resolveOutputFormat(config.variants.get('pikap.str')!, 'array'))
			.toBe('string')
		expect(resolveOutputFormat(config.variants.get('pikap.arr')!, 'string'))
			.toBe('array')
	})
})
