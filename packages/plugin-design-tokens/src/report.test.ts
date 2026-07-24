import type { Engine } from '@pikacss/core'
import { createEngine } from '@pikacss/core'
import { describe, expect, it } from 'vitest'

import { designTokens } from './index'

// A token set exercising every kind that report() must count:
// - a plain value token (--color-primary)
// - an internal alias whose value is var(--color-primary) (--color-accent)
// - a deprecated value token (--color-legacy)
// - an unused value token (--color-unused)
// - an external alias pointing at a host-owned var (--brand-ext)
const KEY = 'com.pikacss.design-tokens'
const TOKENS = {
	color: {
		primary: { $value: '#3b82f6', $type: 'color' },
		accent: { $value: '{color.primary}', $type: 'color' },
		legacy: { $value: '#ff0000', $type: 'color', $deprecated: true },
		unused: { $value: '#000000', $type: 'color' },
	},
	brand: {
		ext: { $extensions: { [KEY]: { external: true, var: '--host-brand' } } },
	},
}

async function makeEngine(designTokensConfig: any): Promise<Engine> {
	return createEngine({
		plugins: [designTokens()],
		designTokens: { pruneUnused: false, ...designTokensConfig },
	})
}

describe('designTokens report()', () => {
	it('is exposed on the engine even without a designTokens config', async () => {
		const engine = await createEngine({ plugins: [designTokens()] })
		expect(typeof engine.designTokens?.report)
			.toBe('function')
		expect(engine.designTokens!.report())
			.toEqual({
				totalTokens: 0,
				used: [],
				unused: [],
				deprecatedInUse: [],
				strictViolations: { warning: 0, error: 0 },
			})
	})

	it('counts total tokens across every kind, including external aliases', async () => {
		const engine = await makeEngine({ sources: TOKENS })
		expect(engine.designTokens!.report().totalTokens)
			.toBe(5)
	})

	it('partitions used/unused and follows var-in-var chains and external aliases', async () => {
		const engine = await makeEngine({ sources: TOKENS })
		// Reference the alias (chains to --color-primary), the deprecated token,
		// and the external alias directly. --color-unused is referenced by nothing.
		await engine.use(
			{ color: 'var(--color-accent)' },
			{ borderColor: 'var(--color-legacy)' },
			{ background: 'var(--brand-ext)' },
		)
		const report = engine.designTokens!.report()
		expect(report.used)
			.toEqual(['--brand-ext', '--color-accent', '--color-legacy', '--color-primary'])
		expect(report.unused)
			.toEqual(['--color-unused'])
		expect(report.deprecatedInUse)
			.toEqual(['--color-legacy'])
	})

	it('handles a chain target that is also referenced directly (no double count)', async () => {
		const engine = await makeEngine({ sources: TOKENS })
		// --color-primary is referenced directly AND is the target of --color-accent's
		// chain, so transitive expansion re-encounters an already-used ref.
		await engine.use(
			{ color: 'var(--color-primary)' },
			{ backgroundColor: 'var(--color-accent)' },
		)
		const report = engine.designTokens!.report()
		expect(report.used)
			.toEqual(['--color-accent', '--color-primary'])
	})

	it('reports no used tokens and all unused when nothing references them', async () => {
		const engine = await makeEngine({ sources: TOKENS })
		const report = engine.designTokens!.report()
		expect(report.used)
			.toEqual([])
		expect(report.unused)
			.toEqual(['--brand-ext', '--color-accent', '--color-legacy', '--color-primary', '--color-unused'])
		expect(report.deprecatedInUse)
			.toEqual([])
	})

	it('accumulates strict-violation counts across transform passes', async () => {
		const engine = await makeEngine({
			sources: TOKENS,
			strict: { level: 'error' },
		})
		// A raw literal on a governed color property is an error-level violation.
		// Counters increment in-hook regardless of whether a host onDiagnostic is
		// wired, so report() reflects the whole run.
		await engine.use({ backgroundColor: 'red' })
		expect(engine.designTokens!.report().strictViolations)
			.toEqual({ warning: 0, error: 1 })

		// A second violation advances the counter further.
		await engine.use({ color: 'blue' })
		expect(engine.designTokens!.report().strictViolations)
			.toEqual({ warning: 0, error: 2 })
	})

	it('counts warning-level violations under the warning counter', async () => {
		const engine = await makeEngine({
			sources: TOKENS,
			strict: { level: 'warn' },
		})
		await engine.use({ backgroundColor: 'red' })
		expect(engine.designTokens!.report().strictViolations)
			.toEqual({ warning: 1, error: 0 })
	})
})
