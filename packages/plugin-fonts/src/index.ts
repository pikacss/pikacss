import type { EnginePlugin } from '@pikacss/core'
import type {
	FontsProvider,
	FontsProviderContext,
	FontsProviderDefinition,
	FontsProviderFontEntry,
	FontsProviderOptions,
} from './providers'
import { defineEnginePlugin, log } from '@pikacss/core'
import {
	builtInFontsProviders,
	defineFontsProvider,
} from './providers'

export {
	builtInFontsProviders,
	defineFontsProvider,
}

export type {
	FontsProvider,
	FontsProviderContext,
	FontsProviderDefinition,
	FontsProviderFontEntry,
	FontsProviderOptions,
}

export interface FontMeta {
	name: string
	weights?: Array<string | number>
	italic?: boolean
	provider?: FontsProvider
	providerOptions?: FontsProviderOptions
}

export type FontFamilyEntry = string | FontMeta

export interface FontFaceDefinition {
	fontFamily: string
	src: string | string[]
	fontDisplay?: string
	fontWeight?: string | number
	fontStyle?: string
	fontStretch?: string
	unicodeRange?: string | string[]
}

export interface FontsPluginOptions {
	provider?: FontsProvider
	fonts?: Record<string, FontFamilyEntry | FontFamilyEntry[]>
	families?: Record<string, string | string[]>
	imports?: string | string[]
	faces?: FontFaceDefinition[]
	display?: string
	providers?: Record<string, FontsProviderDefinition>
	providerOptions?: Record<string, FontsProviderOptions>
}

interface NormalizedFontEntry extends FontsProviderFontEntry {
	provider: FontsProvider
}

interface ResolvedFontsConfig {
	imports: string[]
	faces: FontFaceDefinition[]
	familyStacks: Record<string, string>
	providerFonts: Map<FontsProvider, NormalizedFontEntry[]>
	providers: Record<string, FontsProviderDefinition>
	providerOptions: Record<string, FontsProviderOptions>
	display: string
}

interface ParsedFontString {
	name: string
	weights: string[]
}

const genericFamilyNames = new Set([
	'serif',
	'sans-serif',
	'monospace',
	'cursive',
	'fantasy',
	'system-ui',
	'ui-sans-serif',
	'ui-serif',
	'ui-monospace',
	'ui-rounded',
	'emoji',
	'math',
	'fangsong',
	'inherit',
	'initial',
	'unset',
])

const defaultFallbacks: Record<string, string[]> = {
	sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
	serif: ['ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
	mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
}

declare module '@pikacss/core' {
	interface EngineConfig {
		fonts?: FontsPluginOptions
	}
}

export function fonts(): EnginePlugin {
	let fontsConfig: FontsPluginOptions = {}

	return defineEnginePlugin({
		name: 'fonts',
		configureRawConfig: (config) => {
			fontsConfig = config.fonts ?? {}
		},
		configureEngine: async (engine) => {
			const resolved = resolveFontsConfig(fontsConfig)
			const importRules = renderFontsImportRules(resolved)
			const preflightCss = renderFontsPreflightCss(resolved)

			for (const importRule of importRules)
				engine.appendCssImport(importRule)

			if (preflightCss.length > 0) {
				engine.addPreflight({
					id: 'fonts:preflight',
					preflight: preflightCss,
				})
			}

			for (const [token, family] of Object.entries(resolved.familyStacks)) {
				const variableName = `--pk-font-${token}`
				engine.variables.add({
					[variableName]: {
						value: family,
						autocomplete: {
							asValueOf: 'font-family',
							asProperty: false,
						},
					},
				})

				engine.shortcuts.add([
					`font-${token}`,
					{ fontFamily: `var(${variableName})` },
				])
			}

			engine.appendAutocomplete({
				cssProperties: {
					'font-family': Object.values(resolved.familyStacks),
				},
			})
		},
	})
}

function resolveFontsConfig(config: FontsPluginOptions): ResolvedFontsConfig {
	const provider = config.provider ?? 'google'
	const imports = dedupeStrings([config.imports ?? []].flat())
	const faces = config.faces ?? []
	const familyStacks: Record<string, string> = {}
	const providerFonts = new Map<FontsProvider, NormalizedFontEntry[]>()

	for (const [token, definition] of Object.entries(config.fonts ?? {})) {
		const entries = [definition].flat()
		const normalizedEntries = entries.map(entry => normalizeFontEntry(entry, provider))
		const stack = dedupeStrings([
			...normalizedEntries.map(entry => normalizeFamilyName(entry.name)),
			...(defaultFallbacks[token] ?? []),
		])
		familyStacks[token] = stack.join(', ')

		normalizedEntries.forEach((entry) => {
			if (genericFamilyNames.has(entry.name.toLowerCase()))
				return
			const list = providerFonts.get(entry.provider) ?? []
			list.push(entry)
			providerFonts.set(entry.provider, list)
		})
	}

	for (const [token, definition] of Object.entries(config.families ?? {})) {
		const stack = [definition].flat()
			.map(value => normalizeFamilyName(value))
		familyStacks[token] = dedupeStrings(stack)
			.join(', ')
	}

	return {
		imports,
		faces,
		familyStacks,
		providerFonts: dedupeProviderFonts(providerFonts),
		providers: {
			...builtInFontsProviders,
			...(config.providers ?? {}),
		},
		providerOptions: config.providerOptions ?? {},
		display: config.display ?? 'swap',
	}
}

function normalizeFontEntry(entry: FontFamilyEntry, defaultProvider: FontsProvider): NormalizedFontEntry {
	if (typeof entry === 'string') {
		const parsed = parseFontString(entry)
		return {
			name: parsed.name,
			provider: genericFamilyNames.has(parsed.name.toLowerCase()) ? 'none' : defaultProvider,
			weights: parsed.weights,
			italic: false,
			options: {},
		}
	}

	return {
		name: entry.name,
		provider: entry.provider ?? (genericFamilyNames.has(entry.name.toLowerCase()) ? 'none' : defaultProvider),
		weights: (entry.weights ?? [])
			.map(weight => String(weight)),
		italic: entry.italic ?? false,
		options: entry.providerOptions ?? {},
	}
}

function parseFontString(value: string): ParsedFontString {
	const matched = value.match(/^(.*?):([\d,]+)$/)
	if (matched == null) {
		return { name: value, weights: [] }
	}

	const name = matched[1] ?? value
	const weights = matched[2] ?? ''
	return {
		name,
		weights: weights.split(',')
			.filter(Boolean),
	}
}

function normalizeFamilyName(value: string) {
	if (/^['"].*['"]$/.test(value))
		return value
	if (genericFamilyNames.has(value.toLowerCase()))
		return value
	if (/^[a-z-]+\(/i.test(value))
		return value
	return JSON.stringify(value)
}

function renderFontsPreflightCss(config: ResolvedFontsConfig) {
	const fontFaces = config.faces.map(renderFontFace)

	return fontFaces
		.filter(Boolean)
		.join('\n')
}

function renderFontsImportRules(config: ResolvedFontsConfig) {
	const providerImports = [...config.providerFonts.entries()]
		.flatMap(([providerName, fonts]) => resolveProviderImportUrls({
			providerName,
			fonts,
			providers: config.providers,
			context: {
				provider: providerName,
				display: config.display,
				options: config.providerOptions[providerName] ?? {},
			},
		}))

	const imports = [
		...config.imports,
		...providerImports,
	].map(url => `@import url(${JSON.stringify(url)});`)

	return dedupeStrings(imports)
}

function renderFontFace(face: FontFaceDefinition) {
	const declarations = [
		`font-family: ${normalizeFamilyName(face.fontFamily)};`,
		`src: ${[face.src].flat()
			.join(', ')};`,
		face.fontDisplay != null ? `font-display: ${face.fontDisplay};` : null,
		face.fontWeight != null ? `font-weight: ${face.fontWeight};` : null,
		face.fontStyle != null ? `font-style: ${face.fontStyle};` : null,
		face.fontStretch != null ? `font-stretch: ${face.fontStretch};` : null,
		face.unicodeRange != null
			? `unicode-range: ${[face.unicodeRange].flat()
				.join(', ')};`
			: null,
	].filter(Boolean)

	return `@font-face { ${declarations.join(' ')} }`
}

function resolveProviderImportUrls({
	providerName,
	fonts,
	providers,
	context,
}: {
	providerName: FontsProvider
	fonts: NormalizedFontEntry[]
	providers: Record<string, FontsProviderDefinition>
	context: FontsProviderContext
}) {
	const provider = providers[providerName]
	if (provider?.buildImportUrls == null) {
		log.warn(`Unknown fonts provider "${providerName}". Skipping import generation.`)
		return []
	}

	return [provider.buildImportUrls(fonts, context) ?? []].flat()
		.filter(Boolean)
}

function dedupeProviderFonts(providerFonts: Map<FontsProvider, NormalizedFontEntry[]>) {
	const deduped = new Map<FontsProvider, NormalizedFontEntry[]>()
	for (const [provider, fonts] of providerFonts.entries()) {
		const map = new Map<string, NormalizedFontEntry>()
		for (const font of fonts) {
			const key = [
				font.provider,
				font.name,
				font.italic,
				dedupeStrings(font.weights)
					.join(','),
				serializeProviderOptions(font.options),
			].join(':')
			if (map.has(key) === false) {
				map.set(key, {
					...font,
					weights: dedupeStrings(font.weights),
				})
			}
		}
		deduped.set(provider, [...map.values()])
	}
	return deduped
}

function dedupeStrings(values: string[]) {
	return [...new Set(values.filter(Boolean))]
}

function serializeProviderOptions(options?: FontsProviderOptions) {
	if (options == null)
		return ''

	const normalized = Object.keys(options)
		.sort()
		.map(key => [key, options[key]])
	return JSON.stringify(normalized)
}
