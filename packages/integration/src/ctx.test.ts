import type { EngineConfig } from '@pikacss/core'
import type { IntegrationContextOptions } from './types'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createEngine, log } from '@pikacss/core'
import { globbyStream } from 'globby'
import { isPackageExists } from 'local-pkg'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCtx } from './ctx'
import { generateTsCodegenContent } from './tsCodegen'

// ── Mocks ──────────────────────────────────────────────────────

vi.mock('node:fs', () => ({
	statSync: vi.fn(() => null),
}))

vi.mock('node:fs/promises', () => ({
	mkdir: vi.fn(async () => undefined),
	readFile: vi.fn(async () => 'export default {}'),
	writeFile: vi.fn(async () => undefined),
}))

vi.mock('globby', () => ({
	globbyStream: vi.fn(() => ({
		[Symbol.asyncIterator]: () => ({
			next: async () => ({ done: true, value: undefined }),
		}),
	})),
}))

vi.mock('local-pkg', () => ({
	isPackageExists: vi.fn(() => false),
}))

vi.mock('./tsCodegen', () => ({
	generateTsCodegenContent: vi.fn(async () => '/* ts codegen */'),
}))

const mockEngine = {
	use: vi.fn(async () => ['c-red']),
	renderPreflights: vi.fn(async () => '/* preflights */'),
	renderAtomicStyles: vi.fn(async () => '.c-red { color: red }'),
	renderLayerOrderDeclaration: vi.fn(() => ''),
}

vi.mock('@pikacss/core', async (importOriginal) => {
	const original = await importOriginal<typeof import('@pikacss/core')>()
	return {
		...original,
		createEngine: vi.fn(async () => mockEngine),
		defineEnginePlugin: vi.fn((p: any) => p),
		log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
	}
})

// ── Helpers ────────────────────────────────────────────────────

function opts(overrides?: Partial<IntegrationContextOptions>): IntegrationContextOptions {
	return {
		cwd: '/test/project',
		currentPackageName: '@pikacss/test',
		scan: { include: ['**/*.ts'], exclude: ['node_modules'] },
		configOrPath: { plugins: [] } as EngineConfig,
		fnName: 'pika',
		transformedFormat: 'string',
		tsCodegen: 'pika.gen.ts',
		cssCodegen: 'pika.gen.css',
		autoCreateConfig: true,
		...overrides,
	}
}

// ── Tests ──────────────────────────────────────────────────────

describe('createCtx', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns ctx with expected static properties', () => {
		const ctx = createCtx(opts())
		expect(ctx.currentPackageName)
			.toBe('@pikacss/test')
		expect(ctx.fnName)
			.toBe('pika')
		expect(ctx.transformedFormat)
			.toBe('string')
		expect(ctx.usages)
			.toBeInstanceOf(Map)
		expect(ctx.setupPromise)
			.toBeNull()
	})

	// ── usePaths ──────────────────────────────────────────────

	it('resolves relative cssCodegen and tsCodegen paths', () => {
		const ctx = createCtx(opts())
		expect(ctx.cssCodegenFilepath)
			.toBe('/test/project/pika.gen.css')
		expect(ctx.tsCodegenFilepath)
			.toBe('/test/project/pika.gen.ts')
	})

	it('resolves absolute cssCodegen path', () => {
		const ctx = createCtx(opts({ cssCodegen: '/abs/out.css' }))
		expect(ctx.cssCodegenFilepath)
			.toBe('/abs/out.css')
	})

	it('resolves absolute tsCodegen path', () => {
		const ctx = createCtx(opts({ tsCodegen: '/abs/out.ts' }))
		expect(ctx.tsCodegenFilepath)
			.toBe('/abs/out.ts')
	})

	it('returns null tsCodegenFilepath when tsCodegen is false', () => {
		const ctx = createCtx(opts({ tsCodegen: false }))
		expect(ctx.tsCodegenFilepath)
			.toBeNull()
	})

	// ── cwd getter/setter ─────────────────────────────────────

	it('gets and sets cwd', () => {
		const ctx = createCtx(opts())
		expect(ctx.cwd)
			.toBe('/test/project')
		ctx.cwd = '/new'
		expect(ctx.cwd)
			.toBe('/new')
	})

	// ── hasVue ────────────────────────────────────────────────

	it('reports hasVue via isPackageExists', () => {
		const ctx = createCtx(opts())
		expect(ctx.hasVue)
			.toBe(false)
		vi.mocked(isPackageExists)
			.mockReturnValue(true)
		expect(ctx.hasVue)
			.toBe(true)
	})

	// ── engine getter ─────────────────────────────────────────

	it('throws when engine is not initialized', () => {
		const ctx = createCtx(opts())
		expect(() => ctx.engine)
			.toThrow('Engine is not initialized yet')
	})

	// ── transformFilter ───────────────────────────────────────

	it('includes scan patterns and excludes codegen paths', () => {
		const ctx = createCtx(opts())
		expect(ctx.transformFilter.include)
			.toEqual(['**/*.ts'])
		expect(ctx.transformFilter.exclude)
			.toContain('/test/project/pika.gen.css')
		expect(ctx.transformFilter.exclude)
			.toContain('/test/project/pika.gen.ts')
	})

	it('excludes only cssCodegen when tsCodegen is false', () => {
		const ctx = createCtx(opts({ tsCodegen: false }))
		expect(ctx.transformFilter.exclude)
			.toContain('/test/project/pika.gen.css')
		// node_modules + cssCodegenFilepath only
		expect(ctx.transformFilter.exclude.length)
			.toBe(2)
	})

	// ── setup ─────────────────────────────────────────────────

	it('setup initialises engine with inline config', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		expect(vi.mocked(createEngine))
			.toHaveBeenCalled()
		expect(ctx.engine)
			.toBe(mockEngine)
	})

	it('setup clears usages and hook listeners', async () => {
		const ctx = createCtx(opts())
		ctx.usages.set('x', [])
		ctx.hooks.styleUpdated.on(() => {})
		ctx.hooks.tsCodegenUpdated.on(() => {})
		await ctx.setup()
		expect(ctx.usages.size)
			.toBe(0)
		expect(ctx.hooks.styleUpdated.listeners.size)
			.toBe(0)
		expect(ctx.hooks.tsCodegenUpdated.listeners.size)
			.toBe(0)
	})

	it('setup falls back to default config on engine creation failure', async () => {
		vi.mocked(createEngine)
			.mockRejectedValueOnce(new Error('boom'))
			.mockResolvedValueOnce(mockEngine as any)
		const ctx = createCtx(opts())
		await ctx.setup()
		expect(vi.mocked(log.error))
			.toHaveBeenCalledWith(
				expect.stringContaining('Failed to create engine'),
				expect.any(Error),
			)
		expect(vi.mocked(createEngine))
			.toHaveBeenCalledTimes(2)
	})

	// ── loadConfig ────────────────────────────────────────────

	it('loadConfig returns inline config', async () => {
		const cfg = { plugins: [] } as EngineConfig
		const ctx = createCtx(opts({ configOrPath: cfg }))
		const r = await ctx.loadConfig()
		expect(r.config)
			.toEqual(cfg)
		expect(r.file)
			.toBeNull()
	})

	it('loadConfig returns null when autoCreateConfig false and no file', async () => {
		const ctx = createCtx(opts({ configOrPath: undefined, autoCreateConfig: false }))
		const r = await ctx.loadConfig()
		expect(r.config)
			.toBeNull()
		expect(vi.mocked(log.warn))
			.toHaveBeenCalledWith(expect.stringContaining('autoCreateConfig is false'))
	})

	it('loadConfig creates config when not found (autoCreate true)', async () => {
		const ctx = createCtx(opts({ configOrPath: undefined, autoCreateConfig: true }))
		await ctx.loadConfig()
		expect(vi.mocked(writeFile))
			.toHaveBeenCalled()
	})

	it('loadConfig creates config without tsCodegen reference when tsCodegen false', async () => {
		const ctx = createCtx(opts({ configOrPath: undefined, autoCreateConfig: true, tsCodegen: false }))
		await ctx.loadConfig()
		const calls = vi.mocked(writeFile).mock.calls
		if (calls.length > 0) {
			expect(String(calls[0]![1]))
				.not
				.toContain('/// <reference')
		}
	})

	it('loadConfig handles absolute config path', async () => {
		const { statSync } = await import('node:fs')
		vi.mocked(statSync)
			.mockReturnValue({ isFile: () => true } as any)
		const ctx = createCtx(opts({ configOrPath: '/abs/pika.config.ts' }))
		await ctx.loadConfig()
		expect(vi.mocked(statSync))
			.toHaveBeenCalledWith('/abs/pika.config.ts', expect.any(Object))
	})

	it('loadConfig handles relative config path', async () => {
		const { statSync } = await import('node:fs')
		vi.mocked(statSync)
			.mockReturnValue({ isFile: () => true } as any)
		const ctx = createCtx(opts({ configOrPath: 'my.config.cts' }))
		await ctx.loadConfig()
		expect(vi.mocked(statSync))
			.toHaveBeenCalledWith('/test/project/my.config.cts', expect.any(Object))
	})

	it('loadConfig returns null on error', async () => {
		const { statSync } = await import('node:fs')
		vi.mocked(statSync)
			.mockImplementation(() => {
				throw new Error('FS')
			})
		const ctx = createCtx(opts({ configOrPath: 'bad.config.ts' }))
		const r = await ctx.loadConfig()
		expect(r.config)
			.toBeNull()
	})

	it('loadConfig treats non-ext string as non-specific', async () => {
		const ctx = createCtx(opts({ configOrPath: 'not-a-config', autoCreateConfig: false }))
		const r = await ctx.loadConfig()
		expect(r.config)
			.toBeNull()
	})

	it('loadConfig picks up config from globbyStream', async () => {
		vi.mocked(globbyStream)
			.mockReturnValue({
				[Symbol.asyncIterator]: () => {
					let done = false
					return {
						next: async () => {
							if (!done) {
								done = true
								return { done: false, value: 'pika.config.ts' }
							}
							return { done: true, value: undefined }
						},
					}
				},
			} as any)
		const ctx = createCtx(opts({ configOrPath: undefined }))
		await ctx.loadConfig()
		expect(vi.mocked(globbyStream))
			.toHaveBeenCalledWith(
				'**/{pika,pikacss}.config.{js,cjs,mjs,ts,cts,mts}',
				{ ignore: ['node_modules'] },
			)
	})

	// ── transform ─────────────────────────────────────────────

	it('transform returns null when engine is not set', async () => {
		const ctx = createCtx(opts())
		const r = await ctx.transform('pika(\'color:red\')', 'x.ts')
		expect(r)
			.toBeNull()
	})

	it('transform string format', async () => {
		const ctx = createCtx(opts({ transformedFormat: 'string' }))
		await ctx.setup()
		const r = await ctx.transform('pika(\'color:red\')', 'x.ts')
		expect(r?.code)
			.toContain('\'c-red\'')
	})

	it('transform array format', async () => {
		const ctx = createCtx(opts({ transformedFormat: 'array' }))
		await ctx.setup()
		const r = await ctx.transform('pika(\'color:red\')', 'x.ts')
		expect(r?.code)
			.toContain('[\'c-red\']')
	})

	it('transform inline format', async () => {
		const ctx = createCtx(opts({ transformedFormat: 'inline' }))
		await ctx.setup()
		const r = await ctx.transform('pika(\'color:red\')', 'x.ts')
		expect(r?.code)
			.toContain('c-red')
	})

	it('transform returns undefined when no fn calls found', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		const r = await ctx.transform('const x = 1', 'x.ts')
		expect(r)
			.toBeUndefined()
	})

	it('transform pika.str forces string', async () => {
		const ctx = createCtx(opts({ transformedFormat: 'array' }))
		await ctx.setup()
		const r = await ctx.transform('pika.str(\'color:red\')', 'x.ts')
		expect(r?.code)
			.toContain('\'c-red\'')
		expect(r?.code)
			.not
			.toContain('[')
	})

	it('transform pika.arr forces array', async () => {
		const ctx = createCtx(opts({ transformedFormat: 'string' }))
		await ctx.setup()
		const r = await ctx.transform('pika.arr(\'color:red\')', 'x.ts')
		expect(r?.code)
			.toContain('[\'c-red\']')
	})

	it('transform preview variant pikap', async () => {
		const ctx = createCtx(opts({ transformedFormat: 'string' }))
		await ctx.setup()
		const r = await ctx.transform('pikap(\'color:red\')', 'x.ts')
		expect(r?.code)
			.toContain('\'c-red\'')
	})

	it('transform preview variant pikap.str', async () => {
		const ctx = createCtx(opts({ transformedFormat: 'array' }))
		await ctx.setup()
		const r = await ctx.transform('pikap.str(\'color:red\')', 'x.ts')
		expect(r?.code)
			.toContain('\'c-red\'')
	})

	it('transform preview variant pikap.arr', async () => {
		const ctx = createCtx(opts({ transformedFormat: 'string' }))
		await ctx.setup()
		const r = await ctx.transform('pikap.arr(\'color:red\')', 'x.ts')
		expect(r?.code)
			.toContain('[\'c-red\']')
	})

	it('transform bracket access pika["str"]', async () => {
		const ctx = createCtx(opts({ transformedFormat: 'array' }))
		await ctx.setup()
		const r = await ctx.transform('pika["str"](\'color:red\')', 'x.ts')
		expect(r?.code)
			.toContain('\'c-red\'')
	})

	it('transform bracket access pika[\'arr\']', async () => {
		const ctx = createCtx(opts({ transformedFormat: 'string' }))
		await ctx.setup()
		const r = await ctx.transform('pika[\'arr\'](\'color:red\')', 'x.ts')
		expect(r?.code)
			.toContain('[\'c-red\']')
	})

	it('transform handles single-line comments', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.transform('pika(\'color:red\' // comment\n)', 'x.ts')
	})

	it('transform handles multi-line comments', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		const r = await ctx.transform('pika(\'color:red\' /* c */)', 'x.ts')
		expect(r)
			.toBeDefined()
	})

	it('transform handles escape sequences', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.transform('pika(\'color:\\\'red\\\'\')', 'x.ts')
	})

	it('transform handles template literals with expressions', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		// eslint-disable-next-line no-template-curly-in-string
		await ctx.transform('pika(`color:${"red"}`)', 'x.ts')
	})

	it('transform warns on unclosed comment', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.transform('pika(\'color:red\' /* unclosed', 'x.ts')
		expect(vi.mocked(log.warn))
			.toHaveBeenCalledWith(expect.stringContaining('Unclosed comment'))
	})

	it('transform warns on unclosed fn call via trailing comment', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.transform('pika(\'color:red\' // no newline', 'x.ts')
		expect(vi.mocked(log.warn))
			.toHaveBeenCalledWith(expect.stringContaining('Unclosed function call'))
	})

	it('transform warns on malformed fn call', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.transform('pika(\'color:red\'', 'x.ts')
		expect(vi.mocked(log.warn))
			.toHaveBeenCalledWith(expect.stringContaining('Malformed function call'))
	})

	it('transform returns undefined on engine.use error', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		mockEngine.use.mockRejectedValueOnce(new Error('fail'))
		const r = await ctx.transform('pika(\'color:red\')', 'x.ts')
		expect(r)
			.toBeUndefined()
	})

	it('transform triggers style and tsCodegen hooks', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		const s = vi.fn()
		const t = vi.fn()
		ctx.hooks.styleUpdated.on(s)
		ctx.hooks.tsCodegenUpdated.on(t)
		await ctx.transform('pika(\'color:red\')', 'x.ts')
		expect(s)
			.toHaveBeenCalled()
		expect(t)
			.toHaveBeenCalled()
	})

	it('transform stores usage records', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.transform('pika(\'color:red\')', 'x.ts')
		expect(ctx.usages.has('x.ts'))
			.toBe(true)
		expect(ctx.usages.get('x.ts')![0]!.atomicStyleIds)
			.toEqual(['c-red'])
	})

	it('transform handles multiple fn calls', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		mockEngine.use
			.mockResolvedValueOnce(['c-red'])
			.mockResolvedValueOnce(['bg-blue'])
		await ctx.transform('pika(\'a\'); pika(\'b\')', 'x.ts')
		expect(ctx.usages.get('x.ts')!.length)
			.toBe(2)
	})

	it('transform clears previous usages for same file', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.transform('pika(\'a\')', 'x.ts')
		await ctx.transform('pika(\'b\')', 'x.ts')
		expect(ctx.usages.get('x.ts')!.length)
			.toBe(1)
	})

	// ── getCssCodegenContent ──────────────────────────────────

	it('getCssCodegenContent generates CSS', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		const css = await ctx.getCssCodegenContent()
		expect(css)
			.toContain('Auto-generated by @pikacss/test')
		expect(css)
			.toContain('/* preflights */')
		expect(mockEngine.renderLayerOrderDeclaration)
			.toHaveBeenCalled()
	})

	it('getCssCodegenContent with usages', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.transform('pika(\'color:red\')', 'x.ts')
		await ctx.getCssCodegenContent()
		expect(mockEngine.renderAtomicStyles)
			.toHaveBeenCalledWith(true, { atomicStyleIds: ['c-red'] })
	})

	it('should include layer declaration when renderLayerOrderDeclaration returns non-empty string', async () => {
		mockEngine.renderLayerOrderDeclaration.mockReturnValueOnce('@layer base, atomic;')
		const ctx = createCtx(opts())
		await ctx.setup()
		const css = await ctx.getCssCodegenContent()
		expect(css)
			.toContain('@layer base, atomic;')
	})

	it('should place layer declaration before preflights in output', async () => {
		mockEngine.renderLayerOrderDeclaration.mockReturnValueOnce('@layer base, atomic;')
		const ctx = createCtx(opts())
		await ctx.setup()
		const css = await ctx.getCssCodegenContent()
		expect(css!.indexOf('@layer base, atomic;'))
			.toBeLessThan(css!.indexOf('/* preflights */'))
	})

	// ── getTsCodegenContent ───────────────────────────────────

	it('getTsCodegenContent generates content', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		const c = await ctx.getTsCodegenContent()
		expect(c)
			.toBe('/* ts codegen */')
	})

	it('getTsCodegenContent returns null when tsCodegen false', async () => {
		const ctx = createCtx(opts({ tsCodegen: false }))
		await ctx.setup()
		expect(await ctx.getTsCodegenContent())
			.toBeNull()
	})

	// ── writeCssCodegenFile ───────────────────────────────────

	it('writeCssCodegenFile writes file', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.writeCssCodegenFile()
		expect(vi.mocked(mkdir))
			.toHaveBeenCalled()
		expect(vi.mocked(writeFile))
			.toHaveBeenCalledWith('/test/project/pika.gen.css', expect.any(String))
	})

	// ── writeTsCodegenFile ───────────────────────────────────

	it('writeTsCodegenFile writes file', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.writeTsCodegenFile()
		expect(vi.mocked(writeFile))
			.toHaveBeenCalledWith('/test/project/pika.gen.ts', '/* ts codegen */')
	})

	it('writeTsCodegenFile skips when tsCodegen false', async () => {
		vi.mocked(writeFile)
			.mockClear()
		const ctx = createCtx(opts({ tsCodegen: false }))
		await ctx.setup()
		await ctx.writeTsCodegenFile()
		const tsCalls = vi.mocked(writeFile).mock.calls.filter(
			c => typeof c[0] === 'string' && c[0].endsWith('.gen.ts'),
		)
		expect(tsCalls.length)
			.toBe(0)
	})

	it('writeTsCodegenFile skips when content is null', async () => {
		vi.mocked(generateTsCodegenContent)
			.mockResolvedValueOnce(null as any)
		vi.mocked(writeFile)
			.mockClear()
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.writeTsCodegenFile()
		const tsCalls = vi.mocked(writeFile).mock.calls.filter(
			c => typeof c[0] === 'string' && c[0].endsWith('.gen.ts'),
		)
		expect(tsCalls.length)
			.toBe(0)
	})

	// ── fullyCssCodegen ───────────────────────────────────────

	it('fullyCssCodegen scans files and writes CSS', async () => {
		let yielded = false
		vi.mocked(globbyStream)
			.mockReturnValue({
				[Symbol.asyncIterator]: () => ({
					next: async () => {
						if (!yielded) {
							yielded = true
							return { done: false, value: 'src/app.ts' }
						}
						return { done: true, value: undefined }
					},
				}),
			} as any)
		vi.mocked(readFile)
			.mockResolvedValue('pika(\'color:red\')')
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.fullyCssCodegen()
		expect(vi.mocked(readFile))
			.toHaveBeenCalledWith('/test/project/src/app.ts', 'utf-8')
		expect(vi.mocked(writeFile))
			.toHaveBeenCalled()
	})

	// ── resolvedConfig getters ────────────────────────────────

	it('exposes resolvedConfigPath and resolvedConfigContent as null initially', () => {
		const ctx = createCtx(opts())
		expect(ctx.resolvedConfigPath)
			.toBeNull()
		expect(ctx.resolvedConfigContent)
			.toBeNull()
	})
})

// ── getCssCodegenContent @layer support ───────────────────────

describe('getCssCodegenContent with @layer support', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockEngine.renderLayerOrderDeclaration.mockReturnValue('@layer preflights, atomic;')
		mockEngine.renderPreflights.mockResolvedValue('@layer preflights {\n:root{--color:red}\n}')
		mockEngine.renderAtomicStyles.mockResolvedValue('@layer atomic {\n.a{color:red}\n}')
	})

	it('should call renderLayerOrderDeclaration on the engine', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		await ctx.getCssCodegenContent()
		expect(mockEngine.renderLayerOrderDeclaration)
			.toHaveBeenCalled()
	})

	it('should include @layer declaration line in the output when engine has layers configured', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		const css = await ctx.getCssCodegenContent()
		expect(css)
			.toContain('@layer preflights, atomic;')
	})

	it('should not include @layer declaration line when renderLayerOrderDeclaration returns empty string', async () => {
		mockEngine.renderLayerOrderDeclaration.mockReturnValueOnce('')
		const ctx = createCtx(opts())
		await ctx.setup()
		const css = await ctx.getCssCodegenContent()
		expect(css).not.toContain('@layer preflights, atomic;')
	})

	it('should place @layer declaration after the comment and before preflight content', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		const css = await ctx.getCssCodegenContent()
		const commentIndex = css!.indexOf('/* Auto-generated by @pikacss/test */')
		const layerDeclIndex = css!.indexOf('@layer preflights, atomic;')
		const preflightIndex = css!.indexOf(':root{--color:red}')
		expect(commentIndex)
			.toBeGreaterThanOrEqual(0)
		expect(layerDeclIndex)
			.toBeGreaterThan(commentIndex)
		expect(preflightIndex)
			.toBeGreaterThan(layerDeclIndex)
	})

	it('should wrap preflights in @layer preflights { ... } block', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		const css = await ctx.getCssCodegenContent()
		expect(css)
			.toContain('@layer preflights {')
		const layerBlockStart = css!.indexOf('@layer preflights {')
		const preflightContentIndex = css!.indexOf(':root{--color:red}')
		expect(preflightContentIndex)
			.toBeGreaterThan(layerBlockStart)
	})

	it('should wrap atomic styles in @layer atomic { ... } block', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		const css = await ctx.getCssCodegenContent()
		expect(css)
			.toContain('@layer atomic {')
		const layerBlockStart = css!.indexOf('@layer atomic {')
		const atomicContentIndex = css!.indexOf('.a{color:red}')
		expect(atomicContentIndex)
			.toBeGreaterThan(layerBlockStart)
	})

	it('should have correct overall order: comment, @layer declaration, @layer preflights block, @layer atomic block', async () => {
		const ctx = createCtx(opts())
		await ctx.setup()
		const css = await ctx.getCssCodegenContent()
		const commentIndex = css!.indexOf('/* Auto-generated by @pikacss/test */')
		const layerDeclIndex = css!.indexOf('@layer preflights, atomic;')
		const layerPreflightsBlockIndex = css!.indexOf('@layer preflights {')
		const layerAtomicBlockIndex = css!.indexOf('@layer atomic {')
		expect(commentIndex)
			.toBeGreaterThanOrEqual(0)
		expect(layerDeclIndex)
			.toBeGreaterThanOrEqual(0)
		expect(commentIndex)
			.toBeLessThan(layerDeclIndex)
		expect(layerDeclIndex)
			.toBeLessThan(layerPreflightsBlockIndex)
		expect(layerPreflightsBlockIndex)
			.toBeLessThan(layerAtomicBlockIndex)
	})
})
