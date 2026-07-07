import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { createEngine } from '@pikacss/core'
import { join } from 'pathe'
import { describe, expect, it } from 'vitest'

import { designTokens, parseDesignMarkdown, tokenPathToVariableName } from './index'

async function renderTokensCss(designTokensConfig: any, extra: Record<string, any> = {}) {
	const engine = await createEngine({
		plugins: [designTokens()],
		designTokens: designTokensConfig,
		...extra,
	})
	const css = await engine.renderPreflights(false)
	return { engine, css }
}

describe('tokenPathToVariableName', () => {
	it('kebab-cases segments and joins with dashes', () => {
		expect(tokenPathToVariableName(['color', 'primary']))
			.toBe('--color-primary')
		expect(tokenPathToVariableName(['fontSize', 'lg']))
			.toBe('--font-size-lg')
		expect(tokenPathToVariableName(['Space Scale', '2']))
			.toBe('--space-scale-2')
	})

	it('applies the prefix as the first segment', () => {
		expect(tokenPathToVariableName(['color', 'primary'], 'app'))
			.toBe('--app-color-primary')
	})
})

describe('parseDesignMarkdown', () => {
	it('extracts base and theme token blocks and ignores other content', () => {
		const md = [
			'# Design',
			'Some prose.',
			'```tokens',
			'{ "color": { "primary": { "$value": "#3b82f6" } } }',
			'```',
			'```ts',
			'const notTokens = true',
			'```',
			'```tokens theme=dark selector=".dark"',
			'{ "color": { "primary": { "$value": "#60a5fa" } } }',
			'```',
		].join('\n')

		const { base, themeBlocks } = parseDesignMarkdown(md)
		expect(base)
			.toHaveLength(1)
		expect(themeBlocks)
			.toEqual([
				expect.objectContaining({ theme: 'dark', selector: '.dark' }),
			])
	})

	it('skips blocks with invalid JSON', () => {
		const md = [
			'```tokens',
			'{ not json',
			'```',
		].join('\n')
		const { base, themeBlocks } = parseDesignMarkdown(md)
		expect(base)
			.toHaveLength(0)
		expect(themeBlocks)
			.toHaveLength(0)
	})
})

describe('designTokens plugin', () => {
	it('emits flattened tokens as :root variables', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: {
				color: {
					primary: { $value: '#3b82f6', $type: 'color' },
					accent: { $value: '{color.primary}' },
				},
				spacing: { sm: { $value: '0.5rem' } },
			},
		})

		expect(css)
			.toContain('--color-primary:#3b82f6')
		expect(css)
			.toContain('--color-accent:var(--color-primary)')
		expect(css)
			.toContain('--spacing-sm:0.5rem')
	})

	it('resolves inline aliases embedded in longer values', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: {
				color: { border: { $value: '#e5e7eb' } },
				border: { default: { $value: '1px solid {color.border}' } },
			},
		})
		expect(css)
			.toContain('--border-default:1px solid var(--color-border)')
	})

	it('applies the configured prefix to names and alias targets', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			prefix: 'app',
			sources: {
				color: {
					primary: { $value: '#111' },
					accent: { $value: '{color.primary}' },
				},
			},
		})
		expect(css)
			.toContain('--app-color-primary:#111')
		expect(css)
			.toContain('--app-color-accent:var(--app-color-primary)')
	})

	it('serializes composite and array token values', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: {
				shadow: {
					md: {
						$type: 'shadow',
						$value: { offsetX: '0', offsetY: '4px', blur: '6px', spread: '-1px', color: 'rgb(0 0 0 / 0.1)' },
					},
					layered: {
						$type: 'shadow',
						$value: [
							{ offsetX: '0', offsetY: '1px', blur: '2px', color: '#0002' },
							{ inset: true, offsetX: '0', offsetY: '0', blur: '1px', color: '#0001' },
						],
					},
				},
				font: { sans: { $type: 'fontFamily', $value: ['Inter', 'sans-serif'] } },
				border: { thin: { $type: 'border', $value: { width: '1px', style: 'solid', color: '#ccc' } } },
			},
		})

		expect(css)
			.toContain('--shadow-md:0 4px 6px -1px rgb(0 0 0 / 0.1)')
		expect(css)
			.toContain('--shadow-layered:0 1px 2px #0002, inset 0 0 1px #0001')
		expect(css)
			.toContain('--font-sans:Inter, sans-serif')
		expect(css)
			.toContain('--border-thin:1px solid #ccc')
	})

	it('expands unknown composite values into sub-variables', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: {
				typography: {
					heading: {
						$type: 'typography',
						$value: { fontFamily: 'Inter', fontSize: '2rem', fontWeight: 700 },
					},
				},
			},
		})
		expect(css)
			.toContain('--typography-heading-font-family:Inter')
		expect(css)
			.toContain('--typography-heading-font-size:2rem')
		expect(css)
			.toContain('--typography-heading-font-weight:700')
	})

	it('emits theme tokens under the theme selector', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: { color: { bg: { $value: '#fff' } } },
			themes: {
				dark: { sources: { color: { bg: { $value: '#000' } } } },
				ocean: {
					selector: '[data-theme="ocean"]',
					sources: { color: { bg: { $value: '#001e3c' } } },
				},
			},
		})

		expect(css)
			.toContain(':root{--color-bg:#fff')
		expect(css)
			.toContain('.dark{--color-bg:#000')
		expect(css)
			.toContain('[data-theme="ocean"]{--color-bg:#001e3c')
	})

	it('prunes unused tokens by default and emits used ones', async () => {
		const engine = await createEngine({
			plugins: [designTokens()],
			designTokens: {
				sources: {
					color: {
						used: { $value: '#123456' },
						unused: { $value: '#654321' },
					},
				},
			},
		})
		await engine.use({ color: 'var(--color-used)' })
		const css = await engine.renderPreflights(false)

		expect(css)
			.toContain('--color-used:#123456')
		expect(css).not.toContain('--color-unused')
	})

	it('keeps user-defined variables alongside token variables', async () => {
		const { css } = await renderTokensCss(
			{
				pruneUnused: false,
				sources: { color: { primary: { $value: '#3b82f6' } } },
			},
			{
				variables: {
					pruneUnused: false,
					definitions: { '--custom': 'red' },
				},
			},
		)
		expect(css)
			.toContain('--custom:red')
		expect(css)
			.toContain('--color-primary:#3b82f6')
	})

	it('loads tokens from json and markdown files and registers config dependencies', async () => {
		const dir = await mkdtemp(join(tmpdir(), 'pika-design-tokens-'))
		const jsonPath = join(dir, 'base.tokens.json')
		const mdPath = join(dir, 'design.md')
		await writeFile(jsonPath, JSON.stringify({ color: { primary: { $value: '#3b82f6' } } }))
		await writeFile(mdPath, [
			'# Design doc',
			'```tokens',
			'{ "spacing": { "sm": { "$value": "0.5rem" } } }',
			'```',
			'```tokens theme=dark',
			'{ "color": { "primary": { "$value": "#60a5fa" } } }',
			'```',
		].join('\n'))

		const engine = await createEngine({
			plugins: [designTokens()],
			designTokens: {
				pruneUnused: false,
				root: dir,
				sources: ['base.tokens.json', 'design.md'],
			},
		})
		const css = await engine.renderPreflights(false)

		expect(css)
			.toContain('--color-primary:#3b82f6')
		expect(css)
			.toContain('--spacing-sm:0.5rem')
		expect(css)
			.toContain('.dark{--color-primary:#60a5fa')
		expect(engine.configDependencies)
			.toEqual(new Set([jsonPath, mdPath]))
	})

	it('does nothing when designTokens config is absent', async () => {
		const engine = await createEngine({ plugins: [designTokens()] })
		expect(await engine.renderPreflights(false))
			.toBe('')
		expect(engine.configDependencies.size)
			.toBe(0)
	})

	it('does nothing when sources produce no tokens', async () => {
		const engine = await createEngine({
			plugins: [designTokens()],
			designTokens: { sources: {} },
		})
		expect(await engine.renderPreflights(false))
			.toBe('')
	})

	it('serializes transition composites and skips group metadata keys', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: {
				$description: 'group metadata is skipped',
				motion: {
					fast: { $type: 'transition', $value: { duration: '150ms', timingFunction: 'ease-out' } },
				},
			},
		})
		expect(css)
			.toContain('--motion-fast:150ms ease-out')
		expect(css).not.toContain('group metadata')
	})

	it('skips invalid token nodes and empty array values with a warning', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: {
				color: {
					// plain scalar without $value wrapper is invalid
					broken: '#fff' as any,
					empty: { $value: [] },
					ok: { $value: '#0f0' },
				},
			},
		})
		expect(css)
			.toContain('--color-ok:#0f0')
		expect(css).not.toContain('--color-broken')
		expect(css).not.toContain('--color-empty')
	})

	it('supports single-quoted fence attributes and fence selector precedence', () => {
		const md = [
			'```tokens theme=dark selector=\'[data-mode="dark"]\'',
			'{ "color": { "bg": { "$value": "#000" } } }',
			'```',
		].join('\n')
		const { themeBlocks } = parseDesignMarkdown(md)
		expect(themeBlocks[0])
			.toEqual(expect.objectContaining({
				theme: 'dark',
				selector: '[data-mode="dark"]',
			}))
	})

	it('prefers the fence selector over the configured theme selector', async () => {
		const dir = await mkdtemp(join(tmpdir(), 'pika-design-tokens-'))
		const mdPath = join(dir, 'design.md')
		await writeFile(mdPath, [
			'```tokens theme=dark selector=":root.dark"',
			'{ "color": { "bg": { "$value": "#000" } } }',
			'```',
		].join('\n'))

		const { css } = await renderTokensCss({
			pruneUnused: false,
			root: dir,
			sources: ['design.md'],
			themes: { dark: { selector: '.theme-dark' } },
		})
		expect(css)
			.toContain(':root.dark{--color-bg:#000')
		expect(css).not.toContain('.theme-dark')
	})

	it('skips json source files with invalid or non-object content', async () => {
		const dir = await mkdtemp(join(tmpdir(), 'pika-design-tokens-'))
		await writeFile(join(dir, 'broken.json'), '{ not json')
		await writeFile(join(dir, 'array.json'), '[1, 2]')

		const { css } = await renderTokensCss({
			pruneUnused: false,
			root: dir,
			sources: ['broken.json', 'array.json', { color: { ok: { $value: '#0f0' } } }],
		})
		expect(css)
			.toContain('--color-ok:#0f0')
	})

	it('skips markdown token blocks whose content is not an object', () => {
		const md = [
			'```tokens',
			'[1, 2, 3]',
			'```',
		].join('\n')
		const { base, themeBlocks } = parseDesignMarkdown(md)
		expect(base)
			.toHaveLength(0)
		expect(themeBlocks)
			.toHaveLength(0)
	})

	it('loads sources given as absolute paths and theme-only configs', async () => {
		const dir = await mkdtemp(join(tmpdir(), 'pika-design-tokens-'))
		const jsonPath = join(dir, 'dark.tokens.json')
		await writeFile(jsonPath, JSON.stringify({ color: { bg: { $value: '#000' } } }))

		const { css } = await renderTokensCss({
			pruneUnused: false,
			themes: { dark: { sources: [jsonPath] } },
		})
		expect(css)
			.toContain('.dark{--color-bg:#000')
	})

	it('merges multiple blocks of the same theme and skips empty theme blocks', async () => {
		const md = [
			'```tokens theme=dark',
			'{ "color": { "bg": { "$value": "#000" } } }',
			'```',
			'```tokens theme=dark',
			'{ "color": { "fg": { "$value": "#fff" } } }',
			'```',
			'```tokens theme=empty',
			'{}',
			'```',
		].join('\n')
		const dir = await mkdtemp(join(tmpdir(), 'pika-design-tokens-'))
		await writeFile(join(dir, 'design.md'), md)

		const { css } = await renderTokensCss({
			pruneUnused: false,
			root: dir,
			sources: ['design.md'],
		})
		expect(css)
			.toContain('.dark{--color-bg:#000;--color-fg:#fff')
		expect(css).not.toContain('.empty')
	})

	it('defaults missing shadow offsets to zero', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: {
				shadow: { halo: { $type: 'shadow', $value: { blur: '8px', color: '#00f5' } } },
			},
		})
		expect(css)
			.toContain('--shadow-halo:0 0 8px #00f5')
	})

	it('skips missing source files without failing engine creation', async () => {
		const engine = await createEngine({
			plugins: [designTokens()],
			designTokens: {
				pruneUnused: false,
				root: await mkdtemp(join(tmpdir(), 'pika-design-tokens-')),
				sources: ['missing.tokens.json', { color: { ok: { $value: '#0f0' } } }],
			},
		})
		const css = await engine.renderPreflights(false)
		expect(css)
			.toContain('--color-ok:#0f0')
		expect(engine.configDependencies.size)
			.toBe(0)
	})
})
