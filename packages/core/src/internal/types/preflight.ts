import type { Engine } from '../engine'
import type { ResolvedCSSProperties, ResolvedSelector } from './resolved'
import type { Awaitable, UnionString } from './utils'

/**
 * An object-based preflight definition that maps CSS selectors to property maps, allowing nested selectors for at-rules and pseudo-elements.
 *
 * @remarks Preflight definitions are resolved into CSS text at render time. Keys can be any valid CSS selector string or a custom selector name registered via the selectors plugin. Values are CSS property maps or further nested `PreflightDefinition` objects.
 *
 * @example
 * ```ts
 * const reset: PreflightDefinition = {
 *   '*, *::before, *::after': { boxSizing: 'border-box', margin: '0' },
 *   ':root': { fontSize: '16px' },
 * }
 * ```
 */
export type PreflightDefinition = {
	[selector in UnionString | ResolvedSelector]?: ResolvedCSSProperties | PreflightDefinition
}

/**
 * A function that receives the engine instance and formatting flag, returning CSS text or a `PreflightDefinition` object.
 *
 * @remarks Preflight functions are invoked at render time, after all atomic styles have been resolved. This allows them to inspect the engine store (e.g. which variables or keyframes are actually used) and prune unused declarations.
 *
 * @example
 * ```ts
 * const fn: PreflightFn = (engine, isFormatted) => {
 *   return { ':root': { '--color': 'red' } }
 * }
 * ```
 */
export type PreflightFn = (engine: Engine, isFormatted: boolean) => Awaitable<string | PreflightDefinition>

/**
 * Normalized preflight entry after resolution, with an optional layer scope and a stable identifier for deduplication.
 *
 * @remarks Produced by `resolvePreflight()` which peels off `WithLayer` and `WithId` wrappers from the user-facing `Preflight` input. The `id` allows plugins to identify and replace specific preflights, and `layer` controls which `@layer` block the output lands in.
 *
 * @example
 * ```ts
 * const resolved: ResolvedPreflight = {
 *   layer: 'base',
 *   id: 'my-reset',
 *   fn: (engine, isFormatted) => '* { margin: 0; }',
 * }
 * ```
 */
export interface ResolvedPreflight {
	/**
	 * CSS `@layer` name that wraps this preflight output. When omitted, the preflight falls into the default preflights layer.
	 *
	 * @default undefined
	 */
	layer?: string
	/**
	 * Stable identifier for this preflight, used for deduplication and replacement by plugins.
	 *
	 * @default undefined
	 */
	id?: string
	/** The preflight function invoked at render time to produce CSS text or a definition object. */
	fn: PreflightFn
}

/**
 * Wrap a preflight with a stable identifier so it can be distinguished or replaced after resolution.
 */
interface WithId<T> {
	id: string
	preflight: T
}

type MaybeWithId<T> = WithId<T> | T

interface WithLayer<T> {
	layer: string
	preflight: T
}

type MaybeWithLayer<T> = WithLayer<T> | T

/**
 * User-facing preflight input that accepts raw CSS strings, definition objects, functions, or wrapped variants with `layer` and `id` metadata.
 *
 * @remarks The engine normalizes all `Preflight` variants into `ResolvedPreflight` via `resolvePreflight()`. Wrapping with `{ layer, preflight }` scopes the output to a specific `@layer`; wrapping with `{ id, preflight }` enables replacement by ID.
 *
 * @example
 * ```ts
 * // Raw string
 * const a: Preflight = '* { margin: 0; }'
 * // Definition object
 * const b: Preflight = { ':root': { fontSize: '16px' } }
 * // Function with layer wrapper
 * const c: Preflight = { layer: 'base', preflight: (engine) => '...' }
 * ```
 */
export type Preflight = MaybeWithLayer<MaybeWithId<string | PreflightDefinition | PreflightFn>>
