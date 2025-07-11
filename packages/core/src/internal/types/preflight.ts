import type { Engine } from '../engine'
import type { ResolvedCSSProperties, ResolvedSelector } from './resolved'
import type { Awaitable, UnionString } from './utils'

// #region Preflight
export type PreflightDefinition = {
	[selector in UnionString | ResolvedSelector]?: ResolvedCSSProperties | PreflightDefinition
}

export type PreflightFn = (engine: Engine, isFormatted: boolean) => Awaitable<string | PreflightDefinition>

/**
 * PreflightConfig can be a string or a function that returns a string.
 *
 * 1. A string is a static preflight style.
 * 2. A function is a dynamic preflight style that can use the engine instance to generate styles.
 */
export type Preflight = string | PreflightDefinition | PreflightFn
// #endregion Preflight
