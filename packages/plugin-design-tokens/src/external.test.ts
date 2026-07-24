import type { LoadedSources } from './ir'
import { fileURLToPath } from 'node:url'
import { createEngine, log } from '@pikacss/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { hasExternalMarker, readExternalMarker } from './external'
import { designTokens } from './node'
import { normalizeTokens } from './normalize'

const KEY = 'com.pikacss.design-tokens'

function marker(value: unknown) {
	return { $extensions: { [KEY]: value } }
}

async function renderTokensCss(designTokensConfig: any) {
	const engine = await createEngine({
		plugins: [designTokens()],
		designTokens: designTokensConfig,
	})
	const css = await engine.renderPreflights(false)
	return { engine, css }
}

describe('readExternalMarker', () => {
	it('reports none for non-objects and objects without the marker', () => {
		expect(readExternalMarker(5).kind)
			.toBe('none')
		expect(readExternalMarker({ $value: '#111' }).kind)
			.toBe('none')
		// $extensions present but not the pikacss namespace key.
		expect(readExternalMarker({ $value: '#111', $extensions: { 'com.other': 1 } }).kind)
			.toBe('none')
		// $extensions not an object.
		expect(readExternalMarker({ $extensions: 'nope' }).kind)
			.toBe('none')
	})

	it('reports none when the marker has no external key (carried as ordinary metadata)', () => {
		expect(readExternalMarker(marker({ var: '--x' })).kind)
			.toBe('none')
	})

	it('reports invalid when external is present but not boolean true', () => {
		expect(readExternalMarker(marker({ external: 'true', var: '--x' })).kind)
			.toBe('invalid')
		expect(readExternalMarker(marker({ external: false, var: '--x' })).kind)
			.toBe('invalid')
	})

	it('reports invalid when var is missing or malformed', () => {
		expect(readExternalMarker(marker({ external: true })).kind)
			.toBe('invalid')
		expect(readExternalMarker(marker({ external: true, var: 123 })).kind)
			.toBe('invalid')
		expect(readExternalMarker(marker({ external: true, var: 'guideline-x' })).kind)
			.toBe('invalid')
	})

	it('reports a valid external alias with its css var', () => {
		expect(readExternalMarker(marker({ external: true, var: '--guideline-x' })))
			.toEqual({ kind: 'external', cssVar: '--guideline-x' })
	})
})

describe('hasExternalMarker', () => {
	it('is true only for a node whose marker sets external to true', () => {
		expect(hasExternalMarker(marker({ external: true, var: '--x' })))
			.toBe(true)
		// external:true wins even without a $value or a valid var (validation is deferred).
		expect(hasExternalMarker({ $extensions: { [KEY]: { external: true } } }))
			.toBe(true)
		expect(hasExternalMarker(marker({ external: false })))
			.toBe(false)
		expect(hasExternalMarker(5))
			.toBe(false)
	})
})

describe('bottleneck C — external var alias', () => {
	const root = fileURLToPath(new URL('./fixtures/C-external-var-alias', import.meta.url))

	it('emits external aliases under :root only, using the config prefix', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			prefix: 'syno',
			root,
			sources: ['external.tokens.json'],
		})

		expect(css)
			.toContain('--syno-surface-z0:var(--guideline-semantic-surface-z0)')
		expect(css)
			.toContain('--syno-text-primary:var(--guideline-semantic-text-primary)')
	})

	it('recognises a marker-bearing node that has no $value', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: {
				surface: {
					z0: {
						$type: 'color',
						$extensions: { [KEY]: { external: true, var: '--ext-z0' } },
					},
				},
			},
		})
		expect(css)
			.toContain('--surface-z0:var(--ext-z0)')
	})
})

describe('external alias theme + validation semantics', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('never themes an external alias: warns and skips it in a theme source', async () => {
		const warn = vi.spyOn(log, 'warn')
			.mockImplementation(() => {})

		const external = (v: string) => ({
			$type: 'color',
			$value: `var(${v})`,
			$extensions: { [KEY]: { external: true, var: v } },
		})

		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: { surface: { z0: external('--ext-z0') } },
			themes: {
				dark: { sources: { surface: { z0: external('--ext-z0-dark') } } },
			},
		})

		// Base emission uses the marker var, not the literal $value assumptions.
		expect(css)
			.toContain(':root{--surface-z0:var(--ext-z0)')
		// No themed emission for the external token.
		expect(css).not.toContain('.dark{--surface-z0')
		expect(css).not.toContain('--ext-z0-dark')
		expect(warn)
			.toHaveBeenCalledWith(expect.stringContaining('cannot be themed'))
	})

	it('warns and skips a token with an invalid external marker', async () => {
		const warn = vi.spyOn(log, 'warn')
			.mockImplementation(() => {})

		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: {
				surface: {
					bad: { $type: 'color', $extensions: { [KEY]: { external: true, var: 'no-dashes' } } },
					ok: { $value: '#0f0' },
				},
			},
		})

		expect(css).not.toContain('--surface-bad')
		expect(css)
			.toContain('--surface-ok:#0f0')
		expect(warn)
			.toHaveBeenCalledWith(expect.stringContaining('Invalid external alias marker'))
	})

	it('carries $type, $description, $deprecated and $extensions onto the external IR', () => {
		const base: LoadedSources['base'] = [{
			surface: {
				z0: {
					$type: 'color',
					$description: 'themed by SVC',
					$deprecated: true,
					$extensions: { [KEY]: { external: true, var: '--ext-z0' } },
				},
			},
		}]
		const ir = normalizeTokens({ base, themeBlocks: [], files: [] }, {})
		expect(ir)
			.toEqual([{
				path: ['surface', 'z0'],
				type: 'color',
				description: 'themed by SVC',
				deprecated: true,
				extensions: { [KEY]: { external: true, var: '--ext-z0' } },
				kind: { t: 'aliasExternal', cssVar: '--ext-z0' },
			}])
	})

	it('the marker wins over a conflicting $value', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			sources: {
				surface: {
					z0: {
						$type: 'color',
						$value: '#should-be-ignored',
						$extensions: { [KEY]: { external: true, var: '--ext-z0' } },
					},
				},
			},
		})
		expect(css)
			.toContain('--surface-z0:var(--ext-z0)')
		expect(css).not.toContain('#should-be-ignored')
	})
})
