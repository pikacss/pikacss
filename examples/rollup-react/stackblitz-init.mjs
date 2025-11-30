/**
 * StackBlitz initialization script
 * This script replaces `catalog:` and `workspace:*` references with actual versions
 * so the example can run standalone in StackBlitz.
 */

import fs from 'node:fs'

// Version mappings from catalog (pnpm-workspace.yaml)
const catalogVersions = {
	'@iconify-json/line-md': '^1.2.11',
	'@rollup/plugin-commonjs': '^28.0.3',
	'@rollup/plugin-node-resolve': '^16.0.1',
	'@rollup/plugin-replace': '^6.0.2',
	'@rollup/plugin-typescript': '^12.1.2',
	'@types/react': '^19.2.7',
	'@types/react-dom': '^19.2.3',
	'modern-normalize': '^3.0.1',
	'react': '^19.2.0',
	'react-dom': '^19.2.0',
	'rollup': '^4.53.3',
	'rollup-plugin-copy': '^3.5.0',
	'typescript': '^5.9.3',
}

// Workspace packages use 'latest' in StackBlitz
const workspacePackages = {
	'@pikacss/plugin-icons': 'latest',
	'@pikacss/unplugin-pikacss': 'latest',
}

const packageJsonPath = './package.json'
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

function replaceVersions(deps) {
	if (!deps)
		return deps
	const result = {}
	for (const [pkg, version] of Object.entries(deps)) {
		if (version === 'catalog:') {
			result[pkg] = catalogVersions[pkg] || 'latest'
		}
		else if (version === 'workspace:*') {
			result[pkg] = workspacePackages[pkg] || 'latest'
		}
		else {
			result[pkg] = version
		}
	}
	return result
}

packageJson.dependencies = replaceVersions(packageJson.dependencies)
packageJson.devDependencies = replaceVersions(packageJson.devDependencies)

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t'))

console.warn('✅ StackBlitz init: Replaced catalog: and workspace:* with actual versions')
