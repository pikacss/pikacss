import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens'
import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('design tokens strict-mode example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./design-tokens.strict.example.pikain.ts', import.meta.url))

	const css = await renderExampleCSS({
		config: defineEngineConfig({
			plugins: [designTokens()],
			designTokens: {
				sources: {
					color: {
						primary: { $value: '#3b82f6', $type: 'color' },
						surface: { $value: '#f8fafc', $type: 'color' },
					},
				},
				strict: {
					level: 'error',
					allowedValues: ['transparent'],
				},
			},
		}),
		usageCode: usage,
		renderScope: 'preflights-and-atomic',
	})

	await expect(css).toMatchFileSnapshot('./design-tokens.strict.example.pikaout.css')
})
