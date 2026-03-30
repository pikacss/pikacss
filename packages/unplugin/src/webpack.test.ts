import { describe, expect, it, vi } from 'vitest'

const createWebpackPlugin = vi.fn(factory => ({ factory, target: 'webpack' }))

vi.mock('unplugin', () => ({
	createWebpackPlugin,
}))

vi.mock('./index', () => ({
	unpluginFactory: 'shared-factory',
}))

describe('webpack wrapper', () => {
	it('creates a Webpack plugin from the shared factory', async () => {
		const mod = await import('./webpack')

		expect(createWebpackPlugin)
			.toHaveBeenCalledWith('shared-factory')
		expect(mod.default)
			.toEqual({ factory: 'shared-factory', target: 'webpack' })
	})
})
