import type { TokenLayer } from './types'

// Internal registry mapping a design-token CSS variable name to the layer
// (`primitive` / `semantic`) declared for its source, keyed by the engine
// instance that produced it. A later strict-mode batch reads this registry to
// enforce layer boundaries (e.g. semantic tokens may reference primitives but
// not vice versa). Deliberately kept off the public API surface, mirroring the
// deprecated-token registry: consumers must not depend on it.
const layerByEngine = new WeakMap<object, ReadonlyMap<string, TokenLayer>>()

/**
 * Records the map of token variable name → declared layer produced for an engine.
 *
 * @internal
 */
export function setLayerTokenNames(engine: object, layers: ReadonlyMap<string, TokenLayer>): void {
	layerByEngine.set(engine, layers)
}

/**
 * Returns the token variable name → layer map recorded for an engine, or an empty
 * map if none were recorded.
 *
 * @internal
 */
export function getLayerTokenNames(engine: object): ReadonlyMap<string, TokenLayer> {
	return layerByEngine.get(engine) ?? new Map<string, TokenLayer>()
}
