import { createEngine } from '@pikacss/core'
import { describe, expect, it } from 'vitest'
import { defineFontsProvider, fonts } from './index'

async function createFontsEngine(config: Parameters<typeof createEngine>[0] = {}) {
	return createEngine({
		...config,
		plugins: [fonts()],
	})
}

describe('fonts plugin', () => {
	it('should have plugin name "fonts"', () => {
		const plugin = fonts()
		expect(plugin.name)
			.toBe('fonts')
	})

	it('should generate a Google Fonts import before layered preflights', async () => {
		const engine = await createFontsEngine({
			fonts: {
				fonts: {
					sans: 'Roboto',
				},
			},
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");')
		expect(css)
			.not.toContain('fonts.bunny.net')
	})

	it('should register font variables and shortcuts', async () => {
		const engine = await createFontsEngine({
			fonts: {
				fonts: {
					sans: 'Roboto',
				},
			},
		})

		expect(engine.variables.store.has('--pk-font-sans'))
			.toBe(true)

		const ids = await engine.use('font-sans')
		expect(ids.length)
			.toBeGreaterThan(0)

		const css = await engine.renderAtomicStyles(false)
		expect(css)
			.toContain('font-family:var(--pk-font-sans)')
		expect(engine.config.autocomplete.styleItemStrings.has('font-sans'))
			.toBe(true)
		expect(engine.config.autocomplete.cssProperties.get('font-family'))
			.toContain('"Roboto", ui-sans-serif, system-ui, sans-serif')
	})

	it('should not generate a Google Fonts import for none provider entries', async () => {
		const engine = await createFontsEngine({
			fonts: {
				fonts: {
					brand: [
						{ name: 'Clash Display', provider: 'none' },
						'sans-serif',
					],
				},
			},
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.not.toContain('fonts.googleapis.com')
		const ids = await engine.use('font-brand')
		expect(ids.length)
			.toBeGreaterThan(0)
	})

	it('should generate Bunny imports through the provider registry', async () => {
		const engine = await createFontsEngine({
			fonts: {
				provider: 'bunny',
				fonts: {
					sans: [
						'Roboto:400,700',
						'Open Sans:400,600',
					],
				},
			},
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('@import url("https://fonts.bunny.net/css?family=Roboto:400,700|Open+Sans:400,600&display=swap");')
	})

	it('should generate Fontshare imports through the provider registry', async () => {
		const engine = await createFontsEngine({
			fonts: {
				provider: 'fontshare',
				fonts: {
					display: [{ name: 'Clash Display', weights: [400, 600] }],
				},
			},
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('@import url("https://api.fontshare.com/v2/css?f[]=clash-display%40400%2C600&display=swap");')
	})

	it('should generate Coollabs imports through the provider registry', async () => {
		const engine = await createFontsEngine({
			fonts: {
				provider: 'coollabs',
				providerOptions: {
					coollabs: {
						text: 'PikaCSS',
					},
				},
				fonts: {
					sans: 'Roboto:400,700',
				},
			},
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('@import url("https://api.fonts.coollabs.io/css2?family=Roboto:wght@400;700&display=swap&text=PikaCSS");')
	})

	it('should allow registering custom providers from config', async () => {
		const engine = await createFontsEngine({
			fonts: {
				provider: 'acme',
				providerOptions: {
					acme: {
						text: 'PikaCSS',
					},
				},
				providers: {
					acme: defineFontsProvider({
						buildImportUrls(fonts, context) {
							return `https://cdn.example.com/fonts.css?family=${fonts.map(font => font.name)
								.join(',')}&display=${context.display}&text=${context.options.text}&subset=${fonts[0]?.options?.subset}`
						},
					}),
				},
				fonts: {
					brand: {
						name: 'Acme Sans',
						providerOptions: {
							subset: 'latin',
						},
					},
				},
			},
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('@import url("https://cdn.example.com/fonts.css?family=Acme Sans&display=swap&text=PikaCSS&subset=latin");')
	})

	it('should render custom imports and @font-face declarations', async () => {
		const engine = await createFontsEngine({
			fonts: {
				imports: 'https://example.com/fonts.css',
				faces: [{
					fontFamily: 'Clash Display',
					src: 'url("/fonts/clash-display.woff2") format("woff2")',
					fontWeight: 600,
					fontStyle: 'normal',
				}],
				families: {
					display: ['Clash Display', 'sans-serif'],
				},
			},
		})

		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('@import url("https://example.com/fonts.css");')
		expect(css)
			.toContain('@font-face { font-family: "Clash Display"; src: url("/fonts/clash-display.woff2") format("woff2"); font-weight: 600; font-style: normal; }')

		const ids = await engine.use('font-display')
		expect(ids.length)
			.toBeGreaterThan(0)
	})
})
