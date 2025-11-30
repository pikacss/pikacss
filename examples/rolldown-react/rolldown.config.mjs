import PikaCSS from '@pikacss/unplugin-pikacss/rolldown'
import { defineConfig } from 'rolldown'

export default defineConfig({
	input: 'src/main.tsx',
	output: {
		dir: 'dist',
		format: 'esm',
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js'],
	},
	plugins: [
		PikaCSS({
			tsCodegen: './src/pika.gen.ts',
			devCss: './src/pika.dev.css',
		}),
	],
	define: {
		'process.env.NODE_ENV': JSON.stringify('production'),
	},
})
