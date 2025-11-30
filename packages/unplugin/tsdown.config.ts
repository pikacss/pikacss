import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: [
		'src/index.ts',
		'src/vite.ts',
		'src/rollup.ts',
		'src/webpack.ts',
		'src/esbuild.ts',
		'src/rspack.ts',
		'src/farm.ts',
		'src/rolldown.ts',
	],
	format: ['esm', 'cjs'],
	dts: {
		tsconfig: './tsconfig.package.json',
	},
	clean: true,
	external: ['vite'],
})
