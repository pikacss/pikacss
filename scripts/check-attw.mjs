// Runs @arethetypeswrong/cli against each publishable package's REAL published
// tarball. We pack with `pnpm pack` (not attw's internal `npm pack`) because
// pnpm applies `publishConfig` — nuxt swaps its dev `exports` (→ ./src) for the
// built dist entry only at publish time, and `npm pack` would leave the src
// exports in place and report a false resolution failure.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

const packagesDir = join(process.cwd(), 'packages')
const packages = readdirSync(packagesDir, { withFileTypes: true })
	.filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
	.map(entry => join(packagesDir, entry.name))

let failed = false
for (const dir of packages) {
	const out = mkdtempSync(join(tmpdir(), 'pikacss-attw-'))
	try {
		// pnpm pack applies publishConfig; prints the tarball path on stdout.
		const tarball = execFileSync('pnpm', ['pack', '--pack-destination', out], { cwd: dir, encoding: 'utf8' })
			.trim()
			.split('\n')
			.pop()
		execFileSync('pnpm', ['exec', 'attw', tarball, '--profile', 'esm-only'], { stdio: 'inherit' })
	}
	catch {
		failed = true
	}
	finally {
		rmSync(out, { recursive: true, force: true })
	}
}

if (failed) {
	console.error('\n❌ are-the-types-wrong found problems')
	process.exitCode = 1
}
else {
	console.error('\n✅ are-the-types-wrong: all packages OK (esm-only)')
}
