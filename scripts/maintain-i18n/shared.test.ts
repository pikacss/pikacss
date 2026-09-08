import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'pathe'
import { describe, expect, it } from 'vitest'
import { checkAllFixtures, checkFixtureCompleteness, checkFixtureContents, hasStrictTranslationStatusFailure, parseTranslationBlock, resetTasksOutputRoot, translationStructureSignature, writeTranslationBlock } from './shared'

describe('docs example fixture completeness', () => {
	it('reports an English fixture that has no zh-TW mirror', () => {
		expect(
			checkFixtureCompleteness(['.examples/missing.ts'], []),
		)
			.toEqual([{
				zhFile: 'docs/zh-tw/.examples/missing.ts',
				sourceFile: 'docs/.examples/missing.ts',
				reason: 'zh-TW fixture counterpart does not exist (missing mirror)',
			}])
	})

	it('reports a zh-TW fixture that has no English counterpart', () => {
		expect(
			checkFixtureCompleteness([], ['zh-tw/.examples/orphan.ts']),
		)
			.toEqual([{
				zhFile: 'docs/zh-tw/.examples/orphan.ts',
				sourceFile: 'docs/.examples/orphan.ts',
				reason: 'English fixture counterpart does not exist (orphaned copy)',
			}])
	})

	it('accepts a TypeScript fixture whose only difference is translated comments', () => {
		const source = `const value = 'https://example.test//literal'\n// English comment\nexport default value\n`
		const zh = `const value = 'https://example.test//literal'\n// 繁體中文註解\nexport default value\n`

		expect(
			checkFixtureContents(
				'zh-tw/.examples/example.ts',
				'.examples/example.ts',
				zh,
				source,
			),
		)
			.toBeNull()
	})

	it('accepts the repository fixture set', async () => {
		expect(await checkAllFixtures())
			.toEqual([])
	})
})

describe('translation provenance', () => {
	it('supports a source blob without a source commit for same-change synchronization', () => {
		const content = '---\ntitle: 測試\n---\n\n內容\n'
		const updated = writeTranslationBlock(content, {
			sourceFile: 'docs/example.md',
			sourceBlob: '0123456789abcdef',
		})

		expect(updated)
			.not
			.toContain('sourceCommit:')
		expect(parseTranslationBlock(updated))
			.toEqual({
				sourceFile: 'docs/example.md',
				sourceBlob: '0123456789abcdef',
			})
	})
})

describe('strict translation status', () => {
	it('fails for every non-fresh page state and for fixture violations', () => {
		expect(hasStrictTranslationStatusFailure(['fresh', 'fresh'], 0))
			.toBe(false)

		for (const state of ['missing', 'stale', 'untracked', 'orphaned'] as const) {
			expect(hasStrictTranslationStatusFailure(['fresh', state], 0), state)
				.toBe(true)
		}

		expect(hasStrictTranslationStatusFailure(['fresh'], 1))
			.toBe(true)
	})
})

describe('translation status task output', () => {
	it('removes obsolete task files before a status run writes the current set', async () => {
		const root = await mkdtemp(resolve(tmpdir(), 'pikacss-i18n-tasks-'))
		try {
			await writeFile(resolve(root, 'stale.json'), '{}\n', 'utf8')
			await resetTasksOutputRoot(root)
			expect(await readdir(root))
				.toEqual([])
		}
		finally {
			await rm(root, { recursive: true, force: true })
		}
	})
})

describe('translation markdown structure', () => {
	it('normalizes localized fixture paths while preserving structural tokens', () => {
		const english = `# Example

::: code-group

\`\`\`ts [Input]
const value = 1
\`\`\`

:::

<<< @/.examples/demo.ts [Input]

| A | B |
|---|---|

- one
  - nested
`
		const zh = `# 範例 {#example}

::: code-group

\`\`\`ts [Input]
const value = 1
\`\`\`

:::

<<< @/zh-tw/.examples/demo.ts [輸入]

| 甲 | 乙 |
|---|---|

- 一
  - 二
`

		expect(translationStructureSignature(zh))
			.toEqual(translationStructureSignature(english))
	})

	it('detects a missing fenced block even when headings still match', () => {
		const english = `## Section

\`\`\`ts
const value = 1
\`\`\`
`
		const zh = `## 章節 {#section}
`

		expect(translationStructureSignature(zh))
			.not
			.toEqual(translationStructureSignature(english))
	})
})
