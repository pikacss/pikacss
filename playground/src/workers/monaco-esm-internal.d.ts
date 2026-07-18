// Ambient declarations for monaco-editor deep ESM imports that ship no .d.ts.
// Paths verified against monaco-editor@0.55.1 — re-verify on version bumps.

declare module 'monaco-editor/esm/vs/editor/editor.worker.js' {
	export function initialize(callback: (ctx: any, createData: any) => any): void
}

declare module 'monaco-editor/esm/vs/language/typescript/tsWorker.js' {
	export class TypeScriptWorker {
		constructor(ctx: unknown, createData: unknown)
		getScriptFileNames(): string[]
	}
}
