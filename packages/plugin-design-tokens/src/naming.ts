const ALIAS_RE = /\{([^}]+)\}/g

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

/**
 * Replaces every inline `{path}` alias in a string with the matching
 * `var(--...)` reference, using the same name normalization as
 * {@link tokenPathToVariableName}.
 */
export function resolveAliases(value: string, prefix: string): string {
	return value.replace(ALIAS_RE, (_, aliasPath: string) => {
		const name = tokenPathToVariableName(aliasPath.split('.'), prefix)
		return `var(${name})`
	})
}
