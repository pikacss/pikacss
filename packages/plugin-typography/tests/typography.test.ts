import { createEngine } from '@pikacss/core'
import { describe, expect, it } from 'vitest'

import { createTypographyPlugin } from '../src'

describe('plugin-typography', () => {
	it('returns plugin definition', () => {
		const plugin = createTypographyPlugin()
		expect(plugin.name)
			.toBe('typography')
	})

	it('should add prose shortcut and variables', async () => {
		const engine = await createEngine({
			plugins: [createTypographyPlugin()],
		})

		const ids = await engine.use('prose')
		const css = await engine.renderAtomicStyles(true, { atomicStyleIds: ids })

		expect(css)
			.toContain('color: var(--pk-prose-color-body)')
		expect(css)
			.toContain('max-width: 65ch')

		const preflights = await engine.renderPreflights(true)
		expect(preflights)
			.toContain('--pk-prose-color-body: currentColor')
		expect(preflights)
			.toContain('--pk-prose-color-headings: currentColor')
	})

	it('should support size modifiers', async () => {
		const engine = await createEngine({
			plugins: [createTypographyPlugin()],
		})

		const ids = await engine.use('prose-lg')
		const css = await engine.renderAtomicStyles(true, { atomicStyleIds: ids })

		expect(css)
			.toContain('font-size: 1.125rem')
		expect(css)
			.toContain('line-height: 1.77')
	})

	it('should support custom variables', async () => {
		const engine = await createEngine({
			plugins: [createTypographyPlugin({
				variables: {
					'--pk-prose-color-body': '#333',
				},
			})],
		})

		await engine.use('prose')
		const preflights = await engine.renderPreflights(true)
		expect(preflights)
			.toContain('--pk-prose-color-body: #333')
	})
})
