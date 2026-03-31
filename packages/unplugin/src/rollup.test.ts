import { describe, expect, it, vi } from 'vitest'

const createRollupPlugin = vi.fn(factory => ({ factory, target: 'rollup' }))

vi.mock('unplugin', () => ({
	createRollupPlugin,
}))

vi.mock('./index', () => ({
	unpluginFactory: 'shared-factory',
}))

describe('rollup wrapper', () => {
	it('creates a Rollup plugin from the shared factory', async () => {
		const mod = await import('./rollup')

		expect(createRollupPlugin)
			.toHaveBeenCalledWith('shared-factory')
		expect(mod.default)
			.toEqual({ factory: 'shared-factory', target: 'rollup' })
	})
})
