import { readFileSync } from 'node:fs'
import process from 'node:process'
import { resolve } from 'pathe'
import { workspaceRoot } from '../_skill-shared'

interface PackageManifest {
	engines?: Record<string, string>
	exports?: Record<string, unknown>
}

const failures: string[] = []

function readWorkspaceFile(path: string): string {
	return readFileSync(resolve(workspaceRoot, path), 'utf8')
}

function readManifest(path: string): PackageManifest {
	return JSON.parse(readWorkspaceFile(path)) as PackageManifest
}

function expectContains(path: string, expected: string, reason: string) {
	const content = readWorkspaceFile(path)
	if (!content.includes(expected))
		failures.push(`${path}: ${reason} (missing ${JSON.stringify(expected)})`)
}

const rootManifest = readManifest('package.json')
const unpluginManifest = readManifest('packages/unplugin/package.json')
const nodeRange = rootManifest.engines?.node

if (nodeRange == null) {
	failures.push('package.json: engines.node is required for documentation contract checks')
}
else {
	for (const path of [
		'docs/getting-started/setup.md',
		'docs/zh-tw/getting-started/setup.md',
		'packages/unplugin/README.md',
	]) {
		expectContains(path, `\`${nodeRange}\``, `document the supported Node.js range from package.json`)
	}
}

const unpluginExports = Object.keys(unpluginManifest.exports ?? {})
	.filter(subpath => subpath !== '.')

for (const subpath of unpluginExports) {
	const specifier = `@pikacss/unplugin-pikacss${subpath.slice(1)}`
	expectContains(
		'packages/unplugin/README.md',
		specifier,
		`list the exported bundler entry point ${specifier}`,
	)
}

for (const pattern of [
	'node_modules/**',
	'dist/**',
	'.git/**',
	'.nuxt/**',
	'.output/**',
	'coverage/**',
]) {
	expectContains(
		'packages/integration/README.md',
		pattern,
		`keep the direct createCtx scan example aligned with the bundler defaults`,
	)
}

expectContains(
	'packages/integration/README.md',
	'replace the bundler plugin defaults',
	'document that explicit scan patterns replace rather than extend bundler defaults',
)

if (failures.length > 0) {
	console.error('\nDocumentation contract checks failed:\n')
	for (const failure of failures)
		console.error(`  - ${failure}`)
	console.error('')
	process.exit(1)
}

console.log(`Documentation contracts OK (${unpluginExports.length} bundler entry points checked).`)
