import type { Arrayable, Diagnostic, DiagnosticHandler, EnginePlugin, VariablesDefinition } from '@pikacss/core'
import { defineEnginePlugin, isPlainObjectRecord, log } from '@pikacss/core'
import { isAbsolute, resolve } from 'pathe'

const noopDiagnosticHandler: DiagnosticHandler = (_diagnostic) => {}

/**
 * A single design token value as defined by the W3C Design Tokens draft.
 *
 * @remarks Strings may contain alias references in the form `{path.to.token}`, which are resolved to `var(--path-to-token)` in the generated CSS.
 */
export type DesignTokenValue = string | number | boolean | DesignTokenValue[] | { [key: string]: DesignTokenValue }

/**
 * A design token node: an object carrying a `$value` plus optional metadata.
 *
 * @example
 * ```ts
 * const token: DesignToken = { $value: '#3b82f6', $type: 'color', $description: 'Primary brand color' }
 * ```
 */
export interface DesignToken {
	/** The token value. Strings may reference other tokens via `{path.to.token}`. */
	$value: DesignTokenValue
	/** Optional token type (e.g. `'color'`, `'dimension'`, `'shadow'`, `'fontFamily'`). */
	$type?: string
	/** Optional human-readable description. */
	$description?: string
}

/**
 * A nested group of design tokens following the W3C Design Tokens format.
 *
 * @remarks Keys are group or token names. A node with a `$value` property is a token; any other object is a nested group.
 *
 * @example
 * ```ts
 * const tokens: DesignTokenGroup = {
 *   color: {
 *     primary: { $value: '#3b82f6', $type: 'color' },
 *     accent: { $value: '{color.primary}' },
 *   },
 * }
 * ```
 */
export interface DesignTokenGroup {
	[name: string]: DesignToken | DesignTokenGroup | DesignTokenValue
}

/**
 * A design token source: an inline `DesignTokenGroup` object or a file path.
 *
 * @remarks File paths ending in `.md` are parsed as design documents (tokens are read from ` ```tokens ` fenced code blocks). Any other extension is parsed as a W3C Design Tokens JSON file. Relative paths resolve against `DesignTokensConfig.root`.
 */
export type DesignTokensSource = string | DesignTokenGroup

/** Runtime capabilities used to load optional file-backed token sources. */
export interface DesignTokensRuntimeOptions {
	/** Reads a UTF-8 token source from an absolute path. */
	readFile?: (filepath: string) => Promise<string>
	/** Returns the host working directory used when `DesignTokensConfig.root` is omitted. */
	cwd?: () => string
}

/**
 * Per-theme design token configuration.
 *
 * @example
 * ```ts
 * const dark: DesignTokensTheme = {
 *   selector: '[data-theme="dark"]',
 *   sources: { color: { primary: { $value: '#60a5fa' } } },
 * }
 * ```
 */
export interface DesignTokensTheme {
	/**
	 * The CSS selector scoping this theme's variables.
	 *
	 * @default `.${themeName}`
	 */
	selector?: string
	/** Token sources providing this theme's overrides. */
	sources?: Arrayable<DesignTokensSource>
}

/**
 * Configuration object for the `designTokens` engine option.
 *
 * @example
 * ```ts
 * const config: DesignTokensConfig = {
 *   sources: ['./design.md'],
 *   themes: { dark: { sources: ['./design.dark.tokens.json'] } },
 * }
 * ```
 */
export interface DesignTokensConfig {
	/** Base token sources emitted under `:root`. Later sources override earlier ones when names collide. */
	sources?: Arrayable<DesignTokensSource>

	/** Theme overrides keyed by theme name. Tokens are emitted under the theme's selector. */
	themes?: Record<string, DesignTokensTheme>

	/**
	 * Prefix prepended to every generated CSS variable name (without leading `--`).
	 *
	 * @default '' (no prefix)
	 */
	prefix?: string

	/**
	 * Base directory used to resolve relative source file paths.
	 *
	 * @default The host runtime's working directory; `'.'` when no capability is provided.
	 */
	root?: string

	/**
	 * Pruning override applied to every generated variable. When unset, the `variables` config default applies.
	 *
	 * @default undefined
	 */
	pruneUnused?: boolean
}

declare module '@pikacss/core' {
	interface EngineConfig {
		/**
		 * Design tokens configuration. Tokens are converted to CSS variables via the `variables` system.
		 *
		 * @default undefined
		 */
		designTokens?: DesignTokensConfig
	}
}

interface ResolvedTokenEntry {
	name: string
	value: string
}

interface ParsedThemeBlock {
	theme: string
	selector?: string
	tokens: DesignTokenGroup
}

interface LoadedSources {
	base: DesignTokenGroup[]
	themeBlocks: ParsedThemeBlock[]
	files: string[]
}

const ALIAS_RE = /\{([^}]+)\}/g
const TOKENS_FENCE_RE = /^```tokens([^\n]*)\n([\s\S]*?)^```/gm

function reportDiagnostic(onDiagnostic: DiagnosticHandler, diagnostic: Diagnostic) {
	if (onDiagnostic === noopDiagnosticHandler) {
		const args = diagnostic.cause == null ? [] : [diagnostic.cause]
		if (diagnostic.level === 'error')
			log.error(diagnostic.message, ...args)
		else
			log.warn(diagnostic.message, ...args)
		return
	}
	try {
		onDiagnostic({ plugin: 'design-tokens', ...diagnostic })
	}
	catch {
		// Diagnostic delivery must not replace token parsing or resolution results.
	}
}

function normalizeNameSegment(segment: string): string {
	return segment
		.trim()
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/[\s._]+/g, '-')
		.replace(/[^a-z0-9-]/gi, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^-|-$/g, '')
		.toLowerCase()
}

/**
 * Converts a token path into its generated CSS variable name.
 *
 * @param path - The token path segments (e.g. `['color', 'primary']`).
 * @param prefix - Optional variable name prefix (without leading `--`).
 * @returns The CSS variable name including the `--` prefix.
 *
 * @remarks Each segment is kebab-cased (`fontSize` → `font-size`), then segments are joined with `-`. Alias references (`{color.primary}`) use the same normalization, so aliases always resolve to the emitted variable name.
 *
 * @example
 * ```ts
 * tokenPathToVariableName(['color', 'primary'])          // '--color-primary'
 * tokenPathToVariableName(['font', 'size'], 'app')       // '--app-font-size'
 * ```
 */
export function tokenPathToVariableName(path: string[], prefix = ''): `--${string}` {
	const segments = [...(prefix === '' ? [] : [prefix]), ...path]
		.map(normalizeNameSegment)
		.filter(s => s.length > 0)
	return `--${segments.join('-')}`
}

function resolveAliases(value: string, prefix: string): string {
	return value.replace(ALIAS_RE, (_, aliasPath: string) => {
		const name = tokenPathToVariableName(aliasPath.split('.'), prefix)
		return `var(${name})`
	})
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return isPlainObjectRecord(value)
}

function isTokenNode(value: unknown): value is DesignToken {
	return isRecord(value) && '$value' in value
}

function serializeCompositeValue(value: Record<string, unknown>, type: string | undefined, prefix: string): string | null {
	const get = (key: string) => {
		const v = value[key]
		return v == null ? null : serializeScalar(v, prefix)
	}
	if (type === 'shadow') {
		const parts = [
			value.inset === true ? 'inset' : null,
			get('offsetX') ?? '0',
			get('offsetY') ?? '0',
			get('blur'),
			get('spread'),
			get('color'),
		].filter((p): p is string => p != null)
		return parts.join(' ')
	}
	if (type === 'border') {
		const parts = [get('width'), get('style'), get('color')].filter((p): p is string => p != null)
		return parts.join(' ')
	}
	if (type === 'transition') {
		const parts = [get('duration'), get('timingFunction'), get('delay')].filter((p): p is string => p != null)
		return parts.join(' ')
	}
	return null
}

function serializeScalar(value: unknown, prefix: string): string {
	if (typeof value === 'string')
		return resolveAliases(value.trim(), prefix)
	return String(value)
}

function serializeTokenValue(value: DesignTokenValue, type: string | undefined, prefix: string): string | null {
	if (Array.isArray(value)) {
		const parts = value
			.map(item => serializeTokenValue(item, type, prefix))
			.filter((p): p is string => p != null)
		return parts.length > 0 ? parts.join(', ') : null
	}
	if (isRecord(value))
		return serializeCompositeValue(value, type, prefix)
	return serializeScalar(value, prefix)
}

function flattenTokenGroup({
	group,
	path,
	prefix,
	entries,
	onDiagnostic,
}: {
	group: DesignTokenGroup
	path: string[]
	prefix: string
	entries: ResolvedTokenEntry[]
	onDiagnostic: DiagnosticHandler
}): ResolvedTokenEntry[] {
	for (const [key, node] of Object.entries(group)) {
		if (key.startsWith('$'))
			continue

		const currentPath = [...path, key]
		if (isTokenNode(node)) {
			const type = typeof node.$type === 'string' ? node.$type : undefined
			const serialized = serializeTokenValue(node.$value, type, prefix)
			if (serialized == null) {
				// Composite value without a dedicated serializer: expand each field
				// into a sub-variable (e.g. typography.$value.fontSize -> --*-font-size).
				if (isPlainObjectRecord(node.$value)) {
					flattenTokenGroup({
						group: Object.fromEntries(
							Object.entries(node.$value)
								.map(([k, v]) => [k, { $value: v }]),
						) as DesignTokenGroup,
						path: currentPath,
						prefix,
						entries,
						onDiagnostic,
					})
				}
				else {
					const message = `[design-tokens] Unsupported value for token "${currentPath.join('.')}". Skipping.`
					reportDiagnostic(onDiagnostic, { level: 'warning', code: 'design-tokens-unsupported-value', message })
				}
				continue
			}
			entries.push({
				name: tokenPathToVariableName(currentPath, prefix),
				value: serialized,
			})
			continue
		}
		if (isPlainObjectRecord(node)) {
			flattenTokenGroup({ group: node as DesignTokenGroup, path: currentPath, prefix, entries, onDiagnostic })
			continue
		}
		const message = `[design-tokens] Invalid token node at "${currentPath.join('.')}". Expected an object with $value or a nested group. Skipping.`
		reportDiagnostic(onDiagnostic, { level: 'warning', code: 'design-tokens-invalid-node', message })
	}
	return entries
}

function parseFenceAttrs(attrs: string): { theme?: string, selector?: string } {
	const result: { theme?: string, selector?: string } = {}
	const re = /(theme|selector)=(?:"([^"]*)"|'([^']*)'|(\S+))/g
	for (const match of attrs.matchAll(re)) {
		const key = match[1] as 'theme' | 'selector'
		result[key] = match[2] ?? match[3] ?? match[4]
	}
	return result
}

/**
 * Extracts design token blocks from a markdown design document.
 *
 * @param content - The markdown source (e.g. the content of a `design.md` file).
 * @param onDiagnostic - Optional handler for malformed token blocks.
 * @returns The parsed base token groups and theme-scoped token blocks.
 *
 * @remarks Only fenced code blocks whose info string starts with `tokens` are read; all other markdown content is ignored.
 * The info string may carry `theme=<name>` and `selector=<css-selector>` attributes.
 * Block content must be valid JSON in the W3C Design Tokens format; invalid blocks are skipped with a warning.
 *
 * @example
 * ```ts
 * const { base, themeBlocks } = parseDesignMarkdown(await readFile('design.md', 'utf-8'))
 * ```
 */
export function parseDesignMarkdown(content: string, onDiagnostic: DiagnosticHandler = noopDiagnosticHandler): { base: DesignTokenGroup[], themeBlocks: ParsedThemeBlock[] } {
	const base: DesignTokenGroup[] = []
	const themeBlocks: ParsedThemeBlock[] = []
	for (const match of content.matchAll(TOKENS_FENCE_RE)) {
		const attrs = parseFenceAttrs(match[1]!)
		let parsed: unknown
		try {
			parsed = JSON.parse(match[2]!)
		}
		catch (error: unknown) {
			const message = `[design-tokens] Failed to parse tokens block: ${error instanceof Error ? error.message : String(error)}. Skipping.`
			reportDiagnostic(onDiagnostic, { level: 'warning', code: 'design-tokens-invalid-markdown-json', message, cause: error })
			continue
		}
		if (!isPlainObjectRecord(parsed)) {
			const message = '[design-tokens] Tokens block must contain a JSON object. Skipping.'
			reportDiagnostic(onDiagnostic, { level: 'warning', code: 'design-tokens-invalid-markdown-root', message })
			continue
		}
		if (attrs.theme != null) {
			themeBlocks.push({ theme: attrs.theme, selector: attrs.selector, tokens: parsed as DesignTokenGroup })
		}
		else {
			base.push(parsed as DesignTokenGroup)
		}
	}
	return { base, themeBlocks }
}

async function loadSource({
	source,
	root,
	loaded,
	runtime,
	onDiagnostic,
}: {
	source: DesignTokensSource
	root: string
	loaded: LoadedSources
	runtime: DesignTokensRuntimeOptions
	onDiagnostic: DiagnosticHandler
}): Promise<DesignTokenGroup[]> {
	if (typeof source !== 'string')
		return [source]

	if (runtime.readFile == null) {
		const message = `[design-tokens] File source "${source}" requires the Node.js adapter. Import designTokens from "@pikacss/plugin-design-tokens/node" or provide a custom readFile capability.`
		reportDiagnostic(onDiagnostic, { level: 'warning', code: 'design-tokens-file-loader-unavailable', message })
		return []
	}

	const filepath = isAbsolute(source) ? resolve(source) : resolve(root, source)
	// Record the path before attempting to read it: a missing file must still be
	// registered as a config dependency so creating it later triggers a reload.
	loaded.files.push(filepath)
	let content: string
	try {
		content = await runtime.readFile(filepath)
	}
	catch (error: unknown) {
		const message = `[design-tokens] Failed to read token source "${filepath}": ${error instanceof Error ? error.message : String(error)}. Skipping.`
		reportDiagnostic(onDiagnostic, { level: 'error', code: 'design-tokens-read-error', message, cause: error })
		return []
	}

	if (filepath.endsWith('.md')) {
		const { base, themeBlocks } = parseDesignMarkdown(content, onDiagnostic)
		loaded.themeBlocks.push(...themeBlocks)
		return base
	}

	try {
		const parsed = JSON.parse(content)
		if (!isPlainObjectRecord(parsed)) {
			const message = `[design-tokens] Token source "${filepath}" must contain a JSON object. Skipping.`
			reportDiagnostic(onDiagnostic, { level: 'warning', code: 'design-tokens-invalid-file-root', message })
			return []
		}
		return [parsed as DesignTokenGroup]
	}
	catch (error: unknown) {
		const message = `[design-tokens] Failed to parse token source "${filepath}": ${error instanceof Error ? error.message : String(error)}. Skipping.`
		reportDiagnostic(onDiagnostic, { level: 'error', code: 'design-tokens-invalid-file-json', message, cause: error })
		return []
	}
}

async function loadAllSources(
	config: DesignTokensConfig,
	runtime: DesignTokensRuntimeOptions,
	onDiagnostic: DiagnosticHandler,
): Promise<LoadedSources> {
	const root = config.root ?? runtime.cwd?.() ?? '.'
	const loaded: LoadedSources = { base: [], themeBlocks: [], files: [] }

	for (const source of [config.sources ?? []].flat()) {
		loaded.base.push(...await loadSource({ source, root, loaded, runtime, onDiagnostic }))
	}

	for (const [themeName, theme] of Object.entries(config.themes ?? {})) {
		for (const source of [theme.sources ?? []].flat()) {
			const groups = await loadSource({ source, root, loaded, runtime, onDiagnostic })
			loaded.themeBlocks.push(...groups.map(tokens => ({
				theme: themeName,
				selector: theme.selector,
				tokens,
			})))
		}
	}

	return loaded
}

function buildVariablesDefinition({
	loaded,
	config,
	onDiagnostic,
}: {
	loaded: LoadedSources
	config: DesignTokensConfig
	onDiagnostic: DiagnosticHandler
}): VariablesDefinition {
	const prefix = config.prefix ?? ''
	const definition: VariablesDefinition = {}

	const baseEntries = new Map<string, string>()
	for (const group of loaded.base) {
		for (const { name, value } of flattenTokenGroup({ group, path: [], prefix, entries: [], onDiagnostic }))
			baseEntries.set(name, value)
	}
	for (const [name, value] of baseEntries) {
		definition[name as `--${string}`] = config.pruneUnused == null
			? value
			: { value, pruneUnused: config.pruneUnused }
	}

	const themeSelectors = new Map<string, string>()
	const themeEntries = new Map<string, Map<string, string>>()
	for (const block of loaded.themeBlocks) {
		const configuredSelector = config.themes?.[block.theme]?.selector
		const selector = block.selector ?? configuredSelector ?? `.${block.theme}`
		if (!themeSelectors.has(block.theme))
			themeSelectors.set(block.theme, selector)

		const entries = themeEntries.get(block.theme) ?? new Map<string, string>()
		themeEntries.set(block.theme, entries)
		for (const { name, value } of flattenTokenGroup({ group: block.tokens, path: [], prefix, entries: [], onDiagnostic }))
			entries.set(name, value)
	}

	for (const [themeName, entries] of themeEntries) {
		if (entries.size === 0)
			continue
		const selector = themeSelectors.get(themeName)!
		const scoped: VariablesDefinition = {}
		for (const [name, value] of entries) {
			scoped[name as `--${string}`] = config.pruneUnused == null
				? value
				: { value, pruneUnused: config.pruneUnused }
		}
		definition[selector] = Object.assign(definition[selector] ?? {}, scoped)
	}

	return definition
}

/**
 * PikaCSS engine plugin that converts design tokens (W3C Design Tokens JSON or `design.md` documents) into CSS variables.
 *
 * @param runtime - Optional host capabilities for resolving file-backed sources.
 * @returns An `EnginePlugin` that reads `EngineConfig.designTokens`, loads all token sources, and merges the resulting variables into `EngineConfig.variables`.
 *
 * @remarks The neutral entry accepts inline token objects. File-backed sources require the `/node` adapter or a custom runtime capability. Tokens flow through the core `variables` system and loaded files are registered as config dependencies.
 *
 * @example
 * ```ts
 * import { designTokens } from '@pikacss/plugin-design-tokens/node'
 *
 * export default defineEngineConfig({
 *   plugins: [designTokens()],
 *   designTokens: {
 *     sources: ['./design.md'],
 *     themes: { dark: { selector: '.dark' } },
 *   },
 * })
 * ```
 */
export function designTokens(runtime: DesignTokensRuntimeOptions = {}): EnginePlugin {
	let loadedFiles: string[] = []
	return defineEnginePlugin({
		name: 'design-tokens',
		order: 'pre',
		configureRawConfig: async (config, context) => {
			const tokensConfig = config.designTokens
			if (tokensConfig == null)
				return

			const onDiagnostic = context?.onDiagnostic ?? noopDiagnosticHandler
			const loaded = await loadAllSources(tokensConfig, runtime, onDiagnostic)
			loadedFiles = loaded.files

			const definition = buildVariablesDefinition({ loaded, config: tokensConfig, onDiagnostic })
			if (Object.keys(definition).length === 0)
				return

			config.variables ??= {}
			config.variables.definitions = [
				...[config.variables.definitions ?? []].flat(),
				definition,
			]
		},
		configureEngine: (engine) => {
			loadedFiles.forEach(file => engine.addConfigDependency(file))
		},
	})
}
