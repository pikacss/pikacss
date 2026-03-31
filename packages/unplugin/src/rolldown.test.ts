import { describe, expect, it, vi } from 'vitest'

const createRolldownPlugin = vi.fn(factory => ({ factory, target: 'rolldown' }))

vi.mock('unplugin', () => ({
	createRolldownPlugin,
}))

vi.mock('./index', () => ({
	unpluginFactory: 'shared-factory',
}))

describe('rolldown wrapper', () => {
	it('creates a Rolldown plugin from the shared factory', async () => {
		const mod = await import('./rolldown')

		expect(createRolldownPlugin)
			.toHaveBeenCalledWith('shared-factory')
		expect(mod.default)
			.toEqual({ factory: 'shared-factory', target: 'rolldown' })
	})
})
