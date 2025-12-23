import process from 'node:process'
import { intro, outro } from '@clack/prompts'
import {
	ensureRootTsconfigExtends,
	preparePackageDir,
	promptSegment,
	readRootPackageJson,
	resolveWorkspaceRoot,
	validatePackageSegment,
	writeTemplates,
} from './utils/newPackage'

intro('Create a new plugin package')

const root = resolveWorkspaceRoot(import.meta.url)

let pluginNameInput = process.argv[2]
if (pluginNameInput) {
	const error = validatePackageSegment(pluginNameInput)
	if (error) {
		console.error(`Invalid plugin name: ${error}`)
		process.exit(1)
	}
}
else {
	pluginNameInput = await promptSegment({
		message: 'Plugin name (without prefix, e.g. "icons")',
	})
}

const pluginSlug = pluginNameInput.replace(/^plugin-/, '')
const pkgDirname = `plugin-${pluginSlug}`
const pkgName = pkgDirname

const pluginPascalName = toPascalCase(pluginSlug) || 'Plugin'
const pluginFactoryName = `create${pluginPascalName}Plugin`

const pkgJson = await readRootPackageJson(root)
const packageDir = await preparePackageDir(root, pkgDirname)

const templates = {
	'package.json': `
{
	"name": "@pikacss/${pkgName}",
	"type": "module",
	"publishConfig": {
		"access": "public"
	},
	"version": "${pkgJson.version}",
	"author": "DevilTea <ch19980814@gmail.com>",
	"license": "MIT",
	"repository": {
		"type": "git",
		"url": "https://github.com/pikacss/pikacss.git",
		"directory": "packages/${pkgDirname}"
	},
	"bugs": {
		"url": "https://github.com/pikacss/pikacss/issues"
	},
	"keywords": [
		"pikacss",
		"pikacss-plugin",
		"${pluginSlug}"
	],
	"exports": {
		".": {
			"import": {
				"types": "./dist/index.d.mts",
				"default": "./dist/index.mjs"
			},
			"require": {
				"types": "./dist/index.d.cts",
				"default": "./dist/index.cjs"
			}
		}
	},
	"main": "dist/index.cjs",
	"module": "dist/index.mjs",
	"types": "dist/index.d.mts",
	"files": [
		"dist"
	],
	"scripts": {
		"build": "tsdown",
		"build:pack": "pnpm build && pnpm pack",
		"typecheck": "pnpm typecheck:package && pnpm typecheck:test",
		"typecheck:package": "tsc --project ./tsconfig.package.json --noEmit",
		"typecheck:test": "tsc --project ./tsconfig.tests.json --noEmit",
		"test": "vitest run",
		"test:watch": "vitest"
	},
	"dependencies": {
		"@pikacss/core": "workspace:*"
	}
}
	`.trim(),
	'tsdown.config.ts': `
import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: {
		tsconfig: './tsconfig.package.json',
	},
	clean: true,
})
	`.trim(),
	'src/index.ts': `
import type { EnginePlugin } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

export interface ${pluginPascalName}PluginOptions {
}

export function ${pluginFactoryName}(options: ${pluginPascalName}PluginOptions = {}): EnginePlugin {
	return defineEnginePlugin({
		name: '${pluginSlug}',
		configureEngine: async () => {
			void options
		},
	})
}
	`.trim(),
	[`tests/${pluginSlug}.test.ts`]: `
import { describe, expect, it } from 'vitest'

import { ${pluginFactoryName} } from '../src'

describe('${pkgName}', () => {
	it('returns plugin definition', () => {
		const plugin = ${pluginFactoryName}()
		expect(plugin.name).toBe('${pluginSlug}')
	})
})
	`.trim(),
	'tsconfig.json': `
{
	"references": [
		{ "path": "./tsconfig.package.json" },
		{ "path": "./tsconfig.tests.json" }
	],
	"files": []
}
	`.trim(),
	'tsconfig.package.json': `
{
	"extends": "@deviltea/tsconfig/base",
	"compilerOptions": {
		"composite": true
	},
	"include": [
		"./src/**/*.ts"
	]
}
	`.trim(),
	'tsconfig.tests.json': `
{
	"extends": "@deviltea/tsconfig/node",
	"compilerOptions": {
		"composite": true
	},
	"include": [
		"./src/**/*.ts",
		"./tests/**/*.ts"
	]
}
	`.trim(),
}

await writeTemplates(packageDir, templates)

await ensureRootTsconfigExtends(root, pkgDirname)

outro(`Plugin package "@pikacss/${pkgName}" created.`)

function toPascalCase(value: string) {
	return value.split('-')
		.filter(Boolean)
		.map(part => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
		.join('')
}
