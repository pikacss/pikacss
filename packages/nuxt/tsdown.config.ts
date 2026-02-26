import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	dts: {
		tsconfig: './tsconfig.package.json',
	},
	clean: true,
	external: ['@nuxt/schema'],
})
