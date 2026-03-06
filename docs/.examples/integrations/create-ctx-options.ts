import { createCtx } from '@pikacss/integration'

const ctx = createCtx({
	cwd: process.cwd(),
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

await ctx.setup()