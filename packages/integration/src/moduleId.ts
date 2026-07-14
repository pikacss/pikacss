import { isAbsolute, normalize, resolve } from 'pathe'

/**
 * Normalized identity of a bundler module id.
 *
 * @remarks
 * Bundler ids come in many shapes for the same physical file: absolute or
 * cwd-relative paths, ids with query strings (`App.vue?vue&type=script`), and
 * hash suffixes. All per-module state (usages, prepared results) must be keyed
 * by the same canonical form, which is `file`.
 */
export interface ParsedModuleId {
	/** Normalized absolute file path with query/hash stripped. */
	file: string
	/** Raw query string without the leading `?`, or `null` when the id has none. */
	query: string | null
	/** Lowercase file extension without the leading dot, or `''` when the file has none. */
	ext: string
}

/**
 * Parses a bundler module id into its canonical identity.
 *
 * @param id - A module id: absolute or `cwd`-relative file path, optionally carrying `?query` and/or `#hash` suffixes.
 * @param cwd - The base directory used to resolve relative ids.
 * @returns The {@link ParsedModuleId} with a normalized absolute `file`, the raw `query` (hash excluded), and the lowercase `ext`.
 *
 * @example
 * ```ts
 * parseModuleId('src/App.vue?vue&type=script', '/repo')
 * // { file: '/repo/src/App.vue', query: 'vue&type=script', ext: 'vue' }
 * ```
 */
export function parseModuleId(id: string, cwd: string): ParsedModuleId {
	const queryIndex = id.search(/[?#]/)
	const path = queryIndex === -1 ? id : id.slice(0, queryIndex)
	const query = queryIndex !== -1 && id[queryIndex] === '?'
		? id.slice(queryIndex + 1)
			.split('#', 1)[0]!
		: null

	const file = isAbsolute(path) ? normalize(path) : resolve(cwd, path)

	const lastSlash = file.lastIndexOf('/')
	const lastDot = file.lastIndexOf('.')
	const ext = lastDot > lastSlash + 1
		? file.slice(lastDot + 1)
				.toLowerCase()
		: ''

	return { file, query, ext }
}
