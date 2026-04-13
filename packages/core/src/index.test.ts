import { describe, expect, it } from 'vitest'

import { defineEngineConfig, defineEnginePlugin } from './index'

describe('index exports', () => {
	it('retains the supported define helpers', () => {
		expect(typeof defineEngineConfig)
			.toBe('function')
		expect(typeof defineEnginePlugin)
			.toBe('function')
	})
})
