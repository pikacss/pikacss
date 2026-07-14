import { describe, expect, it } from 'vitest'
import { nodeLoc, PikaTransformError } from './errors'

describe('pikaTransformError', () => {
	it('formats the message with id and position', () => {
		const error = new PikaTransformError({
			id: '/repo/src/App.tsx',
			stage: 'evaluate',
			message: 'boom',
			loc: { line: 12, column: 8 },
		})
		expect(error.message)
			.toBe('[pikacss] boom (/repo/src/App.tsx:12:8)')
		expect(error.name)
			.toBe('PikaTransformError')
		expect(error.stage)
			.toBe('evaluate')
		expect(error.loc)
			.toEqual({ line: 12, column: 8 })
	})

	it('formats without a position when loc is absent and keeps the cause', () => {
		const cause = new Error('inner')
		const error = new PikaTransformError({
			id: '/repo/src/App.tsx',
			stage: 'parse',
			message: 'boom',
			cause,
		})
		expect(error.message)
			.toBe('[pikacss] boom (/repo/src/App.tsx)')
		expect(error.loc)
			.toBeNull()
		expect(error.cause)
			.toBe(cause)
	})
})

describe('nodeLoc', () => {
	it('extracts the start position', () => {
		expect(nodeLoc({ loc: { start: { line: 3, column: 7 } } }))
			.toEqual({ line: 3, column: 7 })
	})

	it('returns null for nodes without location info', () => {
		expect(nodeLoc({}))
			.toBeNull()
		expect(nodeLoc({ loc: null }))
			.toBeNull()
	})
})
