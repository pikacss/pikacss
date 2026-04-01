import { readdir, rm } from 'node:fs/promises'
import process from 'node:process'
import { resolve } from 'pathe'
import { $ } from 'zx'

const rootDir = process.cwd()
const RE_TOTAL_TOKENS = /Total Tokens:\s*([\d,]+)\s*tokens/
const RE_COMMAS = /,/g
const RE_TOP_10_FILES = /📈 Top 10 Files by Token Count:[\s\S]*?(?=📊 Pack Summary:)/

async function getPackages() {
	const packagesDir = resolve(rootDir, 'packages')
	const dirs = await readdir(packagesDir, { withFileTypes: true })
	return dirs
		.filter(d => d.isDirectory())
		.map(d => d.name)
}

function extractTokens(stdout: string) {
	const match = stdout.match(RE_TOTAL_TOKENS)
	return match ? Number.parseInt(match[1]!.replace(RE_COMMAS, ''), 10) : 0
}

async function main() {
	const packages = await getPackages()

	// Clear old txt file if exists
	await rm(resolve(rootDir, 'repomix/repomix.txt'), { force: true })
		.catch(() => {})

	let totalTokens = 0
	const results: { name: string, tokens: number }[] = []

	console.log('Packing docs...')
	const docsInclude = 'docs/**/*.md,docs/.examples/**/*'
	const docsIgnore = '**/node_modules/**,docs/.vitepress/**,docs/**/*.svg,docs/public/**,docs/zh-TW/**,docs/.examples/zh-TW/**,**/dist/**,**/coverage/**'

	const resDocs = await $`repomix . --output repomix/repomix-docs.txt --style plain --compress --remove-empty-lines --top-files-len 10 --include ${docsInclude} --ignore ${docsIgnore} --no-security-check`.quiet()

	const docsTokens = extractTokens(resDocs.stdout)
	totalTokens += docsTokens
	results.push({ name: 'docs', tokens: docsTokens })

	for (const pkg of packages.filter(n => !n.startsWith('_'))) {
		console.log(`Packing package: ${pkg}...`)
		const pkgInclude = `packages/${pkg}/src/**/*,packages/${pkg}/tests/**/*`
		const pkgIgnore = '**/node_modules/**,**/dist/**,**/coverage/**,packages/core/src/csstype.ts'

		const resPkg = await $`repomix . --output repomix/repomix-${pkg}.txt --style plain --compress --remove-empty-lines --top-files-len 10 --include ${pkgInclude} --ignore ${pkgIgnore} --no-security-check`.quiet()

		const pkgTokens = extractTokens(resPkg.stdout)
		totalTokens += pkgTokens
		results.push({ name: pkg, tokens: pkgTokens })
	}

	console.log('\n=============================================')
	console.log('📦 Repopack Results')
	console.log('=============================================')
	for (const { name, tokens } of results) {
		console.log(`- ${name.padEnd(20)} : ${tokens.toLocaleString()
			.padStart(8)} tokens`)
	}
	console.log('---------------------------------------------')
	console.log(`  ${'Total'.padEnd(20)} : ${totalTokens.toLocaleString()
		.padStart(8)} tokens`)
	console.log('=============================================\n')

	console.log('Calculating overall Top 10 files (simulated entire monorepo)...')

	const allPkgIncludes = packages.map(pkg => `packages/${pkg}/src/**/*,packages/${pkg}/tests/**/*`)
		.join(',')
	const allInclude = `${docsInclude},${allPkgIncludes}`
	const allPkgIgnores = '**/node_modules/**,**/dist/**,**/coverage/**,packages/core/src/csstype.ts'
	const commonIgnore = '**/node_modules/**,docs/.vitepress/**,docs/**/*.svg,docs/public/**,**/dist/**,**/coverage/**'
	const allIgnore = `${commonIgnore},${allPkgIgnores}`

	const resAll = await $`repomix . --output repomix/repomix-all-temp.txt --style plain --compress --remove-empty-lines --top-files-len 10 --include ${allInclude} --ignore ${allIgnore} --no-security-check`.quiet()

	await rm(resolve(rootDir, 'repomix/repomix-all-temp.txt'), { force: true })
		.catch(() => {})

	const top10match = resAll.stdout.match(RE_TOP_10_FILES)
	if (top10match) {
		console.log(top10match[0].trim())
	}

	console.log('\n✅ Repopack finished successfully!')
}

main()
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
