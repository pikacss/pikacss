import { afterEach, describe, expect, it, vi } from 'vitest'

const addPluginTemplate = vi.fn()
const addVitePlugin = vi.fn()
const defineNuxtModule = vi.fn(definition => definition)
const vitePluginFactory = vi.fn(options => ({
	name: 'pikacss-vite-plugin',
	options,
}))

vi.mock('@nuxt/kit', () => ({
	addPluginTemplate,
	addVitePlugin,
	defineNuxtModule,
}))

vi.mock('@pikacss/unplugin-pikacss/vite', () => ({
	default: vitePluginFactory,
}))

afterEach(() => {
	addPluginTemplate.mockClear()
	addVitePlugin.mockClear()
	vitePluginFactory.mockClear()
})

describe('nuxt module', () => {
	it('registers the runtime plugin template and default Vite integration options', async () => {
		const mod = await import('./index')
		const nuxt = { options: {} }

		await (mod.default as any).setup({}, nuxt as any)

		expect(defineNuxtModule)
			.toHaveBeenCalled()
		expect(addPluginTemplate)
			.toHaveBeenCalledWith(expect.objectContaining({
				filename: 'pikacss.mjs',
			}))
		expect(addPluginTemplate.mock.calls[0]![0].getContents())
			.toContain('import "pika.css";')
		expect(vitePluginFactory)
			.toHaveBeenCalledWith({
				currentPackageName: '@pikacss/nuxt-pikacss',
				scan: {
					include: ['**/*.{js,ts,jsx,tsx,vue}'],
				},
			})
		expect(addVitePlugin)
			.toHaveBeenCalledWith(expect.objectContaining({
				enforce: 'pre',
				name: 'pikacss-vite-plugin',
			}))
	})

	it('forwards explicit Nuxt options without applying the default scan fallback', async () => {
		const mod = await import('./index')
		const nuxt = {
			options: {
				pikacss: {
					fnName: 'styled',
					tsCodegen: false,
				},
			},
		}

		await (mod.default as any).setup({}, nuxt as any)

		expect(vitePluginFactory)
			.toHaveBeenLastCalledWith({
				currentPackageName: '@pikacss/nuxt-pikacss',
				fnName: 'styled',
				tsCodegen: false,
			})
	})
})
