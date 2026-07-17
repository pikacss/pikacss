// Standalone end-to-end check: run a REAL `vite build` with the actual PikaCSS
// Vite plugin (no mocks) over a `.ts` + `.tsx` fixture and assert that the
// macro calls are rewritten and the atomic CSS is emitted. This covers the AST
// compiler pipeline through a genuine bundler build — the gap the mock-based
// unit tests cannot reach.
//
// Run standalone (not under Vitest): a nested `vite build` inside the Vitest
// worker does not run the transform hook reliably. Invoked via `pnpm test:e2e`.
import { mkdir, mkdtemp, readdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import pikaVite from '@pikacss/unplugin-pikacss/vite'
import { build } from 'vite'

const created = []

async function buildFixture() {
	// realpath: on macOS os.tmpdir() (/var/folders/...) is a symlink to
	// /private/var/...; Vite canonicalizes the build root while the relative
	// transform filter would see the uncanonicalized path, so the transform hook
	// would be skipped. Real projects have a canonical root.
	const root = await realpath(await mkdtemp(join(tmpdir(), 'pikacss-e2e-')))
	created.push(root)
	await mkdir(join(root, 'src'), { recursive: true })
	await writeFile(join(root, 'src/widget.tsx'), 'export const cls = pika({ display: \'flex\' })\n')
	await writeFile(
		join(root, 'src/entry.ts'),
		'import \'pika.css\'\nimport { cls } from \'./widget\'\nexport const c = pika({ color: \'red\' })\nexport { cls }\n',
	)

	const outDir = join(root, 'dist')
	await build({
		root,
		logLevel: 'silent',
		plugins: [pikaVite({ config: {}, tsCodegen: false, autoCreateConfig: false })],
		build: {
			outDir,
			cssCodeSplit: false,
			lib: { entry: join(root, 'src/entry.ts'), formats: ['es'], fileName: 'entry' },
		},
	})

	const files = await readdir(outDir)
	const css = await readFile(join(outDir, files.find(f => f.endsWith('.css'))), 'utf8')
	const js = await readFile(join(outDir, files.find(f => f.endsWith('.mjs'))), 'utf8')
	return { css, js }
}

function assert(condition, message) {
	if (!condition) {
		throw new Error(`E2E assertion failed: ${message}`)
	}
}

async function run() {
	try {
		const first = await buildFixture()

		// Styles from both the .ts entry and the .tsx module reached the CSS.
		assert(/color:\s*red/.test(first.css), 'CSS should contain color: red from the .ts entry')
		assert(/display:\s*flex/.test(first.css), 'CSS should contain display: flex from the .tsx module')
		// The macro calls were rewritten to class strings, not left as calls.
		assert(!first.js.includes('pika('), 'transformed JS should not contain a pika( call')

		// Production builds are reproducible (full scan canonicalizes order).
		const second = await buildFixture()
		assert(first.css === second.css, 'CSS should be byte-identical across repeated builds')

		console.error('✅ vite build e2e passed')
	}
	catch (error) {
		console.error(`❌ ${error?.message ?? error}`)
		process.exitCode = 1
	}
	finally {
		await Promise.all(created.map(dir => rm(dir, { recursive: true, force: true })))
	}
}

run()
