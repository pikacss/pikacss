import { writeFile } from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { cancel, isCancel, text } from '@clack/prompts'
import { join } from 'pathe'
import { $ } from 'zx'

const segmentPattern = /^[a-z0-9-]+$/

export function validatePackageSegment(value: string) {
	if (!value)
		return 'Required.'
	if (segmentPattern.test(value) === false)
		return 'Only lowercase letters, numbers, and hyphens are allowed.'
	return void 0
}

export function resolveWorkspaceRoot(importMetaUrl: string) {
	return fileURLToPath(new URL('..', importMetaUrl))
}

export async function promptSegment(options: { message: string, initialValue?: string }) {
	const result = await text({
		...options,
		validate: validatePackageSegment,
	})

	ensureNotCancelled(result)
	return result
}

function ensureNotCancelled(input: unknown): asserts input is string {
	if (isCancel(input)) {
		cancel('Operation cancelled.')
		process.exit(0)
	}
}

export async function preparePackageDir(root: string, pkgDirname: string) {
	const packageDir = join(root, 'packages', pkgDirname)

	await $`(rm -rf ${packageDir} || true) \
		&& mkdir -p ${packageDir} \
		&& mkdir -p ${join(packageDir, 'src')} \
		&& mkdir -p ${join(packageDir, 'tests')} \
	`

	return packageDir
}

export async function readRootPackageJson(root: string) {
	return JSON.parse((await $`cat ${join(root, 'package.json')}`).stdout)
}

export async function writeTemplates(packageDir: string, templates: Record<string, string>) {
	for (const [filename, content] of Object.entries(templates))
		await writeFile(join(packageDir, filename), `${content}\n`)
}

export async function ensureRootTsconfigExtends(root: string, pkgDirname: string) {
	const rootTsconfigPath = join(root, 'tsconfig.json')
	const rootTsConfig = JSON.parse((await $`cat ${rootTsconfigPath}`).stdout)
	rootTsConfig.extends ||= []

	const pkgTsConfigPath = `./packages/${pkgDirname}/tsconfig.json`
	if (rootTsConfig.extends.includes(pkgTsConfigPath) === false) {
		rootTsConfig.extends.push(pkgTsConfigPath)
		await writeFile(rootTsconfigPath, `${JSON.stringify(rootTsConfig, null, '\t')}\n`)
	}
}
