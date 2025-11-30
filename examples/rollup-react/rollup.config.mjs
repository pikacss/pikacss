import PikaCSS from '@pikacss/unplugin-pikacss/rollup'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import copy from 'rollup-plugin-copy'

export default {
	input: 'src/main.tsx',
	output: {
		dir: 'dist',
		format: 'esm',
	},
	plugins: [
		PikaCSS({
			tsCodegen: './src/pika.gen.ts',
			devCss: './src/pika.dev.css',
		}),
		replace({
			'preventAssignment': true,
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		resolve({
			browser: true,
			extensions: ['.js', '.jsx', '.ts', '.tsx'],
		}),
		commonjs(),
		typescript({
			tsconfig: './tsconfig.json',
		}),
		copy({
			targets: [
				{ src: 'public/*', dest: 'dist' },
				{ src: 'index.html', dest: 'dist' },
			],
		}),
	],
}
