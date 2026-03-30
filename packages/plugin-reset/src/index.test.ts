import { describe, expect, it, vi } from 'vitest'

import { reset } from './index'

function createEngine() {
	return {
		addPreflight: vi.fn(),
	}
}

describe('reset plugin', () => {
	it('configures the reset layer and injects the default reset preflight', async () => {
		const plugin = reset()
		const engine = createEngine()
		const config = {
			layers: {
				components: 10,
			},
		}

		expect(plugin.name)
			.toBe('reset')
		expect(plugin.order)
			.toBe('pre')

		plugin.configureRawConfig?.(config as any)
		await plugin.configureEngine?.(engine as any)

		expect(config.layers)
			.toEqual({
				components: 10,
				reset: -1,
			})
		expect(engine.addPreflight)
			.toHaveBeenCalledWith(expect.objectContaining({
				layer: 'reset',
				preflight: expect.stringContaining('html'),
			}))
	})

	it('keeps the configured layer but skips preflight registration for unknown runtime reset values', async () => {
		const plugin = reset()
		const engine = createEngine()
		const config = {
			reset: 'unknown-reset',
		} as any

		plugin.configureRawConfig?.(config)
		await plugin.configureEngine?.(engine as any)

		expect(config.layers)
			.toEqual({ reset: -1 })
		expect(engine.addPreflight)
			.not.toHaveBeenCalled()
	})
})
