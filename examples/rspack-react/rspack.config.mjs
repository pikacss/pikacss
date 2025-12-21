import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PikaCSS from '@pikacss/unplugin-pikacss/rspack'
import { CopyRspackPlugin, HtmlRspackPlugin } from '@rspack/core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
	entry: './src/main.tsx',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
		clean: true,
	},
	experiments: {
		css: true,
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.jsx'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: {
					loader: 'builtin:swc-loader',
					options: {
						jsc: {
							parser: {
								syntax: 'typescript',
								tsx: true,
							},
							transform: {
								react: {
									runtime: 'automatic',
								},
							},
						},
					},
				},
				type: 'javascript/auto',
			},
			{
				test: /\.css$/,
				type: 'css',
			},
		],
	},
	plugins: [
		PikaCSS({
			tsCodegen: './src/pika.gen.ts',
			cssCodegen: './src/pika.gen.css',
			scan: {
				include: ['src/**/*.{ts,tsx,js,jsx}'],
				exclude: ['node_modules', 'dist'],
			},
		}),
		new HtmlRspackPlugin({
			template: './index.html',
		}),
		new CopyRspackPlugin({
			patterns: [
				{ from: 'public', to: '.' },
			],
		}),
	],
	devServer: {
		port: 3000,
		hot: true,
	},
}
