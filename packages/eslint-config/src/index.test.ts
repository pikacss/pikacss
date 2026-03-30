import { describe, expect, it } from 'vitest'

import pikacss, { plugin, recommended } from './index'
import noDynamicArgs from './rules/no-dynamic-args'

describe('plugin export', () => {
	it('exposes package metadata and the no-dynamic-args rule map', () => {
		expect(plugin)
			.toMatchObject({
				meta: {
					name: '@pikacss/eslint-config',
					version: '1.0.0',
				},
				rules: {
					'no-dynamic-args': noDynamicArgs,
				},
			})
	})
})

describe('recommended', () => {
	it('creates a flat config that wires the plugin with the default fnName', () => {
		expect(recommended())
			.toEqual({
				plugins: {
					pikacss: plugin,
				},
				rules: {
					'pikacss/no-dynamic-args': ['error', { fnName: 'pika' }],
				},
			})
	})

	it('uses a custom fnName when provided', () => {
		expect(recommended({ fnName: 'styled' }))
			.toEqual({
				plugins: {
					pikacss: plugin,
				},
				rules: {
					'pikacss/no-dynamic-args': ['error', { fnName: 'styled' }],
				},
			})
	})
})

describe('default export', () => {
	it('delegates to recommended for convenience', () => {
		expect(pikacss({ fnName: 'styled' }))
			.toEqual(recommended({ fnName: 'styled' }))
	})
})
