import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { defineEngineConfig } from '@pikacss/core'
import { join } from 'pathe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockCreateUnplugin = vi.fn(factory => ({ factory }))
let capturedCtx: any = null

vi.mock('@pikacss/integration', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@pikacss/integration')>()
	return {
		...actual,
		createCtx: (...args: Parameters<typeof actual.createCtx>) => {
			capturedCtx = actual.createCtx(...args)
			return capturedCtx
		},
	}
})

vi.mock('perfect-debounce', () => ({
	debounce: (fn: (...args: any[]) => any) => fn,
}))

vi.mock('unplugin', async (importOriginal) => {
	const actual = await importOriginal<typeof import('unplugin')>()
	return {
		...actual,
		createUnplugin: mockCreateUnplugin,
	}
})

const createdDirs: string[] = []

async function createTempDir() {
	const dir = await mkdtemp(join(tmpdir(), 'pikacss-unplugin-scan-'))
	createdDirs.push(dir)
	return dir
}

async function createPlugin(options: Record<string, any> = {}) {
	const cwd = await createTempDir()
	await mkdir(join(cwd, 'src'), { recursive: true })

	const { unpluginFactory } = await import('./index')
	const plugin = unpluginFactory({
		cwd,
		config: defineEngineConfig({}),
		tsCodegen: false,
		autoCreateConfig: false,
		...options,
	}, { framework: 'vite' } as any) as any

	plugin.vite.configResolved?.({ root: cwd, command: 'serve' } as any)
	await plugin.buildStart.call({ addWatchFile: vi.fn() } as any)

	return { plugin, cwd, ctx: capturedCtx }
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.resetModules()
	capturedCtx = null
})

afterEach(async () => {
	vi.restoreAllMocks()
	vi.resetModules()
	capturedCtx = null

	while (createdDirs.length > 0) {
		await rm(createdDirs.pop()!, { recursive: true, force: true })
	}
})

describe('unpluginFactory scan defaults', () => {
	it('scans and transforms .svelte and .astro sources with default options', async () => {
		const { plugin, cwd, ctx } = await createPlugin()

		const svelteId = join(cwd, 'src/App.svelte')
		const astroId = join(cwd, 'src/Page.astro')

		expect(ctx.isTransformTarget(svelteId))
			.toBe(true)
		expect(ctx.isTransformTarget(astroId))
			.toBe(true)

		const svelte = await plugin.transform.handler.call(
			{},
			'<div class="pika({ color: \'red\' })"></div>',
			svelteId,
		)
		const astro = await plugin.transform.handler.call(
			{},
			'<div class="pika({ color: \'blue\' })"></div>',
			astroId,
		)

		expect(svelte?.code.includes('pika('))
			.toBe(false)
		expect(astro?.code.includes('pika('))
			.toBe(false)
		expect(ctx.usages.get(svelteId))
			.toHaveLength(1)
		expect(ctx.usages.get(astroId))
			.toHaveLength(1)
	})

	it('extends the default include with user markupExtensions', async () => {
		const { plugin, cwd, ctx } = await createPlugin({ markupExtensions: ['riot'] })

		const riotId = join(cwd, 'src/App.riot')
		expect(ctx.isTransformTarget(riotId))
			.toBe(true)

		const riot = await plugin.transform.handler.call(
			{},
			'<div class="pika({ color: \'gold\' })"></div>',
			riotId,
		)
		expect(riot?.code.includes('pika('))
			.toBe(false)
		expect(ctx.usages.get(riotId))
			.toHaveLength(1)
	})

	it('lets an explicit scan.include win over the derived default', async () => {
		const { plugin, cwd, ctx } = await createPlugin({
			scan: { include: ['src/**/*.ts'] },
		})

		const transformSpy = vi.spyOn(ctx, 'transform')
		const svelteId = join(cwd, 'src/App.svelte')

		expect(ctx.isTransformTarget(svelteId))
			.toBe(false)
		expect(await plugin.transform.handler.call({}, '<div></div>', svelteId))
			.toBeNull()
		expect(transformSpy)
			.not.toHaveBeenCalled()
	})

	it('never transforms the css codegen output even when it bypasses the baked filter', async () => {
		const { plugin, ctx } = await createPlugin()

		const transformSpy = vi.spyOn(ctx, 'transform')

		expect(ctx.isTransformTarget(ctx.cssCodegenFilepath))
			.toBe(false)
		expect(await plugin.transform.handler.call({}, '/* generated */', ctx.cssCodegenFilepath))
			.toBeNull()
		expect(transformSpy)
			.not.toHaveBeenCalled()
	})
})
