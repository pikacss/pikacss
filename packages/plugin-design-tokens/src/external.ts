import { isPlainObjectRecord } from '@pikacss/core'

/**
 * The `$extensions` namespace key PikaCSS reads its own design-token metadata
 * from. An external-alias marker lives at
 * `$extensions["com.pikacss.design-tokens"]`.
 */
export const PIKACSS_EXTENSION_KEY = 'com.pikacss.design-tokens'

/**
 * The result of inspecting a token node for an external-alias marker.
 *
 * - `none` — no external marker is present; treat the node as an ordinary token.
 * - `invalid` — a marker is present but malformed (`external` is not `true`, or
 *   `var` is missing / not a `--`-prefixed string); the caller must warn and skip.
 * - `external` — a valid external alias pointing at the externally-owned
 *   `cssVar`.
 */
export type ExternalMarker
	= | { kind: 'none' }
		| { kind: 'invalid' }
		| { kind: 'external', cssVar: string }

// Returns the PikaCSS marker object from a node's `$extensions`, or null when
// the node carries no such marker.
function readMarkerObject(node: unknown): Record<string, unknown> | null {
	if (!isPlainObjectRecord(node))
		return null
	const ext = node.$extensions
	if (!isPlainObjectRecord(ext))
		return null
	const marker = ext[PIKACSS_EXTENSION_KEY]
	return isPlainObjectRecord(marker) ? marker : null
}

/**
 * Reports whether a node declares itself an external alias (`external: true`).
 *
 * @remarks Used by the DTCG normalizer to treat a marker-bearing node as a leaf
 * token even when it carries no `$value`, so it is not descended into as a group
 * and destroyed before the flatten stage can read it. Validation of the `var`
 * field is deferred to {@link readExternalMarker}.
 */
export function hasExternalMarker(node: unknown): node is Record<string, unknown> {
	const marker = readMarkerObject(node)
	return marker != null && marker.external === true
}

/**
 * Inspects a token node for a PikaCSS external-alias marker and classifies it.
 *
 * @param node - The token node (or arbitrary value) to inspect.
 * @returns `none` when no marker is present, `invalid` when a marker is present
 * but malformed, or `external` with the validated externally-owned `cssVar`.
 *
 * @remarks A marker is authoritative: when both a marker and a `$value` exist,
 * the marker wins. A node whose marker has no `external` key is not treated as an
 * external declaration at all (the marker is carried through as ordinary
 * `$extensions` metadata). A marker with `external` set to anything other than
 * boolean `true`, or with a missing / malformed `var`, is `invalid`.
 */
export function readExternalMarker(node: unknown): ExternalMarker {
	const marker = readMarkerObject(node)
	if (marker == null || !('external' in marker))
		return { kind: 'none' }
	if (marker.external !== true)
		return { kind: 'invalid' }
	const cssVar = marker.var
	if (typeof cssVar !== 'string' || !cssVar.startsWith('--'))
		return { kind: 'invalid' }
	return { kind: 'external', cssVar }
}
