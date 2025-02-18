import type { Engine, EngineConfig } from '@styocss/core'
import type { FnUtils, IntegrationContext, IntegrationContextOptions, UsageRecord } from './types'
import { statSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { createEngine } from '@styocss/core'
import { createJiti } from 'jiti'
import { getPackageInfo, isPackageExists } from 'local-pkg'
import MagicString from 'magic-string'
import micromatch from 'micromatch'
import { dirname, isAbsolute, join, resolve } from 'pathe'
import * as prettier from 'prettier'
import { generateDtsContent } from './dts'
import { createEventHook } from './eventHook'

export const DEV_CSS_FILENAME = 'styo.dev.css'

function findFunctionCallPositions(code: string, RE: RegExp) {
	const result: { fnName: string, start: number, end: number }[] = []
	let matched: RegExpExecArray | null = RE.exec(code)

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
		result.push({ fnName, start, end })
		matched = RE.exec(code)
	}

	return result
}

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

export async function createCtx(options: IntegrationContextOptions) {
	const {
		cwd,
		currentPackageName,
		target,
		configOrPath,
		fnName,
		previewEnabled,
		transformedFormat,
		dts,
		devCss: _devCss,
	} = options

	const devCss = _devCss == null
		? join((await getPackageInfo(currentPackageName, { paths: [cwd] }))!.rootPath, '.temp', DEV_CSS_FILENAME)
		: (isAbsolute(_devCss) ? resolve(_devCss) : join(cwd, _devCss))
	const dtsFilepath = dts === false ? null : (isAbsolute(dts) ? resolve(dts) : join(cwd, dts))

	const inlineConfig = typeof configOrPath === 'object' ? configOrPath : null
	const specificConfigPath = typeof configOrPath === 'string'
		? (isAbsolute(configOrPath) ? configOrPath : join(cwd, configOrPath))
		: null
	const configSources = [
		...specificConfigPath == null ? [] : [specificConfigPath],
		...['styo', 'styocss']
			.flatMap(name => ['js', 'ts', 'cjs', 'cts', 'mjs', 'mts']
				.map(ext => `${name}.config.${ext}`))
			.map(name => join(cwd, name)),
	]

	const targetREs = target.map(t => micromatch.makeRe(t))
	const needToTransform = (id: string) => targetREs.some(re => re.test(id))

	const ctx: IntegrationContext = {
		cwd,
		currentPackageName,
		fnName,
		fnUtils: createFnUtils(fnName),
		previewEnabled,
		transformedFormat,
		devCssFilepath: devCss,
		dtsFilepath,
		hasVue: isPackageExists('vue', { paths: [cwd] }),
		usages: new Map(),
		hooks: {
			styleUpdated: createEventHook(),
			dtsUpdated: createEventHook(),
		},
		loadConfig: async () => {
			if (inlineConfig != null)
				return { config: inlineConfig, file: null }

			const resolvedConfigPath = configSources.find((path) => {
				const stat = statSync(path, { throwIfNoEntry: false })
				return stat != null && stat.isFile()
			})

			if (resolvedConfigPath == null)
				return { config: null, file: null }

			const jiti = createJiti(cwd, {
				fsCache: false,
				moduleCache: false,
			})
			const config = await jiti.import<EngineConfig>(resolvedConfigPath, { default: true })
			return { config, file: resolvedConfigPath }
		},
		init: async () => {
			ctx.isReady = false

			ctx.usages.clear()
			const { config, file } = await ctx.loadConfig()
			ctx.resolvedConfigPath = file
			ctx.engine = await createEngine(config ?? {})
			ctx.engine.config.plugins.unshift(({
				name: '@styocss/integration:dev',
				atomicRuleAdded: () => ctx.hooks.styleUpdated.trigger(),
			}))

			// prepare files
			await mkdir(dirname(devCss), { recursive: true }).catch(() => {})
			await writeFile(devCss, '')
			if (dtsFilepath != null) {
				await mkdir(dirname(dtsFilepath), { recursive: true }).catch(() => {})
				await writeFile(dtsFilepath, '')
			}

			ctx.isReady = true
		},
		isReady: false,
		configSources,
		resolvedConfigPath: null,
		engine: null!,
		transform: async (code, id) => {
			if (
				ctx.isReady === false
				|| !needToTransform(id)
			) {
				return
			}

			ctx.usages.delete(id)

			// Find all target function calls
			const functionCallPositions = findFunctionCallPositions(code, ctx.fnUtils.RE)

			if (functionCallPositions.length === 0)
				return

			const usages: UsageRecord[] = []
			ctx.usages.set(id, usages)

			const transformed = new MagicString(code)
			for (const pos of functionCallPositions) {
				const functionCallStr = code.slice(pos.start, pos.end + 1)
				const argsStr = `[${functionCallStr.slice(pos.fnName.length + 1, -1)}]`
				// eslint-disable-next-line no-new-func
				const args = new Function(`return ${argsStr}`)() as Parameters<Engine['use']>
				const usage = {
					isPreview: previewEnabled,
					params: args,
				}
				usages.push(usage)
				const names = await ctx.engine.use(...args)
				ctx.hooks.dtsUpdated.trigger()

				let transformedContent: string
				if (ctx.fnUtils.isNormal(pos.fnName)) {
					transformedContent = ctx.transformedFormat === 'array'
						? `[${names.map(n => `'${n}'`).join(', ')}]`
						: ctx.transformedFormat === 'string'
							? `'${names.join(' ')}'`
							: names.join(' ')
				}
				else if (ctx.fnUtils.isForceString(pos.fnName)) {
					transformedContent = `'${names.join(' ')}'`
				}
				else if (ctx.fnUtils.isForceArray(pos.fnName)) {
					transformedContent = `[${names.map(n => `'${n}'`).join(', ')}]`
				}
				else if (ctx.fnUtils.isForceInline(pos.fnName)) {
					transformedContent = names.join(' ')
				}
				else {
					throw new Error(`Unexpected function name: ${pos.fnName}`)
				}

				transformed.update(pos.start, pos.end + 1, transformedContent)
			}

			return {
				code: transformed.toString(),
				map: transformed.generateMap({ hires: true }),
			}
		},
		writeDevCssFile: async () => {
			if (ctx.isReady === false)
				return

			const css = await prettier.format([
				ctx.engine.renderPreflights(),
				ctx.engine.renderAtomicRules(),
			].join(''), { parser: 'css' })
			await writeFile(ctx.devCssFilepath, css)
		},
		writeDtsFile: async () => {
			if (ctx.isReady === false || ctx.dtsFilepath == null)
				return

			const content = await generateDtsContent(ctx)
			await writeFile(ctx.dtsFilepath, content)
		},
	}

	await ctx.init()

	return ctx
}
