/** Severity of a PikaCSS diagnostic. */
export type DiagnosticLevel = 'warning' | 'error'

/**
 * Structured diagnostic emitted by the PikaCSS engine or an engine plugin.
 *
 * @remarks Diagnostics are data only. The core package never assumes a console,
 * logger, browser, or Node.js runtime. Hosts decide how diagnostics are displayed.
 */
export interface Diagnostic {
	/** Diagnostic severity. */
	level: DiagnosticLevel
	/** Stable machine-readable identifier. */
	code: string
	/** Human-readable explanation. */
	message: string
	/** Original error or value related to the diagnostic. */
	cause?: unknown
	/** Plugin that produced the diagnostic, when applicable. */
	plugin?: string
	/** Plugin hook that produced the diagnostic, when applicable. */
	hook?: string
}

/** Callback used by a host to receive structured diagnostics. */
export type DiagnosticHandler = (diagnostic: Diagnostic) => void

/** Runtime-only options accepted by {@link createEngine}. */
export interface CreateEngineOptions {
	/**
	 * Receives warnings and errors produced by this engine instance.
	 *
	 * @default A no-op handler.
	 */
	onDiagnostic?: DiagnosticHandler
}

/** Context passed to plugin hooks by the engine. */
export interface EnginePluginContext {
	/** Instance-scoped diagnostic handler. */
	onDiagnostic: DiagnosticHandler
}

/** Default diagnostic handler used by the platform-neutral core. */
export const noopDiagnosticHandler: DiagnosticHandler = (_diagnostic) => {}

/**
 * Delivers a diagnostic without allowing a faulty host handler to alter engine execution.
 *
 * @internal
 */
export function emitDiagnostic(handler: DiagnosticHandler, diagnostic: Diagnostic): void {
	try {
		handler(diagnostic)
	}
	catch {
		// Diagnostic reporting must never replace the engine's actual result or error.
	}
}
