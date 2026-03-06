import { readFile } from 'node:fs/promises'
import { createCtx } from '@pikacss/integration'

interface BuildPlugin {
	name: string
	buildStart: () => Promise<void>
	transform: (code: string, id: string) => Promise<{ code: string, map: unknown } | null | undefined>
	resolveId: (id: string) => Promise<string | null>
	load: (id: string) => Promise<string | null>
}

export function pikaCustomIntegration(cwd = process.cwd()): BuildPlugin {
	const ctx = createCtx({
		cwd,
		currentPackageName: 'my-build-tool-pikacss',
		scan: {
			include: ['src/**/*.{js,ts,jsx,tsx,vue}'],
			exclude: ['node_modules/**', 'dist/**'],
		},
		configOrPath: undefined,
		fnName: 'pika',
		transformedFormat: 'string',
		tsCodegen: 'pika.gen.ts',
		cssCodegen: 'pika.gen.css',
		autoCreateConfig: true,
	})
	let hooksBound = false

	return {
		name: 'my-build-tool-pikacss',

		async buildStart() {
			await ctx.setup()

			if (!hooksBound) {
				ctx.hooks.styleUpdated.on(() => {
					void ctx.writeCssCodegenFile()
				})

				ctx.hooks.tsCodegenUpdated.on(() => {
					void ctx.writeTsCodegenFile()
				})

				hooksBound = true
			}

			await ctx.fullyCssCodegen()
			await ctx.writeTsCodegenFile()
		},

		async transform(code, id) {
			return await ctx.transform(code, id)
		},

		async resolveId(id) {
			if (id === 'pika.css') {
				return ctx.cssCodegenFilepath
			}

			return null
		},

		async load(id) {
			if (id === ctx.cssCodegenFilepath) {
				return await readFile(id, 'utf8')
			}

			return null
		},
	}
}
