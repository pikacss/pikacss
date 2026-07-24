/* eslint-disable no-template-curly-in-string */
import type { Engine } from '@pikacss/core'
import type { StrictTypeEntry } from './strict-types'
import { createEngine } from '@pikacss/core'
import { describe, expect, it } from 'vitest'

import { designTokens } from './index'

const TOKENS = {
	color: {
		primary: { $value: '#3b82f6', $type: 'color' },
		danger: { $value: '#ef4444', $type: 'color' },
	},
	space: {
		sm: { $value: '8px', $type: 'dimension' },
	},
	zLayer: {
		base: { $value: 10, $type: 'number' },
	},
}

async function makeEngine(designTokensConfig: any): Promise<Engine> {
	return createEngine({
		plugins: [designTokens()],
		designTokens: { pruneUnused: false, ...designTokensConfig },
	})
}

function entryFor(entries: StrictTypeEntry[], property: string): StrictTypeEntry | undefined {
	return entries.find(entry => entry.property === property)
}

describe('strict mode: type narrowing surface', () => {
	it('exposes strictTypes() even when types are disabled, returning an empty list', async () => {
		const engine = await makeEngine({ sources: TOKENS, strict: { level: 'error' } })
		expect(typeof engine.designTokens?.strictTypes)
			.toBe('function')
		expect(engine.designTokens!.strictTypes())
			.toEqual([])
	})

	it('returns an empty list when there are no design tokens', async () => {
		const engine = await makeEngine({ sources: {}, strict: { types: true } })
		expect(engine.designTokens!.strictTypes())
			.toEqual([])
	})

	it('narrows a color-governed property to an exclusive union', async () => {
		const engine = await makeEngine({ sources: TOKENS, strict: { types: true } })
		const entries = engine.designTokens!.strictTypes()
		const color = entryFor(entries, 'color')
		expect(color)
			.toBeDefined()
		const union = color!.union
		// Token var literals (bare + fallback template) for the governing $type only.
		expect(union)
			.toContain('"var(--color-primary)"')
		expect(union)
			.toContain('"var(--color-danger)"')
		expect(union)
			.toContain('`var(--color-primary, ${string})`')
		// CSS-wide keywords.
		for (const keyword of ['inherit', 'initial', 'unset', 'revert', 'revert-layer']) {
			expect(union)
				.toContain(`"${keyword}"`)
		}
		// Built-in color allowlist.
		expect(union)
			.toContain('"transparent"')
		expect(union)
			.toContain('"currentColor"')
		// Functional escape hatches.
		for (const fn of ['calc', 'color-mix', 'min', 'max', 'clamp', 'light-dark']) {
			expect(union)
				.toContain(`\`${fn}(\${string})\``)
		}
		// A color property never admits a dimension token or the dimension allowlist.
		expect(union)
			.not.toContain('"var(--space-sm)"')
		expect(union)
			.not.toContain('"auto"')
	})

	it('emits a whitespace/fallback-tolerant var() member so no runtime-accepted form is rejected', async () => {
		const engine = await makeEngine({ sources: TOKENS, strict: { types: true } })
		const color = entryFor(engine.designTokens!.strictTypes(), 'color')
		// A single widened template covers `var( --x )` internal whitespace and the
		// no-space fallback `var(--x,red)`, both of which the runtime accepts but the
		// two exact members do not. Kept alongside the exact members (asserted above).
		expect(color!.union)
			.toContain('`var(${string}--color-primary${string})`')
		expect(color!.union)
			.toContain('`var(${string}--color-danger${string})`')
		// Still per-`$type`: a dimension token never leaks into the color union.
		expect(color!.union)
			.not.toContain('`var(${string}--space-sm${string})`')
	})

	it('narrows a dimension-governed property to an exclusive union', async () => {
		const engine = await makeEngine({ sources: TOKENS, strict: { types: true } })
		const entries = engine.designTokens!.strictTypes()
		const padding = entryFor(entries, 'padding')
		expect(padding)
			.toBeDefined()
		expect(padding!.union)
			.toContain('"var(--space-sm)"')
		expect(padding!.union)
			.toContain('"0"')
		expect(padding!.union)
			.toContain('"auto"')
		// A dimension property never admits a color token.
		expect(padding!.union)
			.not.toContain('"var(--color-primary)"')
	})

	it('governs every property mapped to a token-carrying $type', async () => {
		const engine = await makeEngine({ sources: TOKENS, strict: { types: true } })
		const properties = engine.designTokens!.strictTypes()
			.map(entry => entry.property)
		expect(properties)
			.toContain('background-color')
		expect(properties)
			.toContain('border-color')
		expect(properties)
			.toContain('width')
		expect(properties)
			.toContain('font-size')
	})

	it('narrows a $type without a built-in allowlist to just its tokens, keywords and functions', async () => {
		const engine = await makeEngine({ sources: TOKENS, strict: { types: true } })
		// `number` governs `z-index` and has no built-in allowlist entries.
		const zIndex = entryFor(engine.designTokens!.strictTypes(), 'z-index')
		expect(zIndex)
			.toBeDefined()
		expect(zIndex!.union)
			.toContain('"var(--z-layer-base)"')
		expect(zIndex!.union)
			.toContain('"inherit"')
		expect(zIndex!.union)
			.toContain('`calc(${string})`')
		// No built-in allowlist literals leak from color/dimension.
		expect(zIndex!.union)
			.not.toContain('"transparent"')
		expect(zIndex!.union)
			.not.toContain('"auto"')
	})

	it('includes string allowedValues as literal members', async () => {
		const engine = await makeEngine({ sources: TOKENS, strict: { types: true, allowedValues: ['0', 'fit-content'] } })
		const color = entryFor(engine.designTokens!.strictTypes(), 'color')
		expect(color!.union)
			.toContain('"fit-content"')
	})

	it('disables narrowing entirely when a RegExp allowedValue is present', async () => {
		const engine = await makeEngine({ sources: TOKENS, strict: { types: true, allowedValues: [/^var\(--legacy-/] } })
		expect(engine.designTokens!.strictTypes())
			.toEqual([])
	})
})
