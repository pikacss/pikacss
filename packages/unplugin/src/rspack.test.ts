import { describe, expect, it, vi } from 'vitest'

const createRspackPlugin = vi.fn(factory => ({ factory, target: 'rspack' }))

vi.mock('unplugin', () => ({
	createRspackPlugin,
}))

vi.mock('./index', () => ({
	unpluginFactory: 'shared-factory',
}))

describe('rspack wrapper', () => {
	it('creates an Rspack plugin from the shared factory', async () => {
		const mod = await import('./rspack')

		expect(createRspackPlugin)
			.toHaveBeenCalledWith('shared-factory')
		expect(mod.default)
			.toEqual({ factory: 'shared-factory', target: 'rspack' })
	})
})
