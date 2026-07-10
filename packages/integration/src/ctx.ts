import type { Engine, EngineConfig, Nullish } from '@pikacss/core'
import type { IntegrationContext, IntegrationContextOptions, LoadedConfigResult, UsageRecord } from './types'
import { statSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createEngine, defineEnginePlugin, log } from '@pikacss/core'
import { computed, signal } from 'alien-signals'
import { globbyStream } from 'globby'
import { klona } from 'klona'
import { isPackageExists } from 'local-pkg'
import MagicString from 'magic-string'
import { dirname, isAbsolute, join, relative, resolve } from 'pathe'
import picomatch from 'picomatch'
import { createFnUtils, createMarkupIdRE, DEFAULT_MARKUP_EXTENSIONS, detectEnclosingAttributeQuote, findFunctionCalls } from './ctx.transform-utils'
import { createEventHook } from './eventHook'
import { generateTsCodegenContent } from './tsCodegen'

interface Signal<T> {
	(): T
	(value: T): void
}

interface Computed<T> {
	(): T
}

const RE_VALID_CONFIG_EXT = /\.(?:js|cjs|mjs|ts|cts|mts)$/

function createConfigScaffoldContent({
	currentPackageName,
	resolvedConfigPath,
	tsCodegenFilepath,
}: {
	currentPackageName: string
	resolvedConfigPath: string
	tsCodegenFilepath: string | Nullish
}) {
	const relativeTsCodegenFilepath = tsCodegenFilepath == null
		? null
		: `./${relative(dirname(resolvedConfigPath), tsCodegenFilepath)}`

	return [
		...relativeTsCodegenFilepath == null
			? []
			: [`/// <reference path="${relativeTsCodegenFilepath}" />`],
		`import { defineEngineConfig } from '${currentPackageName}'`,
		'',
		'export default defineEngineConfig({',
		'  // Add your PikaCSS engine config here',
		'})',
	].join('\n')
}

// Cheap stable comparison for usage record lists: both lists originate from
// evaluating source literals, so identical source produces an identical
// serialization. Any serialization failure is treated as "changed".
function isSameUsageList(previous: UsageRecord[] | Nullish, next: UsageRecord[]) {
	const previousList = previous ?? []
	if (previousList.length !== next.length)
		return false
	try {
		return JSON.stringify(previousList) === JSON.stringify(next)
	}
	catch {
		return false
	}
}

async function writeGeneratedFile(filepath: string, content: string) {
	await mkdir(dirname(filepath), { recursive: true })
		.catch(() => {})
	await writeFile(filepath, content)
}

async function evaluateConfigModule(resolvedConfigPath: string): Promise<LoadedConfigResult> {
	log.info(`Using config file: ${resolvedConfigPath}`)
	const { createJiti } = await import('jiti')
	const jiti = createJiti(
		import.meta.url,
		{
			interopDefault: true,
			// Without this, files imported by the config are cached process-wide
			// and edits to them would be invisible to config reloads.
			moduleCache: false,
		},
	)
	const content = await readFile(resolvedConfigPath, 'utf-8')
	try {
		const config = (await jiti.evalModule(
			content,
			{
				id: resolvedConfigPath,
				forceTranspile: true,
			},
		) as { default: EngineConfig }).default
		return { config: klona(config), file: resolvedConfigPath, content }
	}
	catch (error: any) {
		// Keep the file path and content so integrations can still watch the
		// config file and reload once the user fixes it.
		log.error(`Failed to evaluate config file: ${error.message}`, error)
		return { config: null, file: resolvedConfigPath, content }
	}
}

function usePaths({
	cwd: _cwd,
	cssCodegen,
	tsCodegen,
}: {
	cwd: string
	cssCodegen: string
	tsCodegen: false | string
}) {
	const cwd = signal(_cwd)
	const cssCodegenFilepath = computed(() => isAbsolute(cssCodegen) ? resolve(cssCodegen) : join(cwd(), cssCodegen))
	const tsCodegenFilepath = computed(() => tsCodegen === false ? null : (isAbsolute(tsCodegen) ? resolve(tsCodegen) : join(cwd(), tsCodegen)))

	return {
		cwd,
		cssCodegenFilepath,
		tsCodegenFilepath,
	}
}

function useConfig({
	cwd,
	tsCodegenFilepath,
	currentPackageName,
	autoCreateConfig,
	configOrPath,
	scan,
}: {
	cwd: Signal<string>
	tsCodegenFilepath: Computed<string | Nullish>
	currentPackageName: string
	autoCreateConfig: boolean
	configOrPath: EngineConfig | string | Nullish
	scan: {
		include: string[]
		exclude: string[]
	}
}) {
	const specificConfigPath = computed(() => {
		if (
			typeof configOrPath === 'string' && RE_VALID_CONFIG_EXT.test(configOrPath)
		) {
			return isAbsolute(configOrPath) ? configOrPath : join(cwd(), configOrPath)
		}
		return null
	})
	async function findFirstExistingConfigPath(): Promise<string | null> {
		const _cwd = cwd()
		const _specificConfigPath = specificConfigPath()
		const specificConfigFound = _specificConfigPath != null
			&& statSync(_specificConfigPath, { throwIfNoEntry: false })
				?.isFile()
		if (specificConfigFound) {
			return _specificConfigPath
		}

		const stream = globbyStream(
			'**/{pika,pikacss}.config.{js,cjs,mjs,ts,cts,mts}',
			{
				cwd: _cwd,
				ignore: scan.exclude,
			},
		)
		// eslint-disable-next-line no-unreachable-loop
		for await (const entry of stream) {
			return join(_cwd, entry)
		}
		return null
	}
	async function ensureConfigPath(candidatePath: string | null) {
		if (candidatePath != null)
			return candidatePath

		if (autoCreateConfig === false) {
			log.warn('Config file not found and autoCreateConfig is false')
			return null
		}

		const resolvedConfigPath = specificConfigPath() ?? join(cwd(), 'pika.config.js')
		await writeGeneratedFile(
			resolvedConfigPath,
			createConfigScaffoldContent({
				currentPackageName,
				resolvedConfigPath,
				tsCodegenFilepath: tsCodegenFilepath(),
			}),
		)
		return resolvedConfigPath
	}
	const inlineConfig = typeof configOrPath === 'object' ? configOrPath : null
	async function _loadConfig() {
		try {
			log.debug('Loading engine config')
			if (inlineConfig != null) {
				log.debug('Using inline config')
				return { config: klona(inlineConfig), file: null, content: null }
			}

			const resolvedConfigPath = await ensureConfigPath(await findFirstExistingConfigPath())
			if (resolvedConfigPath == null)
				return { config: null, file: null, content: null }

			return await evaluateConfigModule(resolvedConfigPath)
		}
		catch (error: any) {
			log.error(`Failed to load config file: ${error.message}`, error)
			return { config: null, file: null, content: null }
		}
	}

	const resolvedConfig = signal(inlineConfig)
	const resolvedConfigPath = signal(null as string | null)
	const resolvedConfigContent = signal(null as string | null)
	async function loadConfig() {
		const result = await _loadConfig()
		resolvedConfig(result.config)
		resolvedConfigPath(result.file)
		resolvedConfigContent(result.content)
		return result
	}

	return {
		resolvedConfig,
		resolvedConfigPath,
		resolvedConfigContent,
		loadConfig,
	}
}

function useTransform({
	cwd,
	cssCodegenFilepath,
	tsCodegenFilepath,
	scan,
	fnName,
	markupExtensions,
	usages,
	previewUsages,
	engine,
	transformedFormat,
	beginTransform,
	endTransform,
	triggerStyleUpdated,
	triggerTsCodegenUpdated,
}: {
	scan: {
		include: string[]
		exclude: string[]
	}
	fnName: string
	markupExtensions?: string[]
	transformedFormat: 'string' | 'array'
	cwd: Signal<string>
	cssCodegenFilepath: Signal<string>
	tsCodegenFilepath: Signal<string | null>
	usages: Map<string, UsageRecord[]>
	previewUsages: Map<string, UsageRecord[]>
	engine: Signal<Engine | null>
	beginTransform: () => void
	endTransform: () => void
	triggerStyleUpdated: () => void
	triggerTsCodegenUpdated: () => void
}) {
	const fnUtils = createFnUtils(fnName)
	// User-supplied extensions extend the defaults rather than replace them:
	// dropping built-ins like `vue` would only break scanning.
	const markupIdRE = createMarkupIdRE(markupExtensions == null
		? undefined
		: [...DEFAULT_MARKUP_EXTENSIONS, ...markupExtensions])

	// Line terminators must be escaped too: an unresolved string style item is
	// echoed back verbatim by the engine and may contain a raw newline, which
	// would otherwise split the emitted literal across lines (SyntaxError).
	function quoteWith(value: string, quote: '"' | '\'') {
		const escaped = value.replace(/\\/g, '\\\\')
			.replaceAll(quote, `\\${quote}`)
			.replace(/\n/g, '\\n')
			.replace(/\r/g, '\\r')
			.replace(/\u2028/g, '\\u2028')
			.replace(/\u2029/g, '\\u2029')
		return `${quote}${escaped}${quote}`
	}

	function serializeNames(names: string[], format: 'string' | 'array', quote: '"' | '\'') {
		return format === 'array'
			? `[${names.map(name => quoteWith(name, quote))
				.join(', ')}]`
			: quoteWith(names.join(' '), quote)
	}

	async function transform(code: string, id: string) {
		const _engine = engine()
		if (_engine == null)
			return null

		beginTransform()
		try {
			log.debug(`Transforming file: ${id}`)

			const previousUsageList = usages.get(id)
			const previousPreviewUsageList = previewUsages.get(id)
			const hadUsages = previousUsageList != null
			usages.delete(id)
			previewUsages.delete(id)

			// Find all target function calls
			const functionCalls = findFunctionCalls(code, fnUtils, id, markupIdRE)

			if (functionCalls.length === 0) {
				if (hadUsages) {
					// The file previously contributed styles; regenerate outputs
					// so removed styles disappear from the codegen files.
					triggerStyleUpdated()
					triggerTsCodegenUpdated()
				}
				return
			}
			log.debug(`Found ${functionCalls.length} style function calls in ${id}`)

			const usageList: UsageRecord[] = []
			const previewUsageList: UsageRecord[] = []

			const isMarkupId = markupIdRE != null && markupIdRE.test(id)
			const transformed = new MagicString(code)
			for (const fnCall of functionCalls) {
				try {
					const functionCallStr = fnCall.snippet
					const argsStr = `[${functionCallStr.slice(fnCall.fnName.length + 1, -1)}]`
					// eslint-disable-next-line no-new-func
					const args = new Function(`return ${argsStr}`)() as Parameters<Engine['use']>
					const names = await _engine.use(...args)

					// Emitted literals default to single quotes because the call may sit
					// inside a double-quoted Vue template attribute (:class="pika(...)").
					// In markup sources the enclosing attribute may itself be
					// single-quoted, so use the opposite quote there (heuristic
					// detection; see detectEnclosingAttributeQuote).
					const quote = isMarkupId && detectEnclosingAttributeQuote(code, fnCall.start) === '\''
						? '"'
						: '\''

					let transformedContent: string
					if (fnUtils.isNormal(fnCall.fnName)) {
						transformedContent = serializeNames(names, transformedFormat, quote)
					}
					else if (fnUtils.isForceString(fnCall.fnName)) {
						transformedContent = serializeNames(names, 'string', quote)
					}
					else if (fnUtils.isForceArray(fnCall.fnName)) {
						transformedContent = serializeNames(names, 'array', quote)
					}
					else {
						throw new Error(`Unexpected function name: ${fnCall.fnName}`)
					}

					transformed.update(fnCall.start, fnCall.end + 1, transformedContent)

					const usage: UsageRecord = {
						atomicStyleIds: names,
						params: args,
					}
					usageList.push(usage)
					if (fnUtils.isPreview(fnCall.fnName)) {
						previewUsageList.push(usage)
					}
				}
				catch (error: any) {
					// One un-evaluable call (e.g. referencing local variables) must not
					// discard the other valid calls in the same file.
					log.error(`Failed to transform "${fnCall.fnName}(...)" call at ${isAbsolute(id) ? id : join(cwd(), id)}:${fnCall.start}: ${error.message}`, error)
				}
			}

			if (usageList.length === 0) {
				if (hadUsages) {
					triggerStyleUpdated()
					triggerTsCodegenUpdated()
				}
				return
			}

			usages.set(id, usageList)
			if (previewUsageList.length > 0) {
				previewUsages.set(id, previewUsageList)
			}
			// Re-saving a file whose pika() calls did not change must not force a
			// full CSS/TS regeneration; only trigger when the resolved usage
			// records (or their preview subset) actually differ.
			const usagesUnchanged = hadUsages
				&& isSameUsageList(previousUsageList, usageList)
				&& isSameUsageList(previousPreviewUsageList, previewUsageList)
			if (usagesUnchanged === false) {
				triggerStyleUpdated()
				triggerTsCodegenUpdated()
			}
			log.debug(`Transformed ${usageList.length} style usages in ${id}`)
			return {
				code: transformed.toString(),
				map: transformed.generateMap({ hires: true }),
			}
		}
		catch (error: any) {
			log.error(`Failed to transform code (${isAbsolute(id) ? id : join(cwd(), id)}): ${error.message}`, error)
			return void 0
		}
		finally {
			endTransform()
		}
	}

	return {
		// Declarative filter for bundlers. Bundler plugin adapters may read these
		// getters once at plugin conversion (before `cwd` is finalized) and
		// resolve relative patterns against `process.cwd()`, so the cwd-relative
		// excludes below are only a best effort — consumers must re-check ids at
		// transform time via `ctx.isTransformTarget()`.
		transformFilter: {
			get include() {
				return scan.include
			},
			get exclude() {
				return [
					...scan.exclude,
					relative(cwd(), cssCodegenFilepath()),
					...(tsCodegenFilepath() ? [relative(cwd(), tsCodegenFilepath()!)] : []),
				]
			},
		},
		transform,
	}
}

interface PatternMatcher {
	matches: (path: string) => boolean
	isAbsolutePattern: boolean
}

function useTransformTarget({
	cwd,
	cssCodegenFilepath,
	tsCodegenFilepath,
	scan,
}: {
	cwd: Signal<string>
	cssCodegenFilepath: Computed<string>
	tsCodegenFilepath: Computed<string | null>
	scan: {
		include: string[]
		exclude: string[]
	}
}) {
	// Patterns are fixed at context creation; only the base directory used to
	// resolve relative ids and patterns follows `cwd`, so the matchers can be
	// built once.
	const toMatchers = (patterns: string[]): PatternMatcher[] => patterns.map(pattern => ({
		matches: picomatch(pattern, { dot: true }),
		isAbsolutePattern: isAbsolute(pattern),
	}))
	const includeMatchers = toMatchers(scan.include)
	const excludeMatchers = toMatchers(scan.exclude)

	function isTransformTarget(id: string): boolean {
		// Bundler ids may carry query/hash suffixes (e.g. `App.vue?vue&type=script`).
		const filePath = id.split(/[?#]/, 1)[0]!
		const _cwd = cwd()
		const absoluteId = isAbsolute(filePath) ? resolve(filePath) : resolve(_cwd, filePath)

		// The codegen outputs must never be transformed or scanned: doing so
		// would feed generated content back into style collection.
		if (absoluteId === cssCodegenFilepath())
			return false
		const _tsCodegenFilepath = tsCodegenFilepath()
		if (_tsCodegenFilepath != null && absoluteId === _tsCodegenFilepath)
			return false

		// Relative patterns match against the id relative to the CURRENT cwd;
		// absolute patterns match against the absolute id.
		const relativeId = relative(_cwd, absoluteId)
		const matchesSome = (matchers: PatternMatcher[]) => matchers.some(
			({ matches, isAbsolutePattern }) => matches(isAbsolutePattern ? absoluteId : relativeId),
		)
		return matchesSome(includeMatchers) && !matchesSome(excludeMatchers)
	}

	return { isTransformTarget }
}

/**
 * Creates an `IntegrationContext` that wires together config loading, engine initialization, source file transformation, and codegen output.
 *
 * @param options - The integration configuration including paths, function name, scan globs, and codegen settings.
 * @returns A fully constructed `IntegrationContext`. Call `setup()` on the returned context before using transforms.
 *
 * The context uses reactive signals internally so that computed paths (CSS and TS codegen
 * file paths) automatically update when `cwd` changes. The `setup()` method must be called
 * before any transform or codegen operations - transform calls automatically await the
 * pending setup promise.
 */
export function createCtx(options: IntegrationContextOptions): IntegrationContext {
	const {
		cwd,
		cssCodegenFilepath,
		tsCodegenFilepath,
	} = usePaths(options)

	const {
		resolvedConfig,
		resolvedConfigPath,
		resolvedConfigContent,
		loadConfig,
	} = useConfig({
		...options,
		cwd,
		tsCodegenFilepath,
	})

	const usages = new Map<string, UsageRecord[]>()
	const previewUsages = new Map<string, UsageRecord[]>()

	interface TransformCacheEntry {
		code: string
		result: Awaited<ReturnType<IntegrationContext['transform']>>
		usageList: UsageRecord[]
		previewUsageList: UsageRecord[]
	}
	// Last successful transform result per module id: build mode transforms the
	// same (id, code) twice (the fullyCssCodegen scan pass and the bundler's own
	// transform pass), so the second pass reuses the first pass's work. One
	// entry per id, replaced whenever the code changes — bounded by the number
	// of transformed modules. Cleared on setup() because cached atomic style
	// ids were minted by the previous engine; the epoch counter additionally
	// prevents an in-flight transform drained by setup() from re-inserting a
	// stale entry after the clear.
	const transformResultCache = new Map<string, TransformCacheEntry>()
	let transformCacheEpoch = 0

	const engine = signal(null as Engine | null)
	const hooks = {
		styleUpdated: createEventHook<void>(),
		tsCodegenUpdated: createEventHook<void>(),
	}
	let activeTransforms = 0
	let pendingStyleUpdated = false
	let pendingTsCodegenUpdated = false
	let transformIdleWaiters: (() => void)[] = []

	function waitForIdleTransforms(): Promise<void> {
		if (activeTransforms === 0)
			return Promise.resolve()
		return new Promise((resolveWaiter) => {
			transformIdleWaiters.push(resolveWaiter)
		})
	}

	function notifyTransformsIdle() {
		if (activeTransforms > 0 || transformIdleWaiters.length === 0)
			return
		const waiters = transformIdleWaiters
		transformIdleWaiters = []
		waiters.forEach(resolveWaiter => resolveWaiter())
	}

	function flushPendingUpdates() {
		if (activeTransforms > 0)
			return

		const shouldTriggerStyleUpdated = pendingStyleUpdated
		const shouldTriggerTsCodegenUpdated = pendingTsCodegenUpdated

		pendingStyleUpdated = false
		pendingTsCodegenUpdated = false

		if (shouldTriggerStyleUpdated)
			hooks.styleUpdated.trigger()
		if (shouldTriggerTsCodegenUpdated)
			hooks.tsCodegenUpdated.trigger()
	}

	function queueStyleUpdated() {
		pendingStyleUpdated = true
		flushPendingUpdates()
	}

	function queueTsCodegenUpdated() {
		pendingTsCodegenUpdated = true
		flushPendingUpdates()
	}

	const {
		transformFilter,
		transform,
	} = useTransform({
		...options,
		cwd,
		cssCodegenFilepath,
		tsCodegenFilepath,
		usages,
		previewUsages,
		engine,
		beginTransform: () => {
			activeTransforms++
		},
		endTransform: () => {
			if (activeTransforms > 0)
				activeTransforms--
			flushPendingUpdates()
			notifyTransformsIdle()
		},
		triggerStyleUpdated: queueStyleUpdated,
		triggerTsCodegenUpdated: queueTsCodegenUpdated,
	})

	const { isTransformTarget } = useTransformTarget({
		cwd,
		cssCodegenFilepath,
		tsCodegenFilepath,
		scan: options.scan,
	})

	const ctx: IntegrationContext = {
		currentPackageName: options.currentPackageName,
		fnName: options.fnName,
		transformedFormat: options.transformedFormat,
		get cwd() { return cwd() },
		set cwd(v) { cwd(v) },
		get cssCodegenFilepath() { return cssCodegenFilepath() },
		get tsCodegenFilepath() { return tsCodegenFilepath() },
		get hasVue() { return isPackageExists('vue', { paths: [cwd()] }) },
		get resolvedConfig() { return resolvedConfig() },
		get resolvedConfigPath() { return resolvedConfigPath() },
		get resolvedConfigContent() { return resolvedConfigContent() },
		loadConfig,
		usages,
		previewUsages,
		hooks,
		get engine() {
			const _engine = engine()
			if (_engine == null) {
				throw new Error('Engine is not initialized yet')
			}
			return _engine
		},
		transformFilter,
		isTransformTarget,
		transform: async (code, id) => {
			await ctx.setupPromise
			const cached = transformResultCache.get(id)
			if (cached != null && cached.code === code) {
				// Usages may have been dropped externally (e.g. the bundler
				// reported the file as deleted) since this entry was cached;
				// restore them so a re-added identical file still contributes
				// its styles to the generated outputs.
				if (usages.has(id) === false && cached.usageList.length > 0) {
					usages.set(id, cached.usageList)
					if (cached.previewUsageList.length > 0)
						previewUsages.set(id, cached.previewUsageList)
					queueStyleUpdated()
					queueTsCodegenUpdated()
				}
				return cached.result
			}
			const epoch = transformCacheEpoch
			const result = await transform(code, id)
			if (result != null) {
				// Skip caching when a setup() ran while this transform was in
				// flight: the result was produced by the previous engine.
				if (epoch === transformCacheEpoch) {
					transformResultCache.set(id, {
						code,
						result,
						// A non-null result implies the transform stored a
						// non-empty usage list for this id.
						usageList: usages.get(id)!,
						previewUsageList: previewUsages.get(id) ?? [],
					})
				}
			}
			else {
				// Nullish results are not memoized: they are ambiguous between
				// "no calls found" and "transform failed", and both are cheap to
				// recompute (a failed transform must stay retryable).
				transformResultCache.delete(id)
			}
			return result
		},
		getCssCodegenContent: async () => {
			await ctx.setupPromise

			log.debug('Generating CSS code')

			const atomicStyleIds = [...new Set([...ctx.usages.values()].flatMap(i => [...new Set(i.flatMap(i => i.atomicStyleIds))]))]
			log.debug(`Collecting ${atomicStyleIds.length} atomic style IDs`)

			const layerDecl = ctx.engine.renderLayerOrderDeclaration()
			// Scope preflight pruning (variables, keyframes) to the atomic styles
			// still referenced by live usages: the engine store is append-only, so
			// an unfiltered pass would keep emitting declarations for deleted styles.
			const preflightsCss = await ctx.engine.renderPreflights(true, { usedAtomicStyleIds: atomicStyleIds })
			const atomicCss = await ctx.engine.renderAtomicStyles(true, { atomicStyleIds })

			const css = [
				`/* Auto-generated by ${ctx.currentPackageName} */`,
				layerDecl,
				preflightsCss,
				atomicCss,
			]
				.filter(s => s.trim() !== '')
				.join('\n')
				.trim()

			return css
		},
		getTsCodegenContent: async () => {
			await ctx.setupPromise

			if (ctx.tsCodegenFilepath == null)
				return null

			const content = await generateTsCodegenContent(ctx)
			return content
		},
		writeCssCodegenFile: async () => {
			await ctx.setupPromise
			const content = await ctx.getCssCodegenContent()
			if (content == null)
				return

			log.debug(`Writing CSS code generation file: ${ctx.cssCodegenFilepath}`)
			await writeGeneratedFile(ctx.cssCodegenFilepath, content)
		},
		writeTsCodegenFile: async () => {
			await ctx.setupPromise
			if (ctx.tsCodegenFilepath == null)
				return

			const content = await ctx.getTsCodegenContent()
			if (content == null)
				return

			log.debug(`Writing TypeScript code generation file: ${ctx.tsCodegenFilepath}`)
			await writeGeneratedFile(ctx.tsCodegenFilepath, content)
		},
		fullyCssCodegen: async () => {
			await ctx.setupPromise

			log.debug('Starting full CSS code generation scan')
			const _cwd = cwd()
			const stream = globbyStream(options.scan.include, { cwd: _cwd, ignore: options.scan.exclude })
			const filePaths: string[] = []
			for await (const entry of stream) {
				const filePath = join(_cwd, entry)
				// `scan.exclude` alone does not cover the codegen outputs; re-check
				// through the same predicate the bundler transform path uses.
				if (!ctx.isTransformTarget(filePath))
					continue
				filePaths.push(filePath)
			}
			// Read and transform with bounded concurrency instead of strictly
			// serially; concurrent transforms are already supported (bundlers
			// call ctx.transform concurrently in dev).
			const concurrency = 16
			for (let i = 0; i < filePaths.length; i += concurrency) {
				await Promise.all(filePaths.slice(i, i + concurrency)
					.map(async (filePath) => {
						const code = await readFile(filePath, 'utf-8')
						// collect usages
						await ctx.transform(code, filePath)
					}))
			}
			log.debug(`Scanned ${filePaths.length} files for style collection`)
			await ctx.writeCssCodegenFile()
		},
		setupPromise: null,
		setup: () => {
			// Chain onto any in-flight setup so concurrent calls run serially,
			// and only the latest call clears the shared promise.
			const promise: Promise<void> = (ctx.setupPromise ?? Promise.resolve())
				.then(() => setup())
				.catch((error) => {
					log.error(`Failed to setup integration context: ${error.message}`, error)
				})
				.then(() => {
					if (ctx.setupPromise === promise)
						ctx.setupPromise = null
				})
			ctx.setupPromise = promise
			return promise
		},
	}

	async function setup() {
		log.debug('Setting up integration context')
		// Drain in-flight transforms before clearing state and swapping the
		// engine: a transform suspended at `engine.use()` would otherwise resume
		// against the old engine and write usages the new engine's store does not
		// know about. Only transforms that already began are drained here — new
		// `ctx.transform()` calls await `ctx.setupPromise` at entry (which is
		// already set to this setup run), so this cannot deadlock.
		await waitForIdleTransforms()
		usages.clear()
		previewUsages.clear()
		transformCacheEpoch++
		transformResultCache.clear()
		pendingStyleUpdated = false
		pendingTsCodegenUpdated = false
		hooks.styleUpdated.listeners.clear()
		hooks.tsCodegenUpdated.listeners.clear()
		engine(null)

		await loadConfig()
		const devPlugin = defineEnginePlugin({
			name: '@pikacss/integration:dev',
			preflightUpdated: queueStyleUpdated,
			atomicStyleAdded: queueStyleUpdated,
			autocompleteConfigUpdated: queueTsCodegenUpdated,
		})
		try {
			const config = resolvedConfig() ?? {}
			config.plugins = config.plugins ?? []
			config.plugins.unshift(devPlugin)
			log.debug('Creating engine with loaded/default config')
			engine(await createEngine(config))
		}
		catch (error: any) {
			log.error(`Failed to create engine: ${error.message}. Falling back to default config.`, error)
			engine(await createEngine({ plugins: [devPlugin] }))
		}

		log.debug('Integration context setup successfully')
	}

	return ctx
}
