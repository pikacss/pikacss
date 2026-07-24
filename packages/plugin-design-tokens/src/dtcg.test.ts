import type { LoadedSources } from './ir'
import { fileURLToPath } from 'node:url'
import { createEngine, log } from '@pikacss/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getDeprecatedTokenNames } from './deprecated'
import { applyDtcgNormalizer } from './dtcg'
import { designTokens } from './node'
import { normalizeTokens } from './normalize'

function dtcg(raw: unknown, opts: { id?: string, contentById?: Map<string, unknown[]> } = {}) {
	const id = opts.id ?? 'inline'
	const contentById = opts.contentById ?? new Map<string, unknown[]>([[id, [raw]]])
	return applyDtcgNormalizer(raw, { id, contentById }) as any
}

function loaded(partial: Partial<LoadedSources>): LoadedSources {
	return { base: [], themeBlocks: [], files: [], ...partial }
}

async function renderTokensCss(designTokensConfig: any) {
	const engine = await createEngine({
		plugins: [designTokens()],
		designTokens: designTokensConfig,
	})
	const css = await engine.renderPreflights(false)
	return { engine, css }
}

describe('applyDtcgNormalizer', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('passes non-object raw through unchanged', () => {
		expect(dtcg([1, 2, 3]))
			.toEqual([1, 2, 3])
	})

	it('rewrites a local $ref into a whole-value alias using the pointer path', () => {
		const raw = {
			color: {
				primary: { $value: '#111', $type: 'color' },
				alias: { $ref: '#/color/primary' },
			},
		}
		const out = dtcg(raw)
		expect(out.color.alias)
			.toEqual({ $value: '{color.primary}' })
	})

	it('carries $type, $description and $extensions onto a rewritten $ref token', () => {
		const raw = {
			color: { p: { $value: '#111', $type: 'color' } },
			alias: { $ref: '#/color/p', $type: 'color', $description: 'aliased', $extensions: { 'com.x': 2 } },
		}
		const out = dtcg(raw)
		expect(out.alias)
			.toEqual({
				$value: '{color.p}',
				$type: 'color',
				$description: 'aliased',
				$extensions: { 'com.x': 2 },
			})
	})

	it('pushes group-level $type down onto children that omit their own', () => {
		const raw = {
			space: {
				$type: 'dimension',
				$description: 'inherited',
				sm: { $value: '4px' },
				scale: { $type: 'number', md: { $value: '8px' } },
			},
		}
		const out = dtcg(raw)
		// Reserved keys are dropped, never emitted as children.
		expect('$type' in out.space)
			.toBe(false)
		expect('$description' in out.space)
			.toBe(false)
		expect(out.space.sm.$type)
			.toBe('dimension')
		// A nested group's own $type overrides the ancestor's for its children.
		expect(out.space.scale.md.$type)
			.toBe('number')
	})

	it('pushes group-level $deprecated down, but a token overrides it', () => {
		const raw = {
			g: {
				$deprecated: true,
				a: { $value: '1' },
				b: { $value: '2', $deprecated: false },
			},
		}
		const out = dtcg(raw)
		expect(out.g.a.$deprecated)
			.toBe(true)
		expect('$deprecated' in out.g.b)
			.toBe(false)
	})

	it('leaves scalar / invalid children untouched for the flatten stage to warn on', () => {
		const out = dtcg({ color: { weird: 5 } })
		expect(out.color.weird)
			.toBe(5)
	})

	it('warns and skips a $ref whose value is not a string', () => {
		const warn = vi.spyOn(log, 'warn')
			.mockImplementation(() => {})
		const out = dtcg({ a: { $ref: 123 } })
		expect('a' in out)
			.toBe(false)
		expect(warn)
			.toHaveBeenCalledWith(expect.stringContaining('must be a string'))
	})

	it('warns and skips a $ref with bad pointer syntax', () => {
		const warn = vi.spyOn(log, 'warn')
			.mockImplementation(() => {})
		// No `#`, a fragment that does not start with `/`, and an empty fragment.
		const out = dtcg({ a: { $ref: 'color.primary' }, b: { $ref: '#color/primary' }, c: { $ref: 'x#' } })
		expect('a' in out)
			.toBe(false)
		expect('b' in out)
			.toBe(false)
		expect('c' in out)
			.toBe(false)
		expect(warn)
			.toHaveBeenCalledWith(expect.stringContaining('Invalid $ref'))
	})

	it('finds the pointer target across multiple documents loaded under one id', () => {
		const contentById = new Map<string, unknown[]>([
			// A `.md` source yields several docs under the same id; the target lives
			// in the second document.
			['/proj/design.md', [{ color: { a: { $value: '#a' } } }, { color: { b: { $value: '#b' } } }]],
			['/proj/semantic.json', [{ alias: { $ref: 'design.md#/color/b' } }]],
		])
		const out = dtcg(
			{ alias: { $ref: 'design.md#/color/b' } },
			{ id: '/proj/semantic.json', contentById },
		)
		expect(out.alias)
			.toEqual({ $value: '{color.b}' })
	})

	it('skips a chained $ref whose next hop points to an unloaded source', () => {
		const warn = vi.spyOn(log, 'warn')
			.mockImplementation(() => {})
		const contentById = new Map<string, unknown[]>([
			['/proj/prim.json', [{ a: { $ref: 'gone.json#/b' } }]],
			['/proj/sem.json', [{ x: { $ref: 'prim.json#/a' } }]],
		])
		const out = dtcg(
			{ x: { $ref: 'prim.json#/a' } },
			{ id: '/proj/sem.json', contentById },
		)
		expect('x' in out)
			.toBe(false)
		expect(warn)
			.toHaveBeenCalledWith(expect.stringContaining('missing token'))
	})

	it('warns and skips a $ref to an unknown source', () => {
		const warn = vi.spyOn(log, 'warn')
			.mockImplementation(() => {})
		const contentById = new Map<string, unknown[]>([
			['/proj/semantic.json', [{ surface: { z0: { $ref: 'nope.json#/color/x' } } }]],
		])
		const out = dtcg(
			{ surface: { z0: { $ref: 'nope.json#/color/x' } } },
			{ id: '/proj/semantic.json', contentById },
		)
		expect('z0' in out.surface)
			.toBe(false)
		expect(warn)
			.toHaveBeenCalledWith(expect.stringContaining('unknown source'))
	})

	it('warns and skips a $ref to a missing pointer path in a known source', () => {
		const warn = vi.spyOn(log, 'warn')
			.mockImplementation(() => {})
		const contentById = new Map<string, unknown[]>([
			['/proj/primitive.json', [{ color: { grey: { 200: { $value: '#eee' } } } }]],
			['/proj/semantic.json', [{ surface: { z0: { $ref: 'primitive.json#/color/grey/999' } } }]],
		])
		const out = dtcg(
			{ surface: { z0: { $ref: 'primitive.json#/color/grey/999' } } },
			{ id: '/proj/semantic.json', contentById },
		)
		expect('z0' in out.surface)
			.toBe(false)
		expect(warn)
			.toHaveBeenCalledWith(expect.stringContaining('missing token'))
	})

	it('warns and skips a circular local $ref chain without looping', () => {
		const warn = vi.spyOn(log, 'warn')
			.mockImplementation(() => {})
		const raw = { a: { $ref: '#/b' }, b: { $ref: '#/a' } }
		const out = dtcg(raw)
		expect(out)
			.toEqual({})
		expect(warn)
			.toHaveBeenCalledWith(expect.stringContaining('Circular $ref'))
	})

	it('treats a chained cross-file $ref from an inline source as unresolvable', () => {
		const warn = vi.spyOn(log, 'warn')
			.mockImplementation(() => {})
		// `a` chains to `b`, which points cross-file — unresolvable from an inline
		// source (no directory), so both are warned about and skipped.
		const raw = { a: { $ref: '#/b' }, b: { $ref: 'x.json#/y' } }
		const out = dtcg(raw)
		expect(out)
			.toEqual({})
		expect(warn)
			.toHaveBeenCalled()
	})
})

describe('deprecated registry', () => {
	it('returns an empty set for an engine with no recorded deprecations', () => {
		expect([...getDeprecatedTokenNames({})])
			.toEqual([])
	})
})

describe('flatten captures $deprecated and $extensions', () => {
	it('sets deprecated and extensions on the IR node', () => {
		const ir = normalizeTokens(
			loaded({
				base: [{
					color: {
						p: { $value: '#111', $deprecated: true, $extensions: { 'com.pikacss.design-tokens': { note: 1 } } },
					},
				}],
			}),
			{},
		)
		expect(ir)
			.toEqual([
				{
					path: ['color', 'p'],
					type: undefined,
					deprecated: true,
					extensions: { 'com.pikacss.design-tokens': { note: 1 } },
					kind: { t: 'value', value: '#111' },
				},
			])
	})
})

describe('bottleneck A — cross-file $ref JSON pointer', () => {
	const root = fileURLToPath(new URL('./fixtures/A-ref-jsonpointer', import.meta.url))

	it('emits primitive values and pointer-path aliases from a sibling source', async () => {
		const { css } = await renderTokensCss({
			pruneUnused: false,
			root,
			sources: ['primitive.tokens.json', 'semantic.tokens.json'],
		})

		expect(css)
			.toContain('--color-grey-100:#ffffff')
		expect(css)
			.toContain('--color-grey-200:#f7f7f7')
		expect(css)
			.toContain('--color-grey-1400:#292929')
		expect(css)
			.toContain('--surface-z0:var(--color-grey-200)')
		expect(css)
			.toContain('--surface-z1:var(--color-grey-100)')
		expect(css)
			.toContain('--text-primary:var(--color-grey-1400)')
	})
})

describe('bottleneck F — group $type inheritance, composite, $deprecated', () => {
	const root = fileURLToPath(new URL('./fixtures/F-group-type-and-composite', import.meta.url))

	it('inherits group $type, serializes the composite, and records deprecation', async () => {
		const { engine, css } = await renderTokensCss({
			pruneUnused: false,
			root,
			sources: ['composite.tokens.json'],
		})

		// space.* inherit dimension type and emit as plain values.
		expect(css)
			.toContain('--space-sm:4px')
		expect(css)
			.toContain('--space-md:8px')
		expect(css)
			.toContain('--space-lg:16px')
		// Composite shadow with an aliased member resolves to a box-shadow string.
		expect(css)
			.toContain('--color-shadow:rgba(0, 0, 0, 0.12)')
		expect(css)
			.toContain('--elevation-card:0 2px 8px 0 var(--color-shadow)')
		// Reserved keys never become child tokens.
		expect(css).not.toContain('--space-description')
		expect(css).not.toContain('--space-deprecated')
		// Deprecated token still emits but is recorded in the internal registry.
		expect([...getDeprecatedTokenNames(engine)])
			.toEqual(['--space-lg'])
	})
})
