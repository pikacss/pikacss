import path from 'node:path'
import { fileURLToPath } from 'node:url'
import PikaCSS from '@pikacss/unplugin-pikacss/webpack'
import CopyPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
	entry: './src/main.tsx',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
		clean: true,
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.jsx'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
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
		new HtmlWebpackPlugin({
			template: './index.html',
		}),
		new CopyPlugin({
			patterns: [
				{ from: 'public', to: '.' },
			],
		}),
	],
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
		compress: true,
		port: 3000,
		hot: true,
	},
}
