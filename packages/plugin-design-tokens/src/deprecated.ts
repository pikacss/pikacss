// Internal registry of deprecated design-token CSS variable names, keyed by the
// engine instance that produced them. A later batch reads this registry to emit
// usage warnings when a deprecated token variable is referenced. This is
// deliberately kept off the public API surface: consumers must not depend on it.
const deprecatedByEngine = new WeakMap<object, ReadonlySet<string>>()

/**
 * Records the set of deprecated token variable names produced for an engine.
 *
 * @internal
 */
export function setDeprecatedTokenNames(engine: object, names: ReadonlySet<string>): void {
	deprecatedByEngine.set(engine, names)
}

/**
 * Returns the deprecated token variable names recorded for an engine, or an empty
 * set if none were recorded.
 *
 * @internal
 */
export function getDeprecatedTokenNames(engine: object): ReadonlySet<string> {
	return deprecatedByEngine.get(engine) ?? new Set<string>()
}
