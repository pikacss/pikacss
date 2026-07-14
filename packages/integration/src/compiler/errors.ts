/**
 * Pipeline stage in which a transform failure occurred.
 *
 * - `'parse'` — source (or an embedded expression) failed to parse.
 * - `'collect'` — the macro-call collector rejected a call site.
 * - `'evaluate'` — a call argument is not statically evaluable.
 * - `'prepare'` — resolving a call through the engine failed.
 */
export type TransformErrorStage = 'parse' | 'collect' | 'evaluate' | 'prepare'

/**
 * One-based source position of a transform failure.
 */
export interface TransformErrorLoc {
	/** One-based line number of the failure. */
	line: number
	/** Zero-based column of the failure (Babel convention). */
	column: number
}

/**
 * Extracts a {@link TransformErrorLoc} from an AST node's source location.
 *
 * @param node - Any node carrying an optional Babel-style `loc`.
 * @param node.loc - The Babel-style source location, when present.
 * @returns The start position, or `null` when the node has no location info.
 */
export function nodeLoc(node: { loc?: { start: { line: number, column: number } } | null }): TransformErrorLoc | null {
	return node.loc == null ? null : { line: node.loc.start.line, column: node.loc.start.column }
}

/**
 * Error thrown when a module cannot be transformed.
 *
 * @remarks
 * Module transforms are atomic: any failure aborts the whole module without
 * committing partial results, and this error propagates to the bundler (dev
 * overlay / failed build). The `id` and `loc` fields follow the shape bundlers
 * (Vite/Rollup) read to render code frames for plugin errors.
 */
export class PikaTransformError extends Error {
	/** Normalized absolute path of the failing module. */
	readonly id: string
	/** One-based position of the failure inside the module, when known. */
	readonly loc: TransformErrorLoc | null
	/** Pipeline stage that failed. */
	readonly stage: TransformErrorStage

	constructor(options: {
		id: string
		stage: TransformErrorStage
		message: string
		loc?: TransformErrorLoc | null
		cause?: unknown
	}) {
		const position = options.loc == null ? '' : `:${options.loc.line}:${options.loc.column}`
		super(`[pikacss] ${options.message} (${options.id}${position})`, { cause: options.cause })
		this.name = 'PikaTransformError'
		this.id = options.id
		this.loc = options.loc ?? null
		this.stage = options.stage
	}
}
