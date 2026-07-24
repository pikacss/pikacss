import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens'
import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('design tokens external-alias example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./design-tokens.external.example.pikain.ts', import.meta.url))

	const css = await renderExampleCSS({
		config: defineEngineConfig({
			plugins: [designTokens()],
			designTokens: {
				prefix: 'syno',
				sources: {
					surface: {
						z0: {
							$type: 'color',
							$value: 'var(--guideline-semantic-surface-z0)',
							$extensions: {
								'com.pikacss.design-tokens': {
									external: true,
									var: '--guideline-semantic-surface-z0',
								},
							},
						},
					},
					text: {
						primary: {
							$type: 'color',
							$value: 'var(--guideline-semantic-text-primary)',
							$extensions: {
								'com.pikacss.design-tokens': {
									external: true,
									var: '--guideline-semantic-text-primary',
								},
							},
						},
					},
				},
			},
		}),
		usageCode: usage,
		renderScope: 'preflights-and-atomic',
	})

	await expect(css).toMatchFileSnapshot('./design-tokens.external.example.pikaout.css')
})
