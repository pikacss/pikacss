import type { Engine } from '@pikacss/core'
import type { FnConfig, FnVariant } from '../fnConfig'

/**
 * A fully analyzed `pika()` macro call: its variant, source range, and
 * statically evaluated arguments.
 */
export interface MacroCall {
	/** The matched call variant. */
	variant: FnVariant
	/** Zero-based character offset where the call begins in the module source. */
	start: number
	/** Zero-based character offset one past the call's closing parenthesis (exclusive). */
	end: number
	/** One-based position of the call, for diagnostics. */
	loc: { line: number, column: number }
	/** Statically evaluated `engine.use()` arguments (plain data by construction). */
	args: Parameters<Engine['use']>
	/** Quote character for the emitted literal at this site (`'` for JS sources; AST-derived in Vue templates). */
	quote: '"' | '\''
}

/**
 * Result of analyzing one module: every macro call found in it.
 */
export interface AnalyzedModule {
	/** Normalized absolute path of the module. */
	id: string
	/** The exact source that was analyzed. */
	code: string
	/** Macro calls sorted by `start` offset (deterministic within-module order). */
	calls: MacroCall[]
}

/**
 * Options handed to a processor's `analyze`.
 */
export interface ProcessorOptions {
	/** The variant config derived from the configured base function name. */
	fnConfig: FnConfig
}

/**
 * A framework-specific source analyzer.
 *
 * @remarks
 * Processors only ANALYZE — they never rewrite. The pipeline applies all
 * replacements itself so module transforms stay atomic. A processor must
 * throw `PikaTransformError` on any parse/scope/evaluation failure; partial
 * results are never returned. This is the extensibility seam for future
 * framework support (svelte, astro, ...): implement this interface and
 * register the extensions in the processor registry.
 */
export interface FrameworkProcessor {
	/** Diagnostic name of the processor (e.g. `'js'`, `'vue'`). */
	name: string
	/** Analyzes a module and returns every macro call in it. */
	analyze: (code: string, id: string, options: ProcessorOptions) => Promise<AnalyzedModule> | AnalyzedModule
}

/**
 * Lazily loads a {@link FrameworkProcessor}; heavyweight parser dependencies
 * are only imported when a matching file is actually analyzed.
 */
export type ProcessorLoader = () => Promise<FrameworkProcessor>

/**
 * Registry mapping file extensions to framework processors.
 */
export interface ProcessorRegistry {
	/** Registers a lazy processor for the given extensions (leading dots optional, case-insensitive). */
	register: (extensions: string[], loader: ProcessorLoader) => void
	/** Resolves the processor for an extension, or `null` when none is registered. Loaded processors are memoized. */
	resolve: (ext: string) => Promise<FrameworkProcessor> | null
	/** Returns whether a processor is registered for the extension. */
	has: (ext: string) => boolean
}
