// Internal registry mapping a design-token CSS variable name to its declared
// DTCG `$type`, keyed by the engine instance that produced it. Strict mode reads
// this to decide which CSS properties are governed and whether a `var()`
// reference on a governed property points at a token of the correct `$type`.
// Deliberately kept off the public API surface, mirroring the deprecated-token
// and layer registries: consumers must not depend on it.
const typeByEngine = new WeakMap<object, ReadonlyMap<string, string>>()

/**
 * Records the map of token variable name → declared `$type` produced for an engine.
 *
 * @internal
 */
export function setTokenTypeNames(engine: object, types: ReadonlyMap<string, string>): void {
	typeByEngine.set(engine, types)
}

/**
 * Returns the token variable name → `$type` map recorded for an engine, or an
 * empty map if none were recorded.
 *
 * @internal
 */
export function getTokenTypeNames(engine: object): ReadonlyMap<string, string> {
	return typeByEngine.get(engine) ?? new Map<string, string>()
}
