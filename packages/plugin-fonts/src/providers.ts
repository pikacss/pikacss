export type FontsProviderOptionValue = string | number | boolean | Array<string | number | boolean> | null | undefined

export type FontsProviderOptions = Record<string, FontsProviderOptionValue>

export type BuiltinFontsProvider = 'google' | 'bunny' | 'fontshare' | 'coollabs' | 'none'

export type FontsProvider = BuiltinFontsProvider | (string & {})

export interface FontsProviderFontEntry {
	name: string
	weights: string[]
	italic: boolean
	options?: FontsProviderOptions
}

export interface FontsProviderContext {
	provider: FontsProvider
	display: string
	options: FontsProviderOptions
}

export interface FontsProviderDefinition {
	buildImportUrls?: (
		fonts: readonly FontsProviderFontEntry[],
		context: FontsProviderContext,
	) => string | string[] | null | undefined
}

export function defineFontsProvider<const T extends FontsProviderDefinition>(provider: T): T {
	return provider
}

export const builtInFontsProviders: Record<BuiltinFontsProvider, FontsProviderDefinition> = {
	google: defineFontsProvider({
		buildImportUrls(fonts, context) {
			return `https://fonts.googleapis.com/css2?${createProviderQueryString({
				params: createGoogleStyleFamilyParams(fonts),
				display: context.display,
				options: context.options,
				supportedOptionKeys: ['text'],
			})}`
		},
	}),
	bunny: defineFontsProvider({
		buildImportUrls(fonts, context) {
			const familyParam = fonts.map((font) => {
				const familyName = encodeFamilyName(font.name)
				const weights = dedupeStrings(font.weights)
				if (weights.length === 0)
					return familyName
				if (font.italic) {
					const variants = weights.flatMap(weight => [weight, `${weight}i`])
					return `${familyName}:${variants.join(',')}`
				}
				return `${familyName}:${weights.join(',')}`
			})
				.join('|')

			return `https://fonts.bunny.net/css?${createProviderQueryString({
				params: [`family=${familyParam}`],
				display: context.display,
				options: context.options,
				supportedOptionKeys: ['text'],
			})}`
		},
	}),
	fontshare: defineFontsProvider({
		buildImportUrls(fonts, context) {
			const params = fonts.map((font) => {
				const familyName = toProviderSlug(font.name)
				const weights = dedupeStrings(font.weights)
				const axis = weights.length > 0 ? `@${weights.join(',')}` : ''
				return `f[]=${encodeURIComponent(`${familyName}${axis}`)}`
			})

			if (params.length === 0)
				return []

			return `https://api.fontshare.com/v2/css?${createProviderQueryString({
				params,
				display: context.display,
				options: context.options,
				supportedOptionKeys: ['text'],
			})}`
		},
	}),
	coollabs: defineFontsProvider({
		buildImportUrls(fonts, context) {
			return `https://api.fonts.coollabs.io/css2?${createProviderQueryString({
				params: createGoogleStyleFamilyParams(fonts),
				display: context.display,
				options: context.options,
				supportedOptionKeys: ['text'],
			})}`
		},
	}),
	none: defineFontsProvider({
		buildImportUrls() {
			return []
		},
	}),
}

function createGoogleStyleFamilyParams(fonts: readonly FontsProviderFontEntry[]) {
	return fonts.map((font) => {
		const familyName = encodeFamilyName(font.name)
		const weights = dedupeStrings(font.weights)
		if (weights.length === 0)
			return `family=${familyName}`
		if (font.italic) {
			const pairs = weights.flatMap(weight => [`0,${weight}`, `1,${weight}`])
			return `family=${familyName}:ital,wght@${pairs.join(';')}`
		}
		return `family=${familyName}:wght@${weights.join(';')}`
	})
}

function createProviderQueryString({
	params,
	display,
	options,
	supportedOptionKeys,
}: {
	params: string[]
	display: string
	options: FontsProviderOptions
	supportedOptionKeys: string[]
}) {
	const query = [...params, `display=${encodeURIComponent(display)}`]
	for (const key of supportedOptionKeys) {
		const value = options[key]
		if (value == null)
			continue
		query.push(`${encodeURIComponent(key)}=${encodeProviderOptionValue(value)}`)
	}
	return query.join('&')
}

function encodeProviderOptionValue(value: FontsProviderOptionValue) {
	return encodeURIComponent([value].flat()
		.join(','))
}

function encodeFamilyName(name: string) {
	return name.trim()
		.replace(/\s+/g, '+')
}

function toProviderSlug(name: string) {
	return name.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

function dedupeStrings(values: string[]) {
	return [...new Set(values.filter(Boolean))]
}
