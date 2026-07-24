import type { LoadedSources } from './ir'
import { describe, expect, it } from 'vitest'

import { normalizeTokens } from './normalize'

function loaded(partial: Partial<LoadedSources>): LoadedSources {
	return { base: [], themeBlocks: [], files: [], ...partial }
}

describe('normalizeTokens', () => {
	it('carries $description onto the IR node and classifies whole-value aliases', () => {
		const ir = normalizeTokens(
			loaded({
				base: [{
					color: {
						primary: { $value: '#3b82f6', $type: 'color', $description: 'Primary brand color' },
						accent: { $value: '{color.primary}' },
					},
				}],
			}),
			{},
		)

		expect(ir)
			.toEqual([
				{ path: ['color', 'primary'], type: 'color', description: 'Primary brand color', kind: { t: 'value', value: '#3b82f6' } },
				{ path: ['color', 'accent'], type: undefined, kind: { t: 'aliasInternal', targetPath: ['color', 'primary'] } },
			])
	})

	it('stamps theme tokens with the first-seen selector per theme', () => {
		const ir = normalizeTokens(
			loaded({
				themeBlocks: [
					{ theme: 'dark', selector: '.dark', tokens: { color: { bg: { $value: '#000' } } } },
					{ theme: 'dark', selector: '.ignored', tokens: { color: { fg: { $value: '#fff' } } } },
				],
			}),
			{},
		)

		expect(ir.map(n => ({ path: n.path, selector: n.themeScope?.selector })))
			.toEqual([
				{ path: ['color', 'bg'], selector: '.dark' },
				{ path: ['color', 'fg'], selector: '.dark' },
			])
	})
})
