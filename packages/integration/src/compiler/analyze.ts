import type { Engine } from '@pikacss/core'
import type { FnConfig } from '../fnConfig'
import type { MacroCall } from '../processors/types'
import type { CollectedCall } from './collect'
import type { JsDialect, ParseOffsets } from './parse'
import * as t from '@babel/types'
import { collectMacroCalls } from './collect'
import { nodeLoc, PikaTransformError } from './errors'
import { evaluateStatic } from './evaluate'
import { parseJs, parseJsExpression } from './parse'

/**
 * Options for {@link analyzeJs}.
 */
export interface AnalyzeJsOptions {
	/** Position offsets when the chunk is embedded in a surrounding file (e.g. a Vue SFC script block). */
	offsets?: ParseOffsets
	/** Quote character for emitted literals at the found call sites. @default `'` */
	quote?: '"' | '\''
	/**
	 * How to parse the chunk. `'expression'` parses a bare expression (e.g. a
	 * Vue template interpolation, where `{ a: 1 }` must be an object literal,
	 * not a block statement). @default `'program'`
	 */
	parseMode?: 'program' | 'expression'
	/**
	 * Root identifiers shadowed by the surrounding non-JS context (e.g. Vue
	 * `v-for` aliases); calls through them are not macros.
	 */
	excludedRoots?: ReadonlySet<string>
}

function evaluateCallArgs(call: CollectedCall, id: string): Parameters<Engine['use']> {
	const ctx = {
		id,
		hasLocalBinding: (name: string) => call.path.scope.getBinding(name) != null,
	}
	const args: unknown[] = []
	for (const argument of call.node.arguments) {
		if (argument.type === 'SpreadElement') {
			const spread = evaluateStatic(argument.argument, ctx)
			if (!Array.isArray(spread)) {
				throw new PikaTransformError({
					id,
					stage: 'evaluate',
					loc: nodeLoc(argument),
					message: 'Failed to statically evaluate pika() argument: call spread of a non-array value',
				})
			}
			args.push(...spread)
			continue
		}
		// ArgumentPlaceholder (partial-application proposal) is not enabled in
		// the parser plugin set, so any remaining argument is an Expression;
		// evaluateStatic rejects unsupported ones with a positioned error.
		args.push(evaluateStatic(argument, ctx))
	}
	return args as Parameters<Engine['use']>
}

/**
 * Analyzes a JavaScript/TypeScript source chunk: parse, collect macro calls,
 * and statically evaluate each call's arguments.
 *
 * @param code - The source chunk.
 * @param id - Normalized absolute path of the module (for diagnostics).
 * @param dialect - The {@link JsDialect} deciding the parser plugin set.
 * @param fnConfig - The variant config derived from the base function name.
 * @param options - Optional {@link AnalyzeJsOptions}.
 * @returns Macro calls sorted by start offset. Offsets are absolute into the surrounding file when `options.offsets` is set.
 * @throws {@link PikaTransformError} on parse failure or any non-static argument — module analysis is all-or-nothing.
 */
export function analyzeJs(
	code: string,
	id: string,
	dialect: JsDialect,
	fnConfig: FnConfig,
	options?: AnalyzeJsOptions,
): MacroCall[] {
	let ast: t.File
	try {
		ast = options?.parseMode === 'expression'
			// Wrap the bare expression in a synthetic Program so traverse has a
			// scope to resolve bindings against; the expression node keeps its
			// own (offset-adjusted) positions.
			? t.file(t.program([t.expressionStatement(parseJsExpression(code, dialect, options?.offsets))]))
			: parseJs(code, dialect, options?.offsets)
	}
	catch (error: any) {
		throw new PikaTransformError({
			id,
			stage: 'parse',
			loc: error?.loc == null ? null : { line: error.loc.line, column: error.loc.column },
			message: `Failed to parse module: ${error?.message ?? error}`,
			cause: error,
		})
	}

	const collected = collectMacroCalls(ast, fnConfig, options?.excludedRoots)
		.sort((a, b) => a.node.start! - b.node.start!)

	const quote = options?.quote ?? '\''
	return collected.map((call): MacroCall => ({
		variant: call.variant,
		start: call.node.start!,
		end: call.node.end!,
		loc: {
			line: call.node.loc!.start.line,
			column: call.node.loc!.start.column,
		},
		args: evaluateCallArgs(call, id),
		quote,
	}))
}
