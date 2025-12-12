import type { Engine, EngineConfig, Nullish } from '@pikacss/core'
import type { Options as GlobbyOptions } from 'globby'
import type { FnUtils, IntegrationContext, IntegrationContextOptions, PrepareCreateIntegrationContextResult, UsageRecord } from './types'
import { statSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createEngine, defineEnginePlugin, log } from '@pikacss/core'
import { globbyStream, isIgnoredByIgnoreFilesSync } from 'globby'
import { createJiti } from 'jiti'
import { klona } from 'klona'
import { isPackageExists } from 'local-pkg'
import MagicString from 'magic-string'
import micromatch from 'micromatch'
import { dirname, isAbsolute, join, relative, resolve } from 'pathe'
import { createEventHook } from './eventHook'
import { generateTsCodegenContent } from './tsCodegen'

function prepare(options: IntegrationContextOptions): PrepareCreateIntegrationContextResult {
	const {
		cwd,
		scan: rawScanOptions,
		cssCodegen,
		tsCodegen,
		configOrPath,
		autoCreateConfig,
		currentPackageName,
	} = options
	const scan = {
		...rawScanOptions,
		options: {
			// defaults
			cwd,
			// user options
			...rawScanOptions.options,
		} satisfies GlobbyOptions,
	}

	const cssCodegenFilepath = isAbsolute(cssCodegen) ? resolve(cssCodegen) : join(cwd, cssCodegen)
	const tsCodegenFilepath = tsCodegen === false ? null : (isAbsolute(tsCodegen) ? resolve(tsCodegen) : join(cwd, tsCodegen))

	// Config
	const inlineConfig = typeof configOrPath === 'object' ? configOrPath : null
	const specificConfigPath = typeof configOrPath === 'string'
		? (isAbsolute(configOrPath) ? configOrPath : join(cwd, configOrPath))
		: null
	async function findFirstExistingConfigPath(): Promise<string | null> {
		const specificConfigFound = specificConfigPath != null
			&& statSync(specificConfigPath, { throwIfNoEntry: false })
				?.isFile()
		if (specificConfigFound) {
			return specificConfigPath
		}

		const stream = globbyStream('**/{pika,pikacss}.config.{js,cjs,mjs,ts,cts,mts}', scan.options)
		// eslint-disable-next-line no-unreachable-loop
		for await (const entry of stream) {
			return join(cwd, entry)
		}
		return null
	}
	async function loadConfig() {
		log.debug('Loading engine config')
		if (inlineConfig != null) {
			log.debug('Using inline config')
			return { config: klona(inlineConfig), file: null }
		}

		let resolvedConfigPath = await findFirstExistingConfigPath()

		if (resolvedConfigPath == null) {
			if (autoCreateConfig === false) {
				log.warn('Config file not found and autoCreateConfig is false')
				return { config: null, file: null }
			}

			resolvedConfigPath = join(cwd, 'pika.config.js')
			await mkdir(dirname(resolvedConfigPath), { recursive: true })
				.catch(() => {})
			const relativeTsCodegenFilepath = tsCodegenFilepath == null
				? null
				: `./${relative(dirname(resolvedConfigPath), tsCodegenFilepath)}`
			await writeFile(resolvedConfigPath, [
				...relativeTsCodegenFilepath == null
					? []
					: [`/** @type {import('${relativeTsCodegenFilepath}')} */`],
				`import { defineEngineConfig } from '${currentPackageName}'`,
				'',
				'export default defineEngineConfig({',
				'  // Add your PikaCSS engine config here',
				'})',
			].join('\n'))
		}

		log.info(`Using config file: ${resolvedConfigPath}`)
		const jiti = createJiti(cwd, {
			fsCache: false,
			moduleCache: false,
		})
		const config = (await jiti.import(resolvedConfigPath) as { default: EngineConfig }).default
		return { config: klona(config), file: resolvedConfigPath }
	}

	// Transform
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
	const fnUtils = createFnUtils(options.fnName)
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
	function createTransformIncludeFn(resolvedConfigPath: string | null) {
		log.debug('Initializing transform include patterns')
		const targetREs = [scan.patterns].flat()
			.map(t => micromatch.makeRe(t))
		const isIgnored = isIgnoredByIgnoreFilesSync(
			[
				...scan.options.gitignore ? ['**/.gitignore'] : [],
				scan.options.ignoreFiles ?? [],
			].flat(),
			{
				...scan.options,
				ignore: [
					...scan.options?.ignore ?? [],
					resolvedConfigPath != null ? relative(cwd, resolvedConfigPath) : null,
				].filter(Boolean) as string[
				],
			},
		)
		return (id: string) => !isIgnored(id) && targetREs.some(re => re.test(id))
	}

	return {
		...options,
		scan,
		cssCodegenFilepath,
		tsCodegenFilepath,
		loadConfig,
		fnUtils,
		findFunctionCalls,
		createTransformIncludeFn,
	}
}

export async function createCtx(options: IntegrationContextOptions) {
	const {
		cwd,
		currentPackageName,
		scan: scanOptions,
		fnName,
		transformedFormat,
		tsCodegenFilepath,
		cssCodegenFilepath,
		loadConfig,
		fnUtils,
		findFunctionCalls,
		createTransformIncludeFn,
	} = prepare(options)
	log.debug(`Creating integration context: ${currentPackageName}`)

	const ctx: IntegrationContext = {
		cwd,
		currentPackageName,
		fnName,
		transformedFormat,
		cssCodegenFilepath,
		tsCodegenFilepath,
		hasVue: isPackageExists('vue', { paths: [cwd] }),
		usages: new Map(),
		hooks: {
			styleUpdated: createEventHook(),
			tsCodegenUpdated: createEventHook(),
		},
		loadConfig,
		resolvedConfigPath: null,
		engine: null!,
		transformInclude: null!,
		transform: async (code, id) => {
			try {
				if (ctx.transformInclude(id) === false) {
					return
				}
				log.debug(`Transforming file: ${id}`)

				ctx.usages.delete(id)

				// Find all target function calls
				const functionCalls = findFunctionCalls(code)

				if (functionCalls.length === 0)
					return
				log.debug(`Found ${functionCalls.length} style function calls in ${id}`)

				const usages: UsageRecord[] = []

				const transformed = new MagicString(code)
				for (const fnCall of functionCalls) {
					const functionCallStr = fnCall.snippet
					const argsStr = `[${functionCallStr.slice(fnCall.fnName.length + 1, -1)}]`
					// eslint-disable-next-line no-new-func
					const args = new Function(`return ${argsStr}`)() as Parameters<Engine['use']>
					const names = await ctx.engine.use(...args)
					const usage: UsageRecord = {
						atomicStyleIds: names,
						params: args,
					}
					usages.push(usage)

					let transformedContent: string
					if (fnUtils.isNormal(fnCall.fnName)) {
						transformedContent = ctx.transformedFormat === 'array'
							? `[${names.map(n => `'${n}'`)
								.join(', ')}]`
							: ctx.transformedFormat === 'string'
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

				ctx.usages.set(id, usages)
				ctx.hooks.styleUpdated.trigger()
				ctx.hooks.tsCodegenUpdated.trigger()
				log.debug(`Transformed ${usages.length} style usages in ${id}`)
				return {
					code: transformed.toString(),
					map: transformed.generateMap({ hires: true }),
				}
			}
			catch (error: any) {
				log.error(`Failed to transform code (${join(cwd, id)}): ${error.message}`, error)
				return void 0
			}
		},
		getCssCodegenContent: async (isDev) => {
			log.debug('Generating CSS code')

			const atomicStyleIds = [...new Set([...ctx.usages.values()].flatMap(i => [...new Set(i.flatMap(i => i.atomicStyleIds))]))]
			log.debug(`Collecting ${atomicStyleIds.length} atomic style IDs`)
			const css = [
				`/* Auto-generated by ${ctx.currentPackageName} */`,
				await ctx.engine.renderPreflights(isDev),
				await ctx.engine.renderAtomicStyles(isDev, { atomicStyleIds }),
			].join('\n')
				.trim()

			return css
		},
		getTsCodegenContent: async () => {
			if (ctx.tsCodegenFilepath == null)
				return null

			const content = await generateTsCodegenContent(ctx)
			return content
		},
		writeCssCodegenFile: async (isDev = true) => {
			const content = await ctx.getCssCodegenContent(isDev)
			if (content == null)
				return
			log.debug(`Writing CSS code generation file: ${ctx.cssCodegenFilepath}`)
			await writeFile(ctx.cssCodegenFilepath, content)
		},
		writeTsCodegenFile: async () => {
			const content = await ctx.getTsCodegenContent()
			if (ctx.tsCodegenFilepath == null || content == null)
				return
			log.debug(`Writing TypeScript code generation file: ${ctx.tsCodegenFilepath}`)
			await writeFile(ctx.tsCodegenFilepath, content)
		},
		fullyCssCodegen: async () => {
			log.debug('Starting full CSS code generation scan')
			const stream = globbyStream(scanOptions.patterns, scanOptions.options)
			let fileCount = 0
			for await (const entry of stream) {
				const code = await readFile(join(cwd, entry), 'utf-8')
				// collect usages
				await ctx.transform(code, entry)
				fileCount++
			}
			log.debug(`Scanned ${fileCount} files for style collection`)
			await ctx.writeCssCodegenFile()
		},
	}

	async function init() {
		log.debug('Initializing integration context')
		ctx.usages.clear()
		ctx.hooks.styleUpdated.listeners.clear()
		ctx.hooks.tsCodegenUpdated.listeners.clear()
		ctx.resolvedConfigPath = null
		ctx.engine = null!
		ctx.transformInclude = null!

		const { config, file } = await ctx.loadConfig()
			.catch((error) => {
				log.error(`Failed to load config file: ${error.message}`, error)
				return { config: null, file: null }
			})
		ctx.resolvedConfigPath = file
		const devPlugin = defineEnginePlugin({
			name: '@pikacss/integration:dev',
			preflightUpdated: () => ctx.hooks.styleUpdated.trigger(),
			atomicStyleAdded: () => ctx.hooks.styleUpdated.trigger(),
			autocompleteConfigUpdated: () => ctx.hooks.tsCodegenUpdated.trigger(),
		})
		try {
			const _config = config ?? {}
			_config.plugins = _config.plugins ?? []
			_config.plugins.unshift(devPlugin)
			log.debug('Creating engine with loaded/default config')
			ctx.engine = await createEngine(_config)
		}
		catch (error: any) {
			log.error(`Failed to create engine: ${error.message}. Falling back to default config.`, error)
			ctx.engine = await createEngine({ plugins: [devPlugin] })
		}
		ctx.transformInclude = createTransformIncludeFn(ctx.resolvedConfigPath)

		// prepare files
		await mkdir(dirname(cssCodegenFilepath), { recursive: true })
			.catch(() => {})
		await writeFile(cssCodegenFilepath, '')

		if (tsCodegenFilepath != null) {
			await mkdir(dirname(tsCodegenFilepath), { recursive: true })
				.catch(() => {})
			const content = await generateTsCodegenContent(ctx)
			await writeFile(tsCodegenFilepath, content)
			log.debug(`Generated TypeScript code generation file: ${tsCodegenFilepath}`)
		}

		log.debug('Integration context initialized successfully')
	}

	await init()
	log.debug('Integration context created successfully')

	return ctx
}
