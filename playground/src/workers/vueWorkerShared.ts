// Shared contract between the main thread (useVueLanguageService.ts) and the
// Volar vue worker (vue.worker.ts). Keep dependency-free: both sides bundle it.

/**
 * Sent to the worker via monaco's `createWebWorker({ createData })`.
 * `compilerOptions` is raw tsconfig JSON — the worker normalizes it with
 * `ts.convertCompilerOptionsFromJson` (enum values like `"bundler"` cannot
 * cross the thread boundary as TS enums).
 */
export interface VueWorkerCreateData {
	tsconfig: {
		compilerOptions?: Record<string, unknown>
		vueCompilerOptions?: Record<string, unknown>
	}
}

/**
 * Main-thread host RPC exposed to the worker through monaco's worker `host`
 * mechanism (worker-side `ctx.host.<method>()` returns a Promise). Backs the
 * Volar FileSystem with the WebContainer's real /node_modules.
 * File types follow Volar/VS Code `FileType`: 1 = File, 2 = Directory.
 */
export interface VueWorkerHost {
	fsReadFile: (path: string) => Promise<string | null>
	fsReadDirectory: (path: string) => Promise<[string, 1 | 2][]>
	fsStat: (path: string) => Promise<{ type: 1 | 2 } | null>
}
