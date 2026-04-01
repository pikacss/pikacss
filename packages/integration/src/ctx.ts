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
import { createFnUtils, findFunctionCalls } from './ctx.transform-utils'
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
		},
	)
	const content = await readFile(resolvedConfigPath, 'utf-8')
	const config = (await jiti.evalModule(
		content,
		{
			id: resolvedConfigPath,
			forceTranspile: true,
		},
	) as { default: EngineConfig }).default
	return { config: klona(config), file: resolvedConfigPath, content }
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
	usages,
	previewUsages,
	engine,
	transformedFormat,
	triggerStyleUpdated,
	triggerTsCodegenUpdated,
}: {
	scan: {
		include: string[]
		exclude: string[]
	}
	fnName: string
	transformedFormat: 'string' | 'array'
	cwd: Signal<string>
	cssCodegenFilepath: Signal<string>
	tsCodegenFilepath: Signal<string | null>
	usages: Map<string, UsageRecord[]>
	previewUsages: Map<string, UsageRecord[]>
	engine: Signal<Engine | null>
	triggerStyleUpdated: () => void
	triggerTsCodegenUpdated: () => void
}) {
	const fnUtils = createFnUtils(fnName)
	async function transform(code: string, id: string) {
		const _engine = engine()
		if (_engine == null)
			return null

		try {
			log.debug(`Transforming file: ${id}`)

			usages.delete(id)
			previewUsages.delete(id)

			// Find all target function calls
			const functionCalls = findFunctionCalls(code, fnUtils)

			if (functionCalls.length === 0)
				return
			log.debug(`Found ${functionCalls.length} style function calls in ${id}`)

			const usageList: UsageRecord[] = []
			const previewUsageList: UsageRecord[] = []

			const transformed = new MagicString(code)
			for (const fnCall of functionCalls) {
				const functionCallStr = fnCall.snippet
				const argsStr = `[${functionCallStr.slice(fnCall.fnName.length + 1, -1)}]`
				// eslint-disable-next-line no-new-func
				const args = new Function(`return ${argsStr}`)() as Parameters<Engine['use']>
				const names = await _engine.use(...args)
				const usage: UsageRecord = {
					atomicStyleIds: names,
					params: args,
				}
				usageList.push(usage)
				if (fnUtils.isPreview(fnCall.fnName)) {
					previewUsageList.push(usage)
				}

				let transformedContent: string
				if (fnUtils.isNormal(fnCall.fnName)) {
					transformedContent = transformedFormat === 'array'
						? `[${names.map(n => `'${n}'`)
							.join(', ')}]`
						: `'${names.join(' ')}'`
				}
				else if (fnUtils.isForceString(fnCall.fnName)) {
					transformedContent = `'${names.join(' ')}'`
				}
				else if (fnUtils.isForceArray(fnCall.fnName)) {
					transformedContent = `[${names.map(n => `'${n}'`)
						.join(', ')}]`
				}
				else {
					throw new Error(`Unexpected function name: ${fnCall.fnName}`)
				}

				transformed.update(fnCall.start, fnCall.end + 1, transformedContent)
			}

			usages.set(id, usageList)
			if (previewUsageList.length > 0) {
				previewUsages.set(id, previewUsageList)
			}
			triggerStyleUpdated()
			triggerTsCodegenUpdated()
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
	}

	return {
		transformFilter: {
			include: scan.include,
			exclude: [
				...scan.exclude,
				relative(cwd(), cssCodegenFilepath()),
				...(tsCodegenFilepath() ? [relative(cwd(), tsCodegenFilepath()!)] : []),
			],
		},
		transform,
	}
}

/**
 * Creates an `IntegrationContext` that wires together config loading, engine initialization, source file transformation, and codegen output.
 *
 * @param options - The integration configuration including paths, function name, scan globs, and codegen settings.
 * @returns A fully constructed `IntegrationContext`. Call `setup()` on the returned context before using transforms.
 *
 * @remarks
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
	const engine = signal(null as Engine | null)
	const hooks = {
		styleUpdated: createEventHook<void>(),
		tsCodegenUpdated: createEventHook<void>(),
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
		triggerStyleUpdated: () => hooks.styleUpdated.trigger(),
		triggerTsCodegenUpdated: () => hooks.tsCodegenUpdated.trigger(),
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
		transform: async (code, id) => {
			await ctx.setupPromise
			return transform(code, id)
		},
		getCssCodegenContent: async () => {
			await ctx.setupPromise

			log.debug('Generating CSS code')

			const atomicStyleIds = [...new Set([...ctx.usages.values()].flatMap(i => [...new Set(i.flatMap(i => i.atomicStyleIds))]))]
			log.debug(`Collecting ${atomicStyleIds.length} atomic style IDs`)

			const layerDecl = ctx.engine.renderLayerOrderDeclaration()
			const preflightsCss = await ctx.engine.renderPreflights(true)
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
			let fileCount = 0
			for await (const entry of stream) {
				const filePath = join(_cwd, entry)
				const code = await readFile(filePath, 'utf-8')
				// collect usages
				await ctx.transform(code, filePath)
				fileCount++
			}
			log.debug(`Scanned ${fileCount} files for style collection`)
			await ctx.writeCssCodegenFile()
		},
		setupPromise: null,
		setup: () => {
			ctx.setupPromise = setup()
				.catch((error) => {
					log.error(`Failed to setup integration context: ${error.message}`, error)
				})
				.then(() => {
					ctx.setupPromise = null
				})
			return ctx.setupPromise
		},
	}

	async function setup() {
		log.debug('Setting up integration context')
		usages.clear()
		previewUsages.clear()
		hooks.styleUpdated.listeners.clear()
		hooks.tsCodegenUpdated.listeners.clear()
		engine(null)

		await loadConfig()
		const devPlugin = defineEnginePlugin({
			name: '@pikacss/integration:dev',
			preflightUpdated: () => hooks.styleUpdated.trigger(),
			atomicStyleAdded: () => hooks.styleUpdated.trigger(),
			autocompleteConfigUpdated: () => hooks.tsCodegenUpdated.trigger(),
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
