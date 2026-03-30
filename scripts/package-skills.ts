import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'pathe'
import { $ } from 'zx'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS_DIR = join(ROOT, '.github/skills')
const OUTPUT_DIR = join(ROOT, 'docs/public/skills')

async function main() {
	mkdirSync(OUTPUT_DIR, { recursive: true })

	const entries = readdirSync(SKILLS_DIR, { withFileTypes: true })
	const skillDirs = entries.filter(e => e.isDirectory())
		.filter(e => existsSync(join(SKILLS_DIR, e.name, 'SKILL.md')))
		.map(e => e.name)

	for (const skillName of skillDirs) {
		const zipPath = join(OUTPUT_DIR, `${skillName}.zip`)

		console.log(`📦 Packaging ${skillName}...`)

		await $`cd ${SKILLS_DIR} && zip -r ${zipPath} ${skillName}/ -x "${skillName}/scripts/node_modules/*" "${skillName}/.maintain-docs/*" "${skillName}/**/.gitignore"`

		console.log(`   → docs/public/skills/${skillName}.zip`)
	}

	console.log(`\n✅ ${skillDirs.length} skills packaged`)
}

main()
