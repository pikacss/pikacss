import type { Engine, EngineConfig, Nullish } from '@pikacss/core'
import type { FnUtils, IntegrationContext, IntegrationContextOptions, UsageRecord } from './types'
import { statSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createEngine, defineEnginePlugin, log } from '@pikacss/core'
import { computed, signal } from 'alien-signals'
import { globbyStream } from 'globby'
import { klona } from 'klona'
import { isPackageExists } from 'local-pkg'
import MagicString from 'magic-string'
import { dirname, isAbsolute, join, relative, resolve } from 'pathe'
import { createEventHook } from './eventHook'
import { generateTsCodegenContent } from './tsCodegen'

interface Signal<T> {
	(): T
	(value: T): void
}

interface Computed<T> {
	(): T
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
	const RE_VALID_CONFIG_EXT = /\.(?:js|cjs|mjs|ts|cts|mts)$/
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
				ignore: scan.exclude,
			},
		)
		// eslint-disable-next-line no-unreachable-loop
		for await (const entry of stream) {
			return join(_cwd, entry)
		}
		return null
	}
	const inlineConfig = typeof configOrPath === 'object' ? configOrPath : null
	async function _loadConfig() {
		try {
			log.debug('Loading engine config')
			if (inlineConfig != null) {
				log.debug('Using inline config')
				return { config: klona(inlineConfig), file: null }
			}

			let resolvedConfigPath = await findFirstExistingConfigPath()

			const _cwd = cwd()
			if (resolvedConfigPath == null) {
				if (autoCreateConfig === false) {
					log.warn('Config file not found and autoCreateConfig is false')
					return { config: null, file: null }
				}

				const _specificConfigPath = specificConfigPath()
				resolvedConfigPath = join(_cwd, _specificConfigPath ?? 'pika.config.js')
				await mkdir(dirname(resolvedConfigPath), { recursive: true })
					.catch(() => {})
				const _tsCodegenFilepath = tsCodegenFilepath()
				const relativeTsCodegenFilepath = _tsCodegenFilepath == null
					? null
					: `./${relative(dirname(resolvedConfigPath), _tsCodegenFilepath)}`
				await writeFile(resolvedConfigPath, [
					...relativeTsCodegenFilepath == null
						? []
						: [`/// <reference path="${relativeTsCodegenFilepath}" />`],
					`import { defineEngineConfig } from '${currentPackageName}'`,
					'',
					'export default defineEngineConfig({',
					'  // Add your PikaCSS engine config here',
					'})',
				].join('\n'))
			}

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
			return { config: klona(config), file: resolvedConfigPath }
		}
		catch (error: any) {
			log.error(`Failed to load config file: ${error.message}`, error)
			return { config: null, file: null }
		}
	}

	// const loadedConfig = signal({ config: inlineConfig, file: null as string | null })
	const resolvedConfig = signal(inlineConfig)
	const resolvedConfigPath = signal(null as string | null)
	async function loadConfig() {
		const result = await _loadConfig()
		resolvedConfig(result.config)
		resolvedConfigPath(result.file)
		return result
	}

	return {
		resolvedConfig,
		resolvedConfigPath,
		loadConfig,
	}
}

function useTransform({
	cwd,
	scan,
	fnName,
	usages,
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
	transformedFormat: 'string' | 'array' | 'inline'
	cwd: Signal<string>
	usages: Map<string, UsageRecord[]>
	engine: Signal<Engine | null>
	triggerStyleUpdated: () => void
	triggerTsCodegenUpdated: () => void
}) {
	const ESCAPE_REPLACE_RE = /[.*+?^${}()|[\]\\/]/g
	function createFnUtils(fnName: string): FnUtils {
		const available = {
			normal: new Set([fnName]),
			forceString: new Set([`${fnName}.str`, `${fnName}['str']`, `${fnName}["str"]`, `${fnName}[\`str\`]`]),
			forceArray: new Set([`${fnName}.arr`, `${fnName}['arr']`, `${fnName}["arr"]`, `${fnName}[\`arr\`]`]),
			forceInline: new Set([`${fnName}.inl`, `${fnName}['inl']`, `${fnName}["inl"]`, `${fnName}[\`inl\`]`]),
			// preview
			normalPreview: new Set([`${fnName}p`]),
			forceStringPreview: new Set([`${fnName}p.str`, `${fnName}p['str']`, `${fnName}p["str"]`, `${fnName}p[\`str\`]`]),
			forceArrayPreview: new Set([`${fnName}p.arr`, `${fnName}p['arr']`, `${fnName}p["arr"]`, `${fnName}p[\`arr\`]`]),
			forceInlinePreview: new Set([`${fnName}p.inl`, `${fnName}p['inl']`, `${fnName}p["inl"]`, `${fnName}p[\`inl\`]`]),
		}
		// eslint-disable-next-line style/newline-per-chained-call
		const RE = new RegExp(`\\b(${Object.values(available).flatMap(s => [...s].map(f => `(${f.replace(ESCAPE_REPLACE_RE, '\\$&')})`)).join('|')})\\(`, 'g')

		return {
			isNormal: (fnName: string) => available.normal.has(fnName) || available.normalPreview.has(fnName),
			isForceString: (fnName: string) => available.forceString.has(fnName) || available.forceStringPreview.has(fnName),
			isForceArray: (fnName: string) => available.forceArray.has(fnName) || available.forceArrayPreview.has(fnName),
			isForceInline: (fnName: string) => available.forceInline.has(fnName) || available.forceInlinePreview.has(fnName),
			isPreview: (fnName: string) => available.normalPreview.has(fnName) || available.forceStringPreview.has(fnName) || available.forceArrayPreview.has(fnName) || available.forceInlinePreview.has(fnName),
			RE,
		}
	}
	const fnUtils = createFnUtils(fnName)
	function findFunctionCalls(code: string) {
		const RE = fnUtils.RE
		const result: { fnName: string, start: number, end: number, snippet: string }[] = []
		let matched: RegExpExecArray | Nullish = RE.exec(code)

		while (matched != null) {
			const fnName = matched[1]!
			const start = matched.index
			let end = start + fnName.length
			let depth = 1
			let inString: '\'' | '"' | false = false
			while (depth > 0) {
				end++
				if (inString === false && code[end] === '(')
					depth++
				else if (inString === false && code[end] === ')')
					depth--
				else if (inString === false && (code[end] === '\'' || code[end] === '"'))
					inString = code[end] as '\'' | '"'
				else if (inString === code[end])
					inString = false
			}
			const snippet = code.slice(start, end + 1)
			result.push({ fnName, start, end, snippet })
			matched = RE.exec(code)
		}

		return result
	}
	async function transform(code: string, id: string) {
		const _engine = engine()
		if (_engine == null)
			return null

		try {
			log.debug(`Transforming file: ${id}`)

			usages.delete(id)

			// Find all target function calls
			const functionCalls = findFunctionCalls(code)

			if (functionCalls.length === 0)
				return
			log.debug(`Found ${functionCalls.length} style function calls in ${id}`)

			const usageList: UsageRecord[] = []

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

				let transformedContent: string
				if (fnUtils.isNormal(fnCall.fnName)) {
					transformedContent = transformedFormat === 'array'
						? `[${names.map(n => `'${n}'`)
							.join(', ')}]`
						: transformedFormat === 'string'
							? `'${names.join(' ')}'`
							: names.join(' ')
				}
				else if (fnUtils.isForceString(fnCall.fnName)) {
					transformedContent = `'${names.join(' ')}'`
				}
				else if (fnUtils.isForceArray(fnCall.fnName)) {
					transformedContent = `[${names.map(n => `'${n}'`)
						.join(', ')}]`
				}
				else if (fnUtils.isForceInline(fnCall.fnName)) {
					transformedContent = names.join(' ')
				}
				else {
					throw new Error(`Unexpected function name: ${fnCall.fnName}`)
				}

				transformed.update(fnCall.start, fnCall.end + 1, transformedContent)
			}

			usages.set(id, usageList)
			triggerStyleUpdated()
			triggerTsCodegenUpdated()
			log.debug(`Transformed ${usageList.length} style usages in ${id}`)
			return {
				code: transformed.toString(),
				map: transformed.generateMap({ hires: true }),
			}
		}
		catch (error: any) {
			log.error(`Failed to transform code (${join(cwd(), id)}): ${error.message}`, error)
			return void 0
		}
	}

	return {
		transformFilter: scan,
		transform,
	}
}

export function createCtx(options: IntegrationContextOptions): IntegrationContext {
	const {
		cwd,
		cssCodegenFilepath,
		tsCodegenFilepath,
	} = usePaths(options)

	const {
		resolvedConfig,
		resolvedConfigPath,
		loadConfig,
	} = useConfig({
		...options,
		cwd,
		tsCodegenFilepath,
	})

	const usages = new Map<string, UsageRecord[]>()
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
		usages,
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
		loadConfig,
		usages,
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
			const css = [
				`/* Auto-generated by ${ctx.currentPackageName} */`,
				await ctx.engine.renderPreflights(true),
				await ctx.engine.renderAtomicStyles(true, { atomicStyleIds }),
			].join('\n')
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

			await mkdir(dirname(ctx.cssCodegenFilepath), { recursive: true })
				.catch(() => {})
			log.debug(`Writing CSS code generation file: ${ctx.cssCodegenFilepath}`)
			await writeFile(ctx.cssCodegenFilepath, content)
		},
		writeTsCodegenFile: async () => {
			await ctx.setupPromise
			if (ctx.tsCodegenFilepath == null)
				return

			const content = await ctx.getTsCodegenContent()
			if (content == null)
				return

			await mkdir(dirname(ctx.tsCodegenFilepath!), { recursive: true })
				.catch(() => {})
			log.debug(`Writing TypeScript code generation file: ${ctx.tsCodegenFilepath}`)
			await writeFile(ctx.tsCodegenFilepath, content)
		},
		fullyCssCodegen: async () => {
			await ctx.setupPromise

			log.debug('Starting full CSS code generation scan')
			const stream = globbyStream(options.scan.include, { ignore: options.scan.exclude })
			let fileCount = 0
			const _cwd = cwd()
			for await (const entry of stream) {
				const code = await readFile(join(_cwd, entry), 'utf-8')
				// collect usages
				await ctx.transform(code, entry)
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
