import type { Variable, VariableObject, VariablesDefinition } from '@pikacss/core'
import type { TokenIR } from './ir'
import type { DesignTokensConfig, TokenLayer } from './types'
import { mergeTypeAutocomplete, resolveTypeAutocomplete } from './autocomplete'
import { resolveToken } from './resolve'

// A resolved variable value paired with the token's `$type` (for `$type`-driven
// autocomplete targets) and layer (for strict `semanticOnly` autocomplete hiding).
interface Entry {
	value: string
	type?: string
	layer?: TokenLayer
}

type MergedTypeAutocomplete = ReturnType<typeof mergeTypeAutocomplete>

// Builds the emitted `Variable` for one resolved token. A plain string is emitted
// (byte-identical to legacy output) unless the token needs a `VariableObject`:
// when a pruning override is configured, or when its `$type` maps to autocomplete
// targets. A `$type` absent from the merged map yields no `autocomplete` field, so
// the core `variables` system keeps its default (`'*'`).
function buildVariable(entry: Entry, config: DesignTokensConfig, merged: MergedTypeAutocomplete): Variable {
	const asValueOf = resolveTypeAutocomplete(entry.type, merged)
	const needsPrune = config.pruneUnused != null
	// Strict `semanticOnly` hides primitive-layer tokens from autocomplete
	// (rule 8, emit-time), regardless of whether they are ever used.
	const hidePrimitive = config.strict?.semanticOnly === true && entry.layer === 'primitive'
	if (asValueOf === undefined && !needsPrune && !hidePrimitive)
		return entry.value
	const variable: VariableObject = { value: entry.value }
	if (needsPrune)
		variable.pruneUnused = config.pruneUnused
	if (hidePrimitive)
		variable.autocomplete = { asValueOf: '-', asProperty: false }
	else if (asValueOf !== undefined)
		variable.autocomplete = { asValueOf }
	return variable
}

/**
 * Emit stage: builds a `VariablesDefinition` from normalized tokens.
 *
 * @remarks Base tokens are emitted as top-level `--*` variables; theme tokens
 * are grouped under their resolved selector. When a theme carries a `media`
 * query, its variables are ADDITIONALLY emitted under an `@media <media>` scope
 * wrapping `:root` (a nested `VariablesDefinition`, which the core `variables`
 * system resolves). A token whose `$type` is present in the merged
 * {@link import('./autocomplete').DEFAULT_TYPE_AUTOCOMPLETE} map (overridable via
 * {@link DesignTokensConfig.typeAutocomplete}) emits
 * `VariableObject.autocomplete.asValueOf` so it is suggested as a `var()` value
 * for those CSS properties. Within each scope, later tokens override earlier ones
 * with the same name (last write wins), matching the legacy merge semantics.
 */
export function buildVariablesDefinition(irNodes: TokenIR[], config: DesignTokensConfig): VariablesDefinition {
	const prefix = config.prefix ?? ''
	const merged = mergeTypeAutocomplete(config.typeAutocomplete)
	const definition: VariablesDefinition = {}

	const baseEntries = new Map<string, Entry>()
	for (const ir of irNodes) {
		if (ir.themeScope != null)
			continue
		const { name, value } = resolveToken(ir, prefix)
		baseEntries.set(name, { value, type: ir.type, layer: ir.layer })
	}
	for (const [name, entry] of baseEntries)
		definition[name as `--${string}`] = buildVariable(entry, config, merged)

	// Group theme tokens by their resolved selector (and additionally by media
	// query when configured), preserving first-appearance order so the emitted
	// scope blocks keep a stable order.
	const selectorEntries = new Map<string, Map<string, Entry>>()
	const mediaEntries = new Map<string, Map<string, Entry>>()
	for (const ir of irNodes) {
		if (ir.themeScope == null)
			continue
		const { name, value, themeScope } = resolveToken(ir, prefix)
		const entry: Entry = { value, type: ir.type, layer: ir.layer }
		const selector = themeScope!.selector!
		const forSelector = selectorEntries.get(selector) ?? new Map<string, Entry>()
		selectorEntries.set(selector, forSelector)
		forSelector.set(name, entry)
		if (themeScope!.media != null) {
			const media = themeScope!.media
			const forMedia = mediaEntries.get(media) ?? new Map<string, Entry>()
			mediaEntries.set(media, forMedia)
			forMedia.set(name, entry)
		}
	}

	const buildScoped = (entries: Map<string, Entry>): VariablesDefinition => {
		const scoped: VariablesDefinition = {}
		for (const [name, entry] of entries)
			scoped[name as `--${string}`] = buildVariable(entry, config, merged)
		return scoped
	}

	for (const [selector, entries] of selectorEntries) {
		// Each selector is a unique map key (same-selector themes were already
		// merged into `entries`), so a plain assignment is sufficient.
		definition[selector] = buildScoped(entries)
	}

	for (const [media, entries] of mediaEntries) {
		// Core resolves nested non-'--' scope keys, so express the media wrapper as
		// a nested `VariablesDefinition` around `:root`.
		definition[`@media ${media}`] = { ':root': buildScoped(entries) }
	}

	return definition
}
