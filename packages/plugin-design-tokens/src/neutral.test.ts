import { createEngine } from '@pikacss/core'
import { describe, expect, it, vi } from 'vitest'
import { designTokens } from './index'

describe('neutral design tokens entry', () => {
	it('supports inline sources without Node.js capabilities', async () => {
		const engine = await createEngine({
			plugins: [designTokens()],
			designTokens: { pruneUnused: false, sources: { color: { primary: { $value: '#123' } } } },
		})
		expect(await engine.renderPreflights(false))
			.toContain('--color-primary:#123')
	})

	it('reports file sources when no host loader is installed', async () => {
		const onDiagnostic = vi.fn()
		await createEngine({
			plugins: [designTokens()],
			designTokens: { sources: ['./tokens.json'] },
		}, { onDiagnostic })
		expect(onDiagnostic)
			.toHaveBeenCalledWith(expect.objectContaining({ code: 'design-tokens-file-loader-unavailable' }))
	})
})
