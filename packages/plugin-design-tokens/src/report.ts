import type { Engine } from '@pikacss/core'

/**
 * A snapshot of design-token usage computed on demand from an engine's current
 * atomic-style store.
 *
 * @remarks Returned by `engine.designTokens.report()`. `used`/`unused` are the
 * registered design-token variable names (every kind, including external
 * aliases) partitioned by whether they are referenced — directly or through a
 * transitive `var()`-in-`var()` chain — by any atomic style. `strictViolations`
 * are cumulative counters of strict-mode diagnostics produced so far,
 * accumulated as diagnostics are reported through the engine's `onDiagnostic`
 * handler.
 */
export interface DesignTokensReport {
	/** Total number of registered design-token variable names (all kinds). */
	totalTokens: number
	/** Registered token variable names referenced by at least one atomic style, sorted. */
	used: string[]
	/** Registered token variable names referenced by no atomic style, sorted. */
	unused: string[]
	/** Deprecated token variable names that are in use, sorted. */
	deprecatedInUse: string[]
	/** Cumulative counts of strict-mode diagnostics produced, by severity. */
	strictViolations: { warning: number, error: number }
}

// Local copy of core's `extractUsedVarNames`. limit: `@pikacss/core` re-exports
// it only as a type (`export type *` in packages/core/src/index.ts), so it
// cannot be imported as a runtime value. Kept identical to the original in
// packages/core/src/plugins/variables.ts. Its capture is always `--`-prefixed,
// so core's companion `normalizeVariableName` is unnecessary here.
const VAR_NAME_RE = /var\(\s*(--[\w-]+)/g

function extractUsedVarNames(input: string): string[] {
	return Array.from(input.matchAll(VAR_NAME_RE), m => m[1]!)
}

/**
 * Computes a {@link DesignTokensReport} from the engine's live state.
 *
 * @internal
 *
 * @param engine - The initialized engine (reads `store.atomicStyles` and `variables.store`).
 * @param tokenVars - Every registered design-token variable name (all kinds).
 * @param deprecatedNames - The deprecated token var-name registry.
 * @param strictViolations - The live cumulative strict-violation counters.
 * @param strictViolations.warning - Cumulative count of warning-level violations.
 * @param strictViolations.error - Cumulative count of error-level violations.
 * @returns The computed report.
 *
 * @remarks Usage is seeded from `var()` references in the atomic-style store,
 * then expanded transitively through `engine.variables.store` (mirroring core's
 * variables preflight), so a token reached only through another token's value
 * still counts as used.
 */
export function computeDesignTokensReport(
	engine: Engine,
	tokenVars: ReadonlySet<string>,
	deprecatedNames: ReadonlySet<string>,
	strictViolations: { warning: number, error: number },
): DesignTokensReport {
	const used = new Set<string>()

	// 1. Collect var names referenced directly by atomic styles.
	for (const { content: { value } } of engine.store.atomicStyles.values()) {
		for (const v of value) {
			for (const name of extractUsedVarNames(v))
				used.add(name)
		}
	}

	// 2. Expand transitively: a used variable whose value references other
	// variables keeps those alive too (var-in-var chains). `String(value)`
	// coerces scalar and `[value, fallbacks]` tuple forms alike; the regex finds
	// every `var()` reference regardless of the separator.
	const varMap = engine.variables.store
	const queue = Array.from(used)
	while (queue.length > 0) {
		const name = queue.pop()!
		const entries = varMap.get(name)
		if (entries == null)
			continue
		for (const { value } of entries) {
			for (const ref of extractUsedVarNames(String(value))) {
				if (!used.has(ref)) {
					used.add(ref)
					queue.push(ref)
				}
			}
		}
	}

	// 3. Partition registered token vars by usage.
	const usedTokens: string[] = []
	const unusedTokens: string[] = []
	for (const v of tokenVars) {
		if (used.has(v))
			usedTokens.push(v)
		else
			unusedTokens.push(v)
	}

	const deprecatedInUse: string[] = []
	for (const v of deprecatedNames) {
		if (used.has(v))
			deprecatedInUse.push(v)
	}

	return {
		totalTokens: tokenVars.size,
		used: usedTokens.sort(),
		unused: unusedTokens.sort(),
		deprecatedInUse: deprecatedInUse.sort(),
		strictViolations: { warning: strictViolations.warning, error: strictViolations.error },
	}
}
