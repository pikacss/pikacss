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

function extractStringArray(source: string, pattern: RegExp, label: string): string[] {
	const body = source.match(pattern)?.[1]
	if (body == null) {
		failures.push(`packages/unplugin/src/index.ts: could not locate ${label}`)
		return []
	}

	return [...body.matchAll(/'([^']+)'/g)]
		.flatMap(match => match[1] == null ? [] : [match[1]])
}

const coreManifest = readManifest('packages/core/package.json')
const unpluginManifest = readManifest('packages/unplugin/package.json')
const coreNodeRange = coreManifest.engines?.node
const unpluginNodeRange = unpluginManifest.engines?.node

if (coreNodeRange == null)
	failures.push('packages/core/package.json: engines.node is required for documentation contract checks')
if (unpluginNodeRange == null)
	failures.push('packages/unplugin/package.json: engines.node is required for documentation contract checks')
if (coreNodeRange != null && unpluginNodeRange != null && coreNodeRange !== unpluginNodeRange) {
	failures.push(
		`public package Node.js ranges differ: @pikacss/core=${coreNodeRange}, @pikacss/unplugin-pikacss=${unpluginNodeRange}`,
	)
}

if (unpluginNodeRange != null) {
	for (const path of [
		'docs/getting-started/setup.md',
		'docs/zh-tw/getting-started/setup.md',
		'packages/unplugin/README.md',
	]) {
		expectContains(path, `\`${unpluginNodeRange}\``, `document the supported Node.js range from the published package`)
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

const unpluginSource = readWorkspaceFile('packages/unplugin/src/index.ts')
const defaultScanPatterns = [
	...extractStringArray(
		unpluginSource,
		/const defaultInclude = \[([^\]]+)\]/,
		'default scan include patterns',
	),
	...extractStringArray(
		unpluginSource,
		/scan\?\.exclude \|\| \[([^\]]+)\]/,
		'default scan exclude patterns',
	),
]

for (const pattern of defaultScanPatterns) {
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

console.log(`Documentation contracts OK (${unpluginExports.length} bundler entry points and ${defaultScanPatterns.length} scan patterns checked).`)
