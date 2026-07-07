import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens'
import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('design tokens usage example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./design-tokens.usage.example.pikain.ts', import.meta.url))

	const css = await renderExampleCSS({
		config: defineEngineConfig({
			plugins: [designTokens()],
			designTokens: {
				sources: {
					color: {
						primary: { $value: '#3b82f6', $type: 'color' },
						surface: { $value: '#f8fafc' },
						unused: { $value: '#dc2626' },
					},
					shadow: {
						md: {
							$type: 'shadow',
							$value: { offsetX: '0', offsetY: '4px', blur: '6px', spread: '-1px', color: 'rgb(0 0 0 / 0.1)' },
						},
					},
				},
				themes: {
					dark: {
						sources: { color: { surface: { $value: '#0f172a' } } },
					},
				},
			},
		}),
		usageCode: usage,
		renderScope: 'preflights-and-atomic',
	})

	await expect(css).toMatchFileSnapshot('./design-tokens.usage.example.pikaout.css')
})
