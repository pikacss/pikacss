import { describe, expect, it, vi } from 'vitest'

import { createEngine, renderPreflightDefinition } from '../engine'
import { extractUsedVarNames, extractUsedVarNamesFromPreflightResult, normalizeVariableName } from './variables'

describe('variables helpers', () => {
	it('extracts and normalizes referenced variable names from strings and preflight objects', () => {
		expect(extractUsedVarNames('color: var(--fg); background: var(--bg);'))
			.toEqual(['--fg', '--bg'])
		expect(normalizeVariableName('tone'))
			.toBe('--tone')
		expect(extractUsedVarNamesFromPreflightResult({
			':root': { '--fg': 'var(--bg)' },
			'body': { color: 'var(--accent)' },
		}))
			.toEqual(['--bg', '--accent'])
		expect(extractUsedVarNamesFromPreflightResult('border-color: var(--border);'))
			.toEqual(['--border'])
	})
})

describe('variables plugin', () => {
	it('renders transitively used variables, respects autocomplete flags, and warns on invalid config shapes', async () => {
		const diagnostics: { code: string, level: string, message: string }[] = []

		const engine = await createEngine({
			preflights: [
				{ body: { color: 'var(--alias)' } },
			],
			variables: {
				definitions: {
					'--color': '#fff',
					'[data-theme="dark"]': {
						'--color': '#000',
					},
					'--alias': { value: 'var(--color)', autocomplete: { asValueOf: ['backgroundColor'], asProperty: false } },
					'--manual': { value: null, autocomplete: { asValueOf: '-' } },
					'.invalid': 'broken' as any,
				},
			},
		}, {
			onDiagnostic: diagnostic => diagnostics.push(diagnostic),
		})

		await engine.use({ color: 'var(--alias)' })
		const preflights = await engine.renderPreflights(false)

		expect(preflights)
			.toContain(':root{--color:#fff;--alias:var(--color);}')
		expect(preflights)
			.toContain('[data-theme="dark"]{--color:#000;}')
		expect(preflights.includes('--manual'))
			.toBe(false)
		expect(engine.config.autocomplete.cssProperties.get('*'))
			.toContain('var(--color)')
		expect(engine.config.autocomplete.cssProperties.get('backgroundColor'))
			.toContain('var(--alias)')
		expect(engine.config.autocomplete.extraCssProperties.has('--alias'))
			.toBe(false)
		expect(diagnostics)
			.toContainEqual(expect.objectContaining({
				level: 'warning',
				code: 'variables-invalid-scope',
				message: expect.stringContaining('Invalid variables scope for selector ".invalid"'),
			}))
	})

	it('merges definitions in order and lets later entries override earlier ones', async () => {
		const engine = await createEngine({
			variables: {
				definitions: [
					{
						'--shared': 'red',
					},
					{
						'--shared': { value: 'pink', autocomplete: { asValueOf: '-' } },
						'--plain': '1rem',
					},
				],
			},
		})

		await engine.use({ color: 'var(--shared)', margin: 'var(--plain)' })
		const css = await engine.renderPreflights(false)

		expect(css)
			.toContain(':root{--shared:pink;--plain:1rem;}')
		expect(engine.config.autocomplete.cssProperties.get('color') ?? [])
			.not.toContain('var(--shared)')
		expect(engine.config.autocomplete.cssProperties.get('*'))
			.toContain('var(--plain)')
	})

	it('keeps safe-listed and pruneUnused=false variables even when they are not referenced', async () => {
		const engine = await createEngine({
			variables: {
				safeList: ['--safe'],
				definitions: {
					'--safe': 'red',
					'--kept': { value: 'blue', pruneUnused: false },
				},
			},
		})

		const preflights = await engine.renderPreflights(false)

		expect(preflights)
			.toContain(':root{--safe:red;--kept:blue;}')
		expect(engine.config.autocomplete.cssProperties.get('*'))
			.toEqual(expect.arrayContaining(['var(--safe)', 'var(--kept)']))
	})

	it('emits the transitive dependencies of safe-listed and pruneUnused=false variables', async () => {
		const engine = await createEngine({
			variables: {
				safeList: ['--alias'],
				definitions: {
					'--alias': 'var(--base)',
					'--base': 'red',
					'--kept': { value: 'var(--kept-dep)', pruneUnused: false },
					'--kept-dep': 'blue',
				},
			},
		})

		const preflights = await engine.renderPreflights(false)

		expect(preflights)
			.toContain('--alias:var(--base)')
		expect(preflights)
			.toContain('--base:red')
		expect(preflights)
			.toContain('--kept-dep:blue')
	})

	it('detects variable references containing whitespace inside var()', async () => {
		const engine = await createEngine({
			variables: {
				definitions: { '--sp': '4px' },
			},
		})

		await engine.use({ margin: 'var( --sp )' })

		expect(await engine.renderPreflights(false))
			.toContain('--sp:4px')
	})

	it('scopes variable pruning to usedAtomicStyleIds when provided', async () => {
		const engine = await createEngine({
			variables: {
				definitions: {
					'--used': 'red',
					'--stale': 'blue',
				},
			},
		})

		const usedIds = await engine.use({ color: 'var(--used)' })
		await engine.use({ background: 'var(--stale)' })

		const scoped = await engine.renderPreflights(false, { usedAtomicStyleIds: usedIds })
		expect(scoped)
			.toContain('--used:red')
		expect(scoped)
			.not.toContain('--stale')

		// Without the option the whole store is still considered.
		const full = await engine.renderPreflights(false)
		expect(full)
			.toContain('--stale:blue')
	})

	it('executes each user preflight function only once per render pass', async () => {
		const fn = vi.fn(() => ({ body: { color: 'var(--fg)' } }))
		const engine = await createEngine({
			preflights: [fn],
			variables: {
				definitions: { '--fg': 'black' },
			},
		})

		const css = await engine.renderPreflights(false)

		expect(fn)
			.toHaveBeenCalledTimes(1)
		expect(css)
			.toContain('--fg:black')
	})

	it('ignores failing auxiliary preflights and missing referenced variables while still rendering known ones', async () => {
		const engine = await createEngine({
			preflights: [
				() => {
					throw new Error('boom')
				},
				{ body: { color: 'var(--missing)' } },
			],
			variables: {
				definitions: {
					'--size': '1rem',
				},
			},
		})

		await engine.use({ margin: 'var(--size)' })
		const variablesPreflight = engine.config.preflights.find(preflight => preflight.id === 'core:variables')!
		const rendered = await renderPreflightDefinition({
			engine,
			preflightDefinition: await variablesPreflight.fn(engine, false) as any,
			isFormatted: false,
		})

		expect(rendered)
			.toContain(':root{--size:1rem;}')
	})

	it('expands duplicate transitive refs through the variables preflight without duplicating emitted leaves', async () => {
		const engine = await createEngine({
			variables: {
				definitions: {
					'--base': 'red',
					'--alias-a': 'var(--base)',
					'--alias-b': 'var(--base)',
					'--entry': 'var(--alias-a) var(--alias-b)',
				},
			},
		})

		await engine.use({ color: 'var(--entry)' })
		const css = await engine.renderPreflights(false)

		expect(css)
			.toContain('--entry:var(--alias-a) var(--alias-b);')
		expect(css)
			.toContain('--alias-a:var(--base);')
		expect(css)
			.toContain('--alias-b:var(--base);')
		expect(css.match(/--base:red;/g))
			.toHaveLength(1)
	})

	it('skips null-valued variable entries and missing varMap entries during transitive expansion', async () => {
		const engine = await createEngine({
			variables: {
				definitions: {
					'--null-val': { value: null },
					'--refs-null': { value: 'var(--null-val) var(--nonexistent)' },
				},
			},
		})

		await engine.use({ color: 'var(--refs-null)' })
		const css = await engine.renderPreflights(false)

		expect(css)
			.toContain('--refs-null:var(--null-val) var(--nonexistent);')
		expect(css.includes('--null-val:'))
			.toBe(false)
	})

	it('expands transitive variable references through tuple-valued (fallback) entries', async () => {
		const engine = await createEngine({
			variables: {
				definitions: {
					'--base': '1px',
					'--with-fallback': { value: ['var(--base)', ['solid']] },
				},
			},
		})

		await engine.use({ border: 'var(--with-fallback)' })
		const css = await engine.renderPreflights(false)

		expect(css)
			.toContain('--base:1px;')
		expect(css)
			.toContain('--with-fallback:var(--base);')
	})

	it('skips null and non-string preflight values in helper extraction', () => {
		expect(extractUsedVarNamesFromPreflightResult({
			body: null as any,
			html: {
				color: 'var(--tone)',
				opacity: 0.5 as any,
				nested: {
					backgroundColor: 'var(--tone)',
				},
			},
		}))
			.toEqual(['--tone', '--tone'])
	})
})
