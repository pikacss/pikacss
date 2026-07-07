import { describe, expect, it } from 'vitest'

import {
	builtInFontsProviders,
	defineFontsProvider,
} from './providers'

describe('defineFontsProvider', () => {
	it('returns the provided definition unchanged', () => {
		const provider = defineFontsProvider({
			buildImportUrls(_fonts, _context) {
				return ['https://example.com/fonts.css']
			},
		})

		expect(provider.buildImportUrls?.([], {
			provider: 'custom',
			display: 'swap',
			options: {},
		}))
			.toEqual(['https://example.com/fonts.css'])
	})
})

describe('builtInFontsProviders', () => {
	it('builds Google Fonts URLs for italic and weighted families', () => {
		expect(builtInFontsProviders.google.buildImportUrls?.([
			{
				name: 'Open Sans',
				weights: ['400', '700'],
				italic: true,
			},
		], {
			provider: 'google',
			display: 'swap',
			options: { text: 'AB' },
		}))
			.toBe('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;1,400;0,700;1,700&display=swap&text=AB')
	})

	it('builds Bunny and Coollabs URLs with provider-specific family formatting', () => {
		expect(builtInFontsProviders.bunny.buildImportUrls?.([
			{
				name: 'Fira Code',
				weights: ['400', '700'],
				italic: true,
			},
		], {
			provider: 'bunny',
			display: 'fallback',
			options: {},
		}))
			.toBe('https://fonts.bunny.net/css?family=Fira+Code:400,400i,700,700i&display=fallback')

		expect(builtInFontsProviders.coollabs.buildImportUrls?.([
			{
				name: 'DM Sans',
				weights: ['400'],
				italic: false,
			},
		], {
			provider: 'coollabs',
			display: 'optional',
			options: {},
		}))
			.toBe('https://api.fonts.coollabs.io/css2?family=DM+Sans:wght@400&display=optional')

		expect(builtInFontsProviders.bunny.buildImportUrls?.([
			{
				name: 'Space Grotesk',
				weights: ['400', '700'],
				italic: false,
			},
		], {
			provider: 'bunny',
			display: 'swap',
			options: {},
		}))
			.toBe('https://fonts.bunny.net/css?family=Space+Grotesk:400,700&display=swap')

		expect(builtInFontsProviders.bunny.buildImportUrls?.([
			{
				name: 'Sora',
				weights: [],
				italic: false,
			},
		], {
			provider: 'bunny',
			display: 'swap',
			options: { subset: 'latin' } as any,
		}))
			.toBe('https://fonts.bunny.net/css?family=Sora&display=swap')
	})

	it('emits the italic axis for weightless italic families on Google-style and Bunny providers', () => {
		expect(builtInFontsProviders.google.buildImportUrls?.([
			{
				name: 'Inter',
				weights: [],
				italic: true,
			},
		], {
			provider: 'google',
			display: 'swap',
			options: {},
		}))
			.toBe('https://fonts.googleapis.com/css2?family=Inter:ital@0;1&display=swap')

		expect(builtInFontsProviders.coollabs.buildImportUrls?.([
			{
				name: 'Inter',
				weights: [],
				italic: true,
			},
		], {
			provider: 'coollabs',
			display: 'swap',
			options: {},
		}))
			.toBe('https://api.fonts.coollabs.io/css2?family=Inter:ital@0;1&display=swap')

		expect(builtInFontsProviders.bunny.buildImportUrls?.([
			{
				name: 'Inter',
				weights: [],
				italic: true,
			},
		], {
			provider: 'bunny',
			display: 'swap',
			options: {},
		}))
			.toBe('https://fonts.bunny.net/css?family=Inter:400,400i&display=swap')
	})

	it('requests Fontshare italic weight codes as weight + 1 and keeps non-numeric weights untouched', () => {
		expect(builtInFontsProviders.fontshare.buildImportUrls?.([
			{
				name: 'Satoshi',
				weights: ['400', '700'],
				italic: true,
			},
		], {
			provider: 'fontshare',
			display: 'swap',
			options: {},
		}))
			.toBe('https://api.fontshare.com/v2/css?f[]=satoshi%40400%2C401%2C700%2C701&display=swap')

		expect(builtInFontsProviders.fontshare.buildImportUrls?.([
			{
				name: 'Satoshi',
				weights: ['100..900'],
				italic: true,
			},
		], {
			provider: 'fontshare',
			display: 'swap',
			options: {},
		}))
			.toBe('https://api.fontshare.com/v2/css?f[]=satoshi%40100..900&display=swap')
	})

	it('builds Fontshare URLs and returns empty results for providers that intentionally skip imports', () => {
		expect(builtInFontsProviders.fontshare.buildImportUrls?.([
			{
				name: 'Cabinet Grotesk',
				weights: ['500', '700'],
				italic: false,
			},
		], {
			provider: 'fontshare',
			display: 'swap',
			options: { text: 'UI' },
		}))
			.toBe('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk%40500%2C700&display=swap&text=UI')

		expect(builtInFontsProviders.fontshare.buildImportUrls?.([
			{
				name: 'General Sans',
				weights: [],
				italic: false,
			},
		], {
			provider: 'fontshare',
			display: 'swap',
			options: {},
		}))
			.toBe('https://api.fontshare.com/v2/css?f[]=general-sans&display=swap')

		expect(builtInFontsProviders.fontshare.buildImportUrls?.([], {
			provider: 'fontshare',
			display: 'swap',
			options: {},
		}))
			.toEqual([])

		expect(builtInFontsProviders.none.buildImportUrls?.([
			{
				name: 'System UI',
				weights: [],
				italic: false,
			},
		], {
			provider: 'none',
			display: 'swap',
			options: {},
		}))
			.toEqual([])

		expect(builtInFontsProviders.google.buildImportUrls?.([
			{
				name: 'Inter',
				weights: [],
				italic: false,
			},
		], {
			provider: 'google',
			display: 'swap',
			options: {
				text: ['A', 'B'],
				subset: 'latin',
			} as any,
		}))
			.toBe('https://fonts.googleapis.com/css2?family=Inter&display=swap&text=A%2CB')
	})
})
