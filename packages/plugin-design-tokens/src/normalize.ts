import type { LoadedSources, TokenIR, TokenKind, TokenThemeScope } from './ir'
import type { DesignToken, DesignTokenGroup, DesignTokensConfig, DesignTokenValue, TokenLayer } from './types'
import { isPlainObjectRecord, log } from '@pikacss/core'
import { readExternalMarker } from './external'

// A whole-value alias: the entire (trimmed) string is a single `{path}` reference.
const WHOLE_ALIAS_RE = /^\{([^}]+)\}$/

function isTokenNode(value: unknown): value is DesignToken {
	return isPlainObjectRecord(value) && '$value' in value
}

// Structural serialization mirrors the runtime serializer but keeps inline
// `{path}` alias references intact; the resolve stage expands them once the
// prefix is known. This keeps the split byte-identical to inline resolution
// because the join separators never contain braces.
function serializeScalarStructure(value: unknown): string {
	if (typeof value === 'string')
		return value.trim()
	return String(value)
}

function serializeCompositeStructure(value: Record<string, unknown>, type: string | undefined): string | null {
	const get = (key: string) => {
		const v = value[key]
		return v == null ? null : serializeScalarStructure(v)
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

function serializeStructure(value: DesignTokenValue, type: string | undefined): string | null {
	if (Array.isArray(value)) {
		const parts = value
			.map(item => serializeStructure(item, type))
			.filter((p): p is string => p != null)
		return parts.length > 0 ? parts.join(', ') : null
	}
	if (isPlainObjectRecord(value))
		return serializeCompositeStructure(value, type)
	return serializeScalarStructure(value)
}

function classifyKind(rawValue: DesignTokenValue, serialized: string): TokenKind {
	if (typeof rawValue === 'string') {
		const match = rawValue.trim()
			.match(WHOLE_ALIAS_RE)
		if (match != null)
			return { t: 'aliasInternal', targetPath: match[1]!.split('.') }
	}
	return { t: 'value', value: serialized }
}

function normalizeGroup({
	group,
	path,
	themeScope,
	prefix,
	layer,
	out,
}: {
	group: DesignTokenGroup
	path: string[]
	themeScope: TokenThemeScope | undefined
	prefix: string | undefined
	layer: TokenLayer | undefined
	out: TokenIR[]
}): void {
	// Stamps the source's effective prefix / layer onto every IR this group emits.
	const stamp = (ir: TokenIR): TokenIR => {
		if (prefix != null)
			ir.prefix = prefix
		if (layer != null)
			ir.layer = layer
		return ir
	}
	for (const [key, node] of Object.entries(group)) {
		if (key.startsWith('$'))
			continue

		const currentPath = [...path, key]

		// External-alias marker is authoritative: it wins over any `$value` and is
		// emitted only under `:root` (the external runtime owns theming).
		const marker = readExternalMarker(node)
		if (marker.kind === 'invalid') {
			log.warn(`[design-tokens] Invalid external alias marker for token "${currentPath.join('.')}". Expected { external: true, var: "--custom-property" }. Skipping.`)
			continue
		}
		if (marker.kind === 'external') {
			if (themeScope != null) {
				log.warn(`[design-tokens] External alias token "${currentPath.join('.')}" cannot be themed; the external runtime owns theming. Skipping in theme scope.`)
				continue
			}
			// A valid external marker is only reported for object nodes.
			const tokenNode = node as Record<string, unknown>
			const type = typeof tokenNode.$type === 'string' ? tokenNode.$type : undefined
			const ir: TokenIR = {
				path: currentPath,
				type,
				kind: { t: 'aliasExternal', cssVar: marker.cssVar },
			}
			if (typeof tokenNode.$description === 'string')
				ir.description = tokenNode.$description
			if (tokenNode.$deprecated === true)
				ir.deprecated = true
			if (isPlainObjectRecord(tokenNode.$extensions))
				ir.extensions = tokenNode.$extensions
			out.push(stamp(ir))
			continue
		}

		if (isTokenNode(node)) {
			const type = typeof node.$type === 'string' ? node.$type : undefined
			const serialized = serializeStructure(node.$value, type)
			if (serialized == null) {
				// Composite value without a dedicated serializer: expand each field
				// into a sub-variable (e.g. typography.$value.fontSize -> --*-font-size).
				if (isPlainObjectRecord(node.$value)) {
					normalizeGroup({
						group: Object.fromEntries(
							Object.entries(node.$value)
								.map(([k, v]) => [k, { $value: v }]),
						) as DesignTokenGroup,
						path: currentPath,
						themeScope,
						prefix,
						layer,
						out,
					})
				}
				else {
					log.warn(`[design-tokens] Unsupported value for token "${currentPath.join('.')}". Skipping.`)
				}
				continue
			}
			const ir: TokenIR = {
				path: currentPath,
				type,
				kind: classifyKind(node.$value, serialized),
			}
			if (typeof node.$description === 'string')
				ir.description = node.$description
			if (node.$deprecated === true)
				ir.deprecated = true
			if (isPlainObjectRecord(node.$extensions))
				ir.extensions = node.$extensions
			if (themeScope != null)
				ir.themeScope = themeScope
			out.push(stamp(ir))
			continue
		}
		if (isPlainObjectRecord(node)) {
			normalizeGroup({ group: node as DesignTokenGroup, path: currentPath, themeScope, prefix, layer, out })
			continue
		}
		log.warn(`[design-tokens] Invalid token node at "${currentPath.join('.')}". Expected an object with $value or a nested group. Skipping.`)
	}
}

/**
 * Normalize stage: flattens loaded token groups into a flat `TokenIR[]`.
 *
 * @remarks Base tokens come first (no `themeScope`), followed by theme tokens
 * stamped with their resolved selector. The selector for a theme is decided by
 * the first block seen for that theme (`block.selector` → configured selector →
 * `.${theme}`), matching the legacy per-theme selector precedence.
 */
export function normalizeTokens(loaded: LoadedSources, config: DesignTokensConfig): TokenIR[] {
	const out: TokenIR[] = []

	loaded.base.forEach((group, index) => {
		const meta = loaded.baseMeta?.[index]
		normalizeGroup({ group, path: [], themeScope: undefined, prefix: meta?.prefix, layer: meta?.layer, out })
	})

	const themeSelectors = new Map<string, string>()
	for (const block of loaded.themeBlocks) {
		const configuredSelector = config.themes?.[block.theme]?.selector
		const selector = block.selector ?? configuredSelector ?? `.${block.theme}`
		if (!themeSelectors.has(block.theme))
			themeSelectors.set(block.theme, selector)
		// `media` is a config-only feature (no markdown fence attribute), so it is
		// always read from the theme config rather than the parsed block.
		const media = config.themes?.[block.theme]?.media
		const themeScope: TokenThemeScope = { selector: themeSelectors.get(block.theme)! }
		if (media != null)
			themeScope.media = media
		normalizeGroup({
			group: block.tokens,
			path: [],
			themeScope,
			prefix: block.prefix,
			layer: block.layer,
			out,
		})
	}

	return out
}
