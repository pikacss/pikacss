import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens'
import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('design tokens DTCG example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./design-tokens.dtcg.example.pikain.ts', import.meta.url))

	const css = await renderExampleCSS({
		config: defineEngineConfig({
			plugins: [designTokens()],
			designTokens: {
				sources: {
					color: {
						// Group-level $type flows down onto every descendant token.
						$type: 'color',
						primary: { $value: '#3b82f6' },
						// A $ref node is a token expressed purely as a JSON pointer; it
						// becomes an alias to the target's emitted variable.
						brand: { $ref: '#/color/primary' },
						// Deprecated tokens still emit; the name is tracked for warnings.
						legacy: { $value: '#dc2626', $deprecated: true },
					},
				},
			},
		}),
		usageCode: usage,
		renderScope: 'preflights-and-atomic',
	})

	await expect(css).toMatchFileSnapshot('./design-tokens.dtcg.example.pikaout.css')
})
