import { describe, expect, it } from 'vitest'

import { createCtx, createEngine, defineEngineConfig } from './index'

describe('index exports', () => {
	it('re-exports integration helpers alongside core helpers', () => {
		expect(typeof createCtx)
			.toBe('function')
		expect(typeof createEngine)
			.toBe('function')
		expect(typeof defineEngineConfig)
			.toBe('function')
	})
})
