import { describe, expect, it, vi } from 'vitest'

const createVitePlugin = vi.fn(factory => ({ factory, target: 'vite' }))

vi.mock('unplugin', () => ({
	createVitePlugin,
}))

vi.mock('./index', () => ({
	unpluginFactory: 'shared-factory',
}))

describe('vite wrapper', () => {
	it('creates a Vite plugin from the shared factory', async () => {
		const mod = await import('./vite')

		expect(createVitePlugin)
			.toHaveBeenCalledWith('shared-factory')
		expect(mod.default)
			.toEqual({ factory: 'shared-factory', target: 'vite' })
	})
})
