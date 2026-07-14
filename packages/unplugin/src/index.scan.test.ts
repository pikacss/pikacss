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
	it('scans and transforms .vue sources with default options', async () => {
		const { plugin, cwd, ctx } = await createPlugin()

		const vueId = join(cwd, 'src/App.vue')

		expect(ctx.isTransformTarget(vueId))
			.toBe(true)

		const vue = await plugin.transform.handler.call(
			{},
			'<template>\n  <div :class="pika({ color: \'red\' })" />\n</template>\n',
			vueId,
		)

		expect(vue?.code.includes('pika('))
			.toBe(false)
		expect(ctx.usages.get(vueId))
			.toHaveLength(1)
	})

	it('does not scan unsupported markup extensions', async () => {
		const { plugin, cwd, ctx } = await createPlugin()

		const transformSpy = vi.spyOn(ctx, 'transform')
		for (const file of ['src/App.svelte', 'src/Page.astro', 'src/index.html']) {
			const id = join(cwd, file)
			expect(ctx.isTransformTarget(id))
				.toBe(false)
			expect(await plugin.transform.handler.call({}, '<div class="pika({ color: \'red\' })"></div>', id))
				.toBeNull()
		}
		expect(transformSpy)
			.not.toHaveBeenCalled()
	})

	it('lets an explicit scan.include win over the derived default', async () => {
		const { plugin, cwd, ctx } = await createPlugin({
			scan: { include: ['src/**/*.ts'] },
		})

		const transformSpy = vi.spyOn(ctx, 'transform')
		const vueId = join(cwd, 'src/App.vue')

		expect(ctx.isTransformTarget(vueId))
			.toBe(false)
		expect(await plugin.transform.handler.call({}, '<template><div /></template>', vueId))
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
