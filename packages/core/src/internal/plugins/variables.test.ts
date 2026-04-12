import { describe, expect, it, vi } from 'vitest'

import { createEngine, renderPreflightDefinition } from '../engine'
import { log } from '../utils'
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
	it('renders transitively used variables, infers semantic buckets, respects autocomplete flags, and warns on invalid config shapes', async () => {
		const warn = vi.fn()
		log.setWarnFn((_prefix, ...args) => warn(...args))

		const engine = await createEngine({
			preflights: [
				{ body: { color: 'var(--alias)' } },
			],
			variables: {
				colors: {
					'--color': '#fff',
					'[data-theme="dark"]': {
						'--color': '#000',
					},
				},
				others: {
					'--alias': { value: 'var(--color)', autocomplete: { asValueOf: ['backgroundColor'], asProperty: false } },
					'--manual': { value: null, autocomplete: { asValueOf: '-' } },
					'--angle': { value: '1turn', semanticType: 'angle' as any },
					'--mystery': { value: '1rem', semanticType: 'mystery' as any },
					'.invalid': 'broken' as any,
				},
			},
		})

		await engine.use({ color: 'var(--alias)' })
		const preflights = await engine.renderPreflights(false)

		log.setWarnFn((prefix, ...args) => console.warn(prefix, ...args))

		expect(preflights)
			.toContain(':root{--color:#fff;--alias:var(--color);}')
		expect(preflights)
			.toContain('[data-theme="dark"]{--color:#000;}')
		expect(preflights.includes('--manual'))
			.toBe(false)
		expect(engine.config.autocomplete.cssProperties.get('color'))
			.toContain('var(--color)')
		expect(engine.config.autocomplete.cssProperties.get('backgroundColor'))
			.toContain('var(--alias)')
		expect(engine.config.autocomplete.extraCssProperties.has('--alias'))
			.toBe(false)
		expect(warn.mock.calls.some(call => call.join(' ')
			.includes('Unknown semanticType "angle"')))
			.toBe(true)
		expect(warn.mock.calls.some(call => call.join(' ')
			.includes('Unknown semanticType "mystery"')))
			.toBe(true)
		expect(warn.mock.calls.some(call => call.join(' ')
			.includes('Invalid variables scope for selector ".invalid"')))
			.toBe(true)
	})

	it('merges semantic buckets in order and lets others override earlier buckets', async () => {
		const engine = await createEngine({
			variables: {
				colors: {
					'--shared': 'red',
				},
				others: {
					'--shared': { value: 'pink', autocomplete: { asValueOf: '-' } },
					'--plain': '1rem',
				},
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
				others: {
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

	it('ignores failing auxiliary preflights and missing referenced variables while still rendering known ones', async () => {
		const engine = await createEngine({
			preflights: [
				() => {
					throw new Error('boom')
				},
				{ body: { color: 'var(--missing)' } },
			],
			variables: {
				others: {
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
				others: {
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
				others: {
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
				others: {
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
