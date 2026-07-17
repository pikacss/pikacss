import type { WebContainer } from '@webcontainer/api'
import JSON5 from 'json5'
import * as monaco from 'monaco-editor'

// Singleton state: the fallback `pika` globals lib is disposed once the real
// generated `src/pika.gen.ts` types have been loaded.
let pikaFallbackLib: monaco.IDisposable | null = null
let pikaGenLib: monaco.IDisposable | null = null
let pikaGenContent = ''

/**
 * Loads Monaco configuration (tsconfig) and types (node_modules) from WebContainer.
 * Refactored to simulate Node.js module resolution using file:/// URIs.
 */
export function useMonacoConfig() {
	async function loadMonacoConfig(webcontainerInstance: WebContainer) {
		// 1. Load types from node_modules
		await loadTypes(webcontainerInstance)

		// 2. Load and apply tsconfig.json
		await loadTsConfig(webcontainerInstance)
	}

	/**
	 * Declares fallback `pika`/`pikap` globals in Monaco so the editor stops
	 * reporting "Cannot find name 'pika'" before {@link loadPikaGenTypes} has
	 * managed to load the real generated declarations (or if it never does).
	 * Self-contained (no imports) so it applies regardless of module resolution.
	 * Must run after `loadTypes` (which calls `setExtraLibs` and would otherwise
	 * drop this lib).
	 *
	 * Also registers the `*.vue` / `*.css` module shims (a separate lib, so a
	 * template without `vue` installed cannot invalidate the pika globals).
	 */
	function loadPikaGlobals() {
		const source = `
type PikaStyleItem = string | Record<string, any>
interface PikaFn {
  (...items: PikaStyleItem[]): string
  str: (...items: PikaStyleItem[]) => string
  arr: (...items: PikaStyleItem[]) => string[]
}
declare const pika: PikaFn
declare const pikap: PikaFn
`
		// `vite/client` is not wired into the worker, so shim the asset modules the
		// templates import: `./App.vue` in main.ts and css imports (the `*.css`
		// pattern also matches the bare `pika.css` virtual module).
		const shims = `
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}
declare module '*.css' {}
`
		const ts = (monaco.languages.typescript as any).typescriptDefaults
		pikaFallbackLib?.dispose()
		pikaFallbackLib = pikaGenLib ? null : ts.addExtraLib(source, 'file:///pika-globals.d.ts')
		ts.addExtraLib(shims, 'file:///module-shims.d.ts')
	}

	/**
	 * Loads the real generated `src/pika.gen.ts` from the WebContainer into
	 * Monaco, replacing the loose fallback globals from {@link loadPikaGlobals}
	 * so `pika({ ... })` gets the actual CSS property / shortcut autocomplete.
	 * Requires `loadTypes` to have finished (the generated file imports from
	 * `@pikacss/unplugin-pikacss`, resolved against the loaded node_modules) —
	 * callers must await `loadMonacoConfig` first. Safe to call repeatedly
	 * (e.g. after pika.gen HMR updates); no-ops while the content is unchanged.
	 */
	async function loadPikaGenTypes(webcontainerInstance: WebContainer) {
		const content = await webcontainerInstance.fs.readFile('/src/pika.gen.ts', 'utf-8')
			.catch(() => '')
		if (!content || content === pikaGenContent)
			return
		pikaGenContent = content
		const ts = (monaco.languages.typescript as any).typescriptDefaults
		pikaGenLib?.dispose()
		pikaGenLib = ts.addExtraLib(content, 'file:///src/pika.gen.ts')
		pikaFallbackLib?.dispose()
		pikaFallbackLib = null
	}

	/**
	 * Creates Monaco models for the template's TS/TSX sources up front. Models
	 * are otherwise created lazily on first open, so imports between template
	 * files (e.g. `./components/PreferencesCard.tsx` from App.tsx) report
	 * "Cannot find module" until the target file has been opened once. Requires
	 * eager model sync (set in MonacoEditor.vue) so the TS worker sees models
	 * that are not bound to an editor.
	 */
	function preloadTemplateModels(files: Record<string, string>) {
		for (const [path, content] of Object.entries(files)) {
			if (!/\.tsx?$/.test(path))
				continue
			const uri = monaco.Uri.parse(`file:///${path}`)
			if (!monaco.editor.getModel(uri))
				monaco.editor.createModel(content, 'typescript', uri)
		}
	}

	async function loadTypes(webcontainerInstance: WebContainer) {
		const libMap = new Map<string, string>()
		const compilerPaths: Record<string, string[]> = {}

		async function walk(dir: string) {
			try {
				const entries = await webcontainerInstance.fs.readdir(dir, { withFileTypes: true })
				for (const entry of entries) {
					const fullPath = `${dir === '/' ? '' : dir}/${entry.name}`

					if (entry.isDirectory()) {
						if (entry.name === '.bin' || entry.name === '.cache')
							continue
						await walk(fullPath)
					}
					else if (entry.isFile()) {
						// `.d.mts`/`.d.cts` matter: several packages (vue,
						// @pikacss/unplugin-pikacss, @vitejs/plugin-*) ship ESM-only types.
						if (/\.d\.[mc]?ts$/.test(entry.name)) {
							const content = await webcontainerInstance.fs.readFile(fullPath, 'utf-8')
							// Use file:/// URIs to match Monaco's internal Node resolution
							libMap.set(`file://${fullPath}`, content)
						}
						else if (entry.name === 'package.json') {
							try {
								const content = await webcontainerInstance.fs.readFile(fullPath, 'utf-8')
								const pkg = JSON5.parse(content)

								// Expose the manifest to the worker: bundler module resolution
								// reads package.json (`exports`, `types`, `main`) via
								// host.readFile. (Extra libs are also parsed as root files, but
								// any parse noise stays invisible — diagnostics are only
								// requested for open editor models.)
								libMap.set(`file://${fullPath}`, content)
								const typesPath = pkg.types || pkg.typings

								// Node resolution defaults to index.d.ts.
								// If package.json specifies something else, we might need a mapping.
								if (pkg.name && typesPath) {
									const normalizedTypesPath = typesPath.startsWith('./') ? typesPath.slice(2) : typesPath

									// If the types are NOT at index.d.ts, we help Monaco find them.
									// For example: "types": "dist/main.d.ts"
									if (normalizedTypesPath !== 'index.d.ts') {
										// Clean up path for mapping
										const packageRoot = dir // e.g. /node_modules/foo
										const absoluteTypesPath = `${packageRoot}/${normalizedTypesPath}`

										// Remove leading slash for compiler option paths if needed,
										// but for file:/// usage, we might rely on the relative lookup from baseUrl.
										// However, standard paths config usually ignores "file://" prefix in the value
										// if baseUrl is set?
										// Actually, with baseUrl="file:///", we can map:
										// "foo": ["node_modules/foo/dist/main.d.ts"] (relative to /)

										const relativePath = absoluteTypesPath.startsWith('/') ? absoluteTypesPath.slice(1) : absoluteTypesPath

										// Add mapping for this specific package
										compilerPaths[pkg.name] = [relativePath]
									}
								}
							}
							catch {
								// ignore invalid package.json
							}
						}
					}
				}
			}
			catch {
				// ignore
			}
		}

		await walk('/node_modules')

		// Batch update extra libs
		const ts = (monaco.languages.typescript as any).typescriptDefaults
		ts.setExtraLibs(
			Array.from(libMap.entries())
				.map(([path, content]) => ({
					filePath: path,
					content,
				})),
		)

		// Apply discovered paths to compiler options (only for special cases)
		// Standard resolution handles the rest via baseUrl="file:///" and "*"=["node_modules/*"]
		if (Object.keys(compilerPaths).length > 0) {
			updateCompilerOptions({ paths: compilerPaths })
		}
	}

	async function loadTsConfig(webcontainerInstance: WebContainer) {
		try {
			const tsconfigContent = await webcontainerInstance.fs.readFile('/tsconfig.json', 'utf-8')
				.catch(() => null)
			if (!tsconfigContent)
				return

			const tsconfig = JSON5.parse(tsconfigContent)

			// Handle references logic (simplified for now, mostly merging compilerOptions)
			if (tsconfig.references) {
				for (const ref of tsconfig.references) {
					if (ref.path) {
						const refPath = ref.path.replace(/^\.\//, '')
						// If path is a folder, look for tsconfig.json inside, otherwise read file
						// Vite templates usually have ./tsconfig.app.json
						const potentialFiles = [
							refPath,
							`${refPath}/tsconfig.json`,
						]

						for (const path of potentialFiles) {
							const refContent = await webcontainerInstance.fs.readFile(path, 'utf-8')
								.catch(() => null)
							if (refContent) {
								const refConfig = JSON5.parse(refContent)
								if (refConfig.compilerOptions) {
									applyCompilerOptions(refConfig.compilerOptions)
								}
								break // found the config
							}
						}
					}
				}
			}

			if (tsconfig.compilerOptions) {
				applyCompilerOptions(tsconfig.compilerOptions)
			}
		}
		catch (e) {
			console.error('[MonacoConfig] Failed to load tsconfig:', e)
		}
	}

	function applyCompilerOptions(options: any) {
		const monacoOptions: any = {}

		// Map basic options
		if (options.target)
			monacoOptions.target = mapTarget(options.target)
		if (options.module)
			monacoOptions.module = mapModule(options.module)
		if (options.jsx)
			monacoOptions.jsx = mapJsx(options.jsx)

		// Copy direct values (boolean/string options pass through as-is; only
		// enum-valued options need mapping to the TS numeric values above).
		const directCopy = [
			'jsxImportSource',
			'strict',
			'allowSyntheticDefaultImports',
			'esModuleInterop',
			'baseUrl',
			'paths',
			'allowJs',
			'checkJs',
			'allowImportingTsExtensions',
		]

		for (const key of directCopy) {
			if (options[key] !== undefined) {
				monacoOptions[key] = options[key]
			}
		}

		// Force critical overrides for WebContainer environment.
		// `bundler` (100) is not in monaco's ModuleResolutionKind, but the worker's
		// TS 5.9 accepts it; it is what the templates use, and it resolves the
		// package.json `exports` maps loaded by `loadTypes`.
		monacoOptions.moduleResolution = 100
		monacoOptions.allowNonTsExtensions = true

		// If baseUrl is not set in tsconfig, default it to file:/// (done in initialization, but good to reinforce)
		// If user tsconfig has baseUrl: '.', we might map it to 'file:///' or '/'?
		// Let's rely on the base config in MonacoEditor.vue for defaults, and just merge overrides here.

		updateCompilerOptions(monacoOptions)
	}

	function updateCompilerOptions(newOptions: any) {
		const defaults = (monaco.languages.typescript as any).typescriptDefaults
		const current = defaults.getCompilerOptions()

		defaults.setCompilerOptions({
			...current,
			...newOptions,
			paths: {
				...current.paths,
				...(newOptions.paths || {}),
			},
		})
	}

	// --- Helpers ---
	function mapTarget(target: string) {
		const ts = monaco.languages.typescript as any
		switch (target?.toLowerCase()) {
			case 'es5': return ts.ScriptTarget.ES5
			case 'es6': return ts.ScriptTarget.ES2015
			case 'es2015': return ts.ScriptTarget.ES2015
			case 'es2020': return ts.ScriptTarget.ES2020
			case 'esnext': return ts.ScriptTarget.ESNext
			default: return ts.ScriptTarget.ESNext
		}
	}

	function mapModule(mod: string) {
		const ts = monaco.languages.typescript as any
		switch (mod?.toLowerCase()) {
			case 'commonjs': return ts.ModuleKind.CommonJS
			case 'esnext': return ts.ModuleKind.ESNext
			default: return ts.ModuleKind.ESNext
		}
	}

	function mapJsx(jsx: string) {
		const ts = monaco.languages.typescript as any
		switch (jsx?.toLowerCase()) {
			case 'react': return ts.JsxEmit.React
			case 'react-jsx': return ts.JsxEmit.ReactJSX
			case 'preserve': return ts.JsxEmit.Preserve
			default: return ts.JsxEmit.Preserve
		}
	}

	return {
		loadMonacoConfig,
		loadPikaGlobals,
		loadPikaGenTypes,
		preloadTemplateModels,
	}
}
