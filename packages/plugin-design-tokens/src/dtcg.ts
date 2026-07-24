import type { DesignTokenGroup } from './types'
import { isPlainObjectRecord, log } from '@pikacss/core'
import { dirname, isAbsolute, resolve } from 'pathe'
import { hasExternalMarker } from './external'
import { tokenPathToVariableName } from './naming'

/**
 * Context the bundled DTCG normalizer needs to resolve cross-file `$ref`
 * pointers. Unlike the public {@link import('./types').DesignTokensNormalizer}
 * seam (which only exposes sibling source *ids*), the bundled normalizer needs
 * the sibling source *contents* to validate pointer targets, so it runs behind
 * an internal context instead.
 */
export interface DtcgCtx {
	/** Resolved id of the source being normalized (`'inline'` for inline object sources). */
	id: string
	/** Resolved source id → the list of raw contents loaded for that id (a `.md` file yields several). */
	contentById: ReadonlyMap<string, unknown[]>
	/**
	 * Resolved source id → its effective variable-name prefix. Used to name a
	 * cross-source `$ref` with the *target* source's prefix. Optional; when a
	 * source id is absent (or the whole map is), the empty prefix `''` is assumed.
	 */
	prefixById?: ReadonlyMap<string, string>
}

interface Inherited {
	type?: string
	deprecated: boolean
}

function isTokenNode(node: unknown): node is Record<string, unknown> {
	return isPlainObjectRecord(node) && '$value' in node
}

// A `$ref` node is a token expressed purely as a reference: it carries `$ref`
// and, per the DTCG draft, no `$value` of its own.
function isRefNode(node: unknown): node is Record<string, unknown> {
	return isPlainObjectRecord(node) && '$ref' in node && !('$value' in node)
}

// Parses a JSON pointer fragment (the part after `#`) into path segments.
// Returns null for anything that is not a non-root pointer (`/a/b`), including
// the empty (whole-document) pointer, so malformed refs are skipped rather than
// producing a nonsensical alias.
function parseJsonPointer(fragment: string): string[] | null {
	if (fragment === '' || !fragment.startsWith('/'))
		return null
	const segments = fragment
		.split('/')
		.slice(1)
		.map(s => s.replace(/~1/g, '/')
			.replace(/~0/g, '~'))
	if (segments.some(s => s.length === 0))
		return null
	return segments
}

// Splits a `$ref` string into its file part and JSON-pointer path. Returns null
// for bad syntax (missing `#`, or an invalid pointer fragment).
function parseRef(ref: string): { file: string, pointer: string[] } | null {
	const hash = ref.indexOf('#')
	if (hash === -1)
		return null
	const pointer = parseJsonPointer(ref.slice(hash + 1))
	if (pointer == null)
		return null
	return { file: ref.slice(0, hash), pointer }
}

// Resolves a `$ref` file part to a source id in `contentById`. An empty file
// part is a local ref (same source). Cross-file refs from inline sources cannot
// be resolved (no directory to resolve against).
function resolveTargetId(file: string, ctxId: string): string | null {
	if (file === '')
		return ctxId
	if (ctxId === 'inline')
		return null
	const base = dirname(ctxId)
	return isAbsolute(file) ? resolve(file) : resolve(base, file)
}

function lookupInContent(content: unknown, path: string[]): unknown {
	let cur: unknown = content
	for (const seg of path) {
		if (!isPlainObjectRecord(cur))
			return undefined
		cur = cur[seg]
	}
	return cur
}

function lookupPointer(contents: unknown[] | undefined, path: string[]): unknown {
	if (contents == null)
		return undefined
	for (const content of contents) {
		const node = lookupInContent(content, path)
		if (node !== undefined)
			return node
	}
	return undefined
}

// Walks a `$ref` chain to confirm the target exists and terminates, guarding
// against circular chains. The emitted alias always uses the *immediate*
// pointer path; this walk only decides whether to emit at all.
function validateRefChain(startId: string | null, startPointer: string[], contentById: ReadonlyMap<string, unknown[]>): 'ok' | 'notfound' | 'cycle' {
	const visited = new Set<string>()
	let curId = startId
	let curPointer = startPointer
	while (true) {
		if (curId == null)
			return 'notfound'
		const key = `${curId}#/${curPointer.join('/')}`
		if (visited.has(key))
			return 'cycle'
		visited.add(key)
		const node = lookupPointer(contentById.get(curId), curPointer)
		if (node === undefined)
			return 'notfound'
		if (!isRefNode(node))
			return 'ok'
		const ref = node.$ref
		if (typeof ref !== 'string')
			return 'notfound'
		const parsed = parseRef(ref)
		if (parsed == null)
			return 'notfound'
		curId = resolveTargetId(parsed.file, curId)
		curPointer = parsed.pointer
	}
}

// Rewrites a `$ref` token into an equivalent whole-value alias token so the
// downstream flatten/classify/resolve stages treat it as an internal alias. The
// alias path comes from the pointer segments, matching the target token's own
// generated variable name. Returns null (skip) for anything malformed.
function rewriteRef(node: Record<string, unknown>, groupType: string | undefined, groupDeprecated: boolean, ctx: DtcgCtx, path: string[]): Record<string, unknown> | null {
	const loc = path.join('.')
	const ref = node.$ref
	if (typeof ref !== 'string') {
		log.warn(`[design-tokens] $ref at "${loc}" must be a string. Skipping.`)
		return null
	}
	const parsed = parseRef(ref)
	if (parsed == null) {
		log.warn(`[design-tokens] Invalid $ref "${ref}" at "${loc}". Expected a JSON pointer like "file#/a/b". Skipping.`)
		return null
	}
	const targetId = resolveTargetId(parsed.file, ctx.id)
	if (targetId == null || !ctx.contentById.has(targetId)) {
		log.warn(`[design-tokens] $ref at "${loc}" points to unknown source "${parsed.file}". Skipping.`)
		return null
	}
	const status = validateRefChain(targetId, parsed.pointer, ctx.contentById)
	if (status === 'notfound') {
		log.warn(`[design-tokens] $ref at "${loc}" points to missing token "${parsed.pointer.join('.')}". Skipping.`)
		return null
	}
	if (status === 'cycle') {
		log.warn(`[design-tokens] Circular $ref detected at "${loc}". Skipping.`)
		return null
	}

	// Naming a `$ref` uses the *target* source's effective prefix. When target and
	// source share a prefix, keep the alias in `{a.b.c}` form so the resolve stage
	// expands it with that shared prefix (preserving legacy same-prefix behavior).
	// When they differ, resolve the target var name here — the resolve stage only
	// knows the source's prefix, so it cannot name a cross-prefix target itself.
	const sourcePrefix = ctx.prefixById?.get(ctx.id) ?? ''
	const targetPrefix = ctx.prefixById?.get(targetId) ?? ''
	const value = sourcePrefix === targetPrefix
		? `{${parsed.pointer.join('.')}}`
		: `var(${tokenPathToVariableName(parsed.pointer, targetPrefix)})`
	const out: Record<string, unknown> = { $value: value }
	const type = typeof node.$type === 'string' ? node.$type : groupType
	if (type != null)
		out.$type = type
	if (typeof node.$description === 'string')
		out.$description = node.$description
	if (isPlainObjectRecord(node.$extensions))
		out.$extensions = node.$extensions
	const deprecated = '$deprecated' in node ? node.$deprecated === true : groupDeprecated
	if (deprecated)
		out.$deprecated = true
	return out
}

// Applies group-level `$type` / `$deprecated` inheritance onto a token node
// (token's own value always wins).
function applyTokenInheritance(node: Record<string, unknown>, groupType: string | undefined, groupDeprecated: boolean): Record<string, unknown> {
	const out: Record<string, unknown> = { ...node }
	if (!('$type' in out) && groupType != null)
		out.$type = groupType
	const deprecated = '$deprecated' in node ? node.$deprecated === true : groupDeprecated
	if (deprecated)
		out.$deprecated = true
	else
		delete out.$deprecated
	return out
}

function walkGroup(group: Record<string, unknown>, inherited: Inherited, ctx: DtcgCtx, path: string[]): DesignTokenGroup {
	const groupType = typeof group.$type === 'string' ? group.$type : inherited.type
	const groupDeprecated = '$deprecated' in group ? group.$deprecated === true : inherited.deprecated
	const out: Record<string, unknown> = {}
	for (const [key, node] of Object.entries(group)) {
		// Reserved keys ($type, $description, $deprecated, $extensions,
		// $resolutionOrder, …) are never treated as child groups/tokens; their
		// meaning is captured above (inheritance) or safely ignored.
		if (key.startsWith('$'))
			continue
		const childPath = [...path, key]
		if (isRefNode(node)) {
			const rewritten = rewriteRef(node, groupType, groupDeprecated, ctx, childPath)
			if (rewritten != null)
				out[key] = rewritten
			continue
		}
		// An external-alias marker makes a node a leaf token even when it carries no
		// `$value`, so it must not be descended into as a group (which would drop its
		// `$`-prefixed keys and destroy it before the flatten stage reads the marker).
		if (isTokenNode(node) || hasExternalMarker(node)) {
			out[key] = applyTokenInheritance(node, groupType, groupDeprecated)
			continue
		}
		if (isPlainObjectRecord(node)) {
			out[key] = walkGroup(node, { type: groupType, deprecated: groupDeprecated }, ctx, childPath)
			continue
		}
		// Scalars / invalid nodes pass through untouched; the flatten stage warns.
		out[key] = node
	}
	return out as DesignTokenGroup
}

/**
 * The bundled DTCG normalizer. Enabled by default for every loaded source, it
 * canonicalizes a raw W3C Design Tokens value before the configured normalizer
 * chain runs:
 *
 * - resolves cross-file and local `$ref` JSON pointers into internal aliases,
 * - pushes group-level `$type` and `$deprecated` down onto descendant tokens,
 * - leaves reserved keys (`$resolutionOrder`, `$extensions`, `$description`,
 *   `$deprecated`, group-level `$type`) out of the emitted child set.
 *
 * @remarks Non-object inputs pass through unchanged so the flatten stage can warn
 * on them uniformly. Malformed `$ref` nodes (bad pointer syntax, non-string
 * `$ref`, unknown source, missing target, circular chain) are warned about and
 * skipped, never thrown or looped.
 */
export function applyDtcgNormalizer(raw: unknown, ctx: DtcgCtx): unknown {
	if (!isPlainObjectRecord(raw))
		return raw
	return walkGroup(raw, { type: undefined, deprecated: false }, ctx, [])
}
