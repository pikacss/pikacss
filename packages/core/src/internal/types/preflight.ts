import type { Engine } from '../engine'
import type { ResolvedCSSProperties, ResolvedSelector } from './resolved'
import type { Awaitable, UnionString } from './utils'

// #region Preflight
export type PreflightDefinition = {
	[selector in UnionString | ResolvedSelector]?: ResolvedCSSProperties | PreflightDefinition
}

export type PreflightFn = (engine: Engine, isFormatted: boolean) => Awaitable<string | PreflightDefinition>

export interface ResolvedPreflight {
	layer?: string
	id?: string
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
 * Preflight can be a string, object, function, or a wrapper-enhanced variant.
 *
 * 1. A `string` is a static preflight style injected verbatim.
 * 2. A `PreflightDefinition` is a JS object describing CSS rules.
 * 3. A `PreflightFn` is a dynamic preflight that receives the engine instance.
 * 4. A `WithId` wrapper assigns a stable `id` to any raw preflight value.
 * 5. A `WithLayer` wrapper assigns a raw or `id`-wrapped preflight to a specific CSS `@layer`.
 */
export type Preflight = MaybeWithLayer<MaybeWithId<string | PreflightDefinition | PreflightFn>>
// #endregion Preflight
