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

intro('Create a new package')

const root = resolveWorkspaceRoot(import.meta.url)

let pkgDirname = process.argv[2]
if (pkgDirname) {
	const error = validatePackageSegment(pkgDirname)
	if (error) {
		console.error(`Invalid package directory name: ${error}`)
		process.exit(1)
	}
}
else {
	pkgDirname = await promptSegment({
		message: 'Package directory name (/packages/<pkgDirname>)',
	})
}

let pkgName = process.argv[3]
if (pkgName) {
	const error = validatePackageSegment(pkgName)
	if (error) {
		console.error(`Invalid package name: ${error}`)
		process.exit(1)
	}
}
else if (process.argv[2]) {
	pkgName = pkgDirname
}
else {
	pkgName = await promptSegment({
		message: 'Package name (@pikacss/<pkgName>)',
		initialValue: pkgDirname,
	})
}

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
	"keywords": [],
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
		"typecheck:test": "tsc --project ./tsconfig.tests.json --noEmit"
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
export {}
	`.trim(),
	'tests/some.test.ts': `
import { describe, expect, it } from 'vitest'

describe('test hello', () => {
	it('is ok', () => {
		expect(true).toBe(true)
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

outro(`Package "${pkgName}" created.`)
