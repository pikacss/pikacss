import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: [
		'src/index.ts',
		'src/vite.ts',
		'src/rollup.ts',
		'src/webpack.ts',
		'src/esbuild.ts',
		'src/rspack.ts',
		'src/rolldown.ts',
	],
	format: ['esm'],
	dts: {
		tsconfig: './tsconfig.package.json',
	},
	clean: true,
})
