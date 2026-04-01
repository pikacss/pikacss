/**
 * Accepted primitive and array types for a single font-provider option value.
 * @internal
 *
 * @remarks Arrays are serialized as comma-separated strings when encoding provider query parameters.
 *
 * @example
 * ```ts
 * const text: FontsProviderOptionValue = 'hello'
 * const list: FontsProviderOptionValue = ['woff2', 'woff']
 * ```
 */
export type FontsProviderOptionValue = string | number | boolean | Array<string | number | boolean> | null | undefined

/**
 * Key-value map of provider-specific options passed alongside font requests.
 *
 * @remarks Unsupported option keys are silently ignored by each provider's URL builder.
 *
 * @example
 * ```ts
 * const opts: FontsProviderOptions = { text: 'Hello' }
 * ```
 */
export type FontsProviderOptions = Record<string, FontsProviderOptionValue>

/**
 * String literal union of the provider identifiers shipped with the plugin.
 * @internal
 *
 * @remarks `'none'` is a no-op provider used for generic CSS family names that need no external loading.
 *
 * @example
 * ```ts
 * const p: BuiltinFontsProvider = 'google'
 * ```
 */
export type BuiltinFontsProvider = 'google' | 'bunny' | 'fontshare' | 'coollabs' | 'none'

const RE_WHITESPACE = /\s+/g
const RE_NON_ALPHANUMERIC = /[^a-z0-9]+/g
const RE_TRIM_DASHES = /^-+|-+$/g

/**
 * Identifier for a font provider — either a built-in name or a custom string.
 *
 * @remarks Custom strings must have a matching entry in `FontsPluginOptions.providers` to take effect.
 *
 * @example
 * ```ts
 * const builtin: FontsProvider = 'bunny'
 * const custom: FontsProvider = 'my-cdn'
 * ```
 */
export type FontsProvider = BuiltinFontsProvider | (string & {})

/**
 * Describes a single font family to be loaded by a provider.
 *
 * @remarks Constructed internally by normalizing user-supplied font entries. The provider uses these to build CSS import URLs.
 *
 * @example
 * ```ts
 * const entry: FontsProviderFontEntry = {
 *   name: 'Roboto',
 *   weights: ['400', '700'],
 *   italic: true,
 * }
 * ```
 */
export interface FontsProviderFontEntry {
	/** Font family name as recognized by the provider (e.g. `'Roboto'`). */
	name: string
	/** Font weight values to load (e.g. `['400', '700']`). */
	weights: string[]
	/** Whether to include italic variants for the requested weights. */
	italic: boolean
	/**
	 * Per-font provider options that override global provider options.
	 *
	 * @default undefined
	 */
	options?: FontsProviderOptions
}

/**
 * Runtime context passed to a provider's `buildImportUrls` callback.
 *
 * @remarks Assembled from the resolved plugin configuration during engine setup.
 *
 * @example
 * ```ts
 * const ctx: FontsProviderContext = {
 *   provider: 'google',
 *   display: 'swap',
 *   options: { text: 'Hello' },
 * }
 * ```
 */
export interface FontsProviderContext {
	/** The provider identifier this context belongs to. */
	provider: FontsProvider
	/** CSS `font-display` value applied to all fonts from this provider. */
	display: string
	/** Provider-level options merged from `providerOptions` configuration. */
	options: FontsProviderOptions
}

/**
 * Blueprint for a font provider that converts font entries into CSS import URLs.
 *
 * @remarks Register custom providers via `FontsPluginOptions.providers` using `defineFontsProvider`.
 *
 * @example
 * ```ts
 * const myProvider: FontsProviderDefinition = {
 *   buildImportUrls(fonts, ctx) {
 *     return fonts.map(f => `https://my-cdn.com/css?family=${f.name}`)
 *   },
 * }
 * ```
 */
export interface FontsProviderDefinition {
	/**
	 * Generates one or more CSS import URLs for the given font entries.
	 *
	 * @default undefined
	 */
	buildImportUrls?: (
		fonts: readonly FontsProviderFontEntry[],
		context: FontsProviderContext,
	) => string | string[] | null | undefined
}

/**
 * Identity helper that defines a font provider with full type inference.
 *
 * @typeParam T - The provider definition shape, inferred from the argument.
 * @param provider - The provider definition object.
 * @returns The same provider definition, typed as `T`.
 *
 * @remarks Provides type safety without any runtime transformation.
 *
 * @example
 * ```ts
 * const myProvider = defineFontsProvider({
 *   buildImportUrls(fonts, ctx) {
 *     return fonts.map(f => `https://cdn.example.com/css?family=${f.name}`)
 *   },
 * })
 * ```
 */
export function defineFontsProvider<const T extends FontsProviderDefinition>(provider: T): T {
	return provider
}

/**
 * Registry mapping each built-in provider name to its implementation.
 *
 * @remarks Includes Google Fonts, Bunny Fonts, Fontshare, Coollabs (self-hosted Google proxy), and `none` (no-op).
 *
 * @example
 * ```ts
 * const urls = builtInFontsProviders.google.buildImportUrls?.(fonts, ctx)
 * ```
 */
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
		.replace(RE_WHITESPACE, '+')
}

function toProviderSlug(name: string) {
	return name.trim()
		.toLowerCase()
		.replace(RE_NON_ALPHANUMERIC, '-')
		.replace(RE_TRIM_DASHES, '')
}

function dedupeStrings(values: string[]) {
	return [...new Set(values.filter(Boolean))]
}
