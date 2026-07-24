import type { DesignTokenGroup, TokenLayer } from './types'

/**
 * The kind of value a normalized token carries.
 *
 * @remarks
 * - `value` holds a serialized literal string. It may still contain inline
 *   `{path}` alias references, which the resolve stage expands.
 * - `aliasInternal` marks a token whose whole value is a single `{path}`
 *   reference to another token in the same set.
 * - `aliasExternal` is reserved for the external-alias batch and is not
 *   produced by the current pipeline.
 */
export type TokenKind
	= | { t: 'value', value: string }
		| { t: 'aliasInternal', targetPath: string[] }
		| { t: 'aliasExternal', cssVar: string }

/**
 * Selector scope of a token. Base tokens carry no scope; theme tokens carry the
 * resolved CSS selector, and optionally the theme's `media` query when configured
 * via {@link import('./types').DesignTokensTheme.media}.
 */
export interface TokenThemeScope {
	selector?: string
	media?: string
}

/**
 * The internal intermediate representation of a single design token, produced by
 * the normalize stage and consumed by the resolve/emit stages.
 */
export interface TokenIR {
	path: string[]
	type?: string
	description?: string
	extensions?: Record<string, unknown>
	deprecated?: boolean
	kind: TokenKind
	themeScope?: TokenThemeScope
	/**
	 * The effective prefix for this token's source (per-source `prefix` overriding
	 * the global config prefix). Applied to the token's own variable name and to
	 * its `{a.b.c}` alias resolution. When unset, the resolve stage falls back to
	 * the global prefix.
	 */
	prefix?: string
	/** The architectural layer declared for this token's source, if any. */
	layer?: TokenLayer
}

/**
 * A theme-scoped token block parsed from a markdown design document or produced
 * from a theme's configured sources.
 */
export interface ParsedThemeBlock {
	theme: string
	selector?: string
	tokens: DesignTokenGroup
	/** Effective prefix for this block's source (see {@link TokenIR.prefix}). */
	prefix?: string
	/** Layer declared for this block's source, if any. */
	layer?: TokenLayer
}

/**
 * Per-source metadata aligned by index with {@link LoadedSources.base}. Carries
 * the effective prefix and layer that the flatten stage stamps onto each token.
 */
export interface SourceMeta {
	prefix?: string
	layer?: TokenLayer
}

/**
 * The raw material collected by the load stage before normalization.
 */
export interface LoadedSources {
	base: DesignTokenGroup[]
	themeBlocks: ParsedThemeBlock[]
	files: string[]
	/**
	 * Per-source metadata aligned by index with {@link LoadedSources.base}. Optional
	 * so callers that construct a `LoadedSources` directly (e.g. tests) can omit it;
	 * when absent the flatten stage applies default (no prefix / no layer) metadata.
	 */
	baseMeta?: SourceMeta[]
}
