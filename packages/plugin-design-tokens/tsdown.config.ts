import { defineConfig } from 'tsdown'

export default defineConfig({
	publint: true,
	entry: ['src/index.ts', 'src/node.ts'],
	format: ['esm'],
	dts: {
		tsconfig: './tsconfig.node.json',
	},
	clean: true,
})
