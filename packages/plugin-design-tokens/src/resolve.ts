import type { TokenIR } from './ir'
import { resolveAliases, tokenPathToVariableName } from './naming'

export interface ResolvedToken {
	name: string
	value: string
	themeScope?: { selector?: string, media?: string }
}

/**
 * Resolve stage: turns a single `TokenIR` node into its final CSS variable name
 * and value, expanding aliases with the token's effective prefix.
 *
 * @param ir - The token to resolve.
 * @param prefix - Fallback prefix used when the token carries no per-source
 * `prefix` of its own (see {@link TokenIR.prefix}).
 *
 * @remarks A token's own `prefix` (from a per-source entry) takes precedence over
 * the fallback and applies to both its variable name and its internal `{a.b.c}`
 * alias targets. External aliases emit `var(--external)` verbatim, unprefixed.
 */
export function resolveToken(ir: TokenIR, prefix: string): ResolvedToken {
	const effectivePrefix = ir.prefix ?? prefix
	const name = tokenPathToVariableName(ir.path, effectivePrefix)
	let value: string
	switch (ir.kind.t) {
		case 'aliasInternal':
			value = `var(${tokenPathToVariableName(ir.kind.targetPath, effectivePrefix)})`
			break
		case 'aliasExternal':
			value = `var(${ir.kind.cssVar})`
			break
		default:
			value = resolveAliases(ir.kind.value, effectivePrefix)
			break
	}
	return { name, value, themeScope: ir.themeScope }
}
