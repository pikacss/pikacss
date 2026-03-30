import { describe, expect, it, vi } from 'vitest'

const createEsbuildPlugin = vi.fn(factory => ({ factory, target: 'esbuild' }))

vi.mock('unplugin', () => ({
	createEsbuildPlugin,
}))

vi.mock('./index', () => ({
	unpluginFactory: 'shared-factory',
}))

describe('esbuild wrapper', () => {
	it('creates an Esbuild plugin from the shared factory', async () => {
		const mod = await import('./esbuild')

		expect(createEsbuildPlugin)
			.toHaveBeenCalledWith('shared-factory')
		expect(mod.default)
			.toEqual({ factory: 'shared-factory', target: 'esbuild' })
	})
})
