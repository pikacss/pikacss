import { copyFileSync, cpSync, mkdirSync } from 'node:fs'
import PikaCSS from '@pikacss/unplugin-pikacss/esbuild'
import esbuild from 'esbuild'

async function build() {
	// Ensure dist directory exists
	mkdirSync('dist', { recursive: true })

	// Copy public assets
	cpSync('public', 'dist', { recursive: true })

	// Copy index.html
	copyFileSync('index.html', 'dist/index.html')

	await esbuild.build({
		entryPoints: ['src/main.tsx'],
		bundle: true,
		outfile: 'dist/bundle.js',
		format: 'esm',
		platform: 'browser',
		jsx: 'automatic',
		plugins: [
			PikaCSS({
				tsCodegen: './src/pika.gen.ts',
				devCss: './src/pika.dev.css',
			}),
		],
		loader: {
			'.css': 'css',
		},
		define: {
			'process.env.NODE_ENV': '"production"',
		},
	})

	// eslint-disable-next-line no-console
	console.log('Build completed!')
}

build()
