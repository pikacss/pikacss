import type { DesignTokenGroup } from '@pikacss/plugin-design-tokens'
import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens'
import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

// A single source file holding several theme partitions at its top level. Each
// theme picks its own partition with `from`; the partition key is stripped from
// the emitted variable names.
const shared: DesignTokenGroup = {
	'light-mode': {
		surface: { z0: { $value: '#f7f7f7', $type: 'color' } },
		text: { primary: { $value: '#292929', $type: 'color' } },
	},
	'dark-mode': {
		surface: { z0: { $value: '#1c1c1c', $type: 'color' } },
		text: { primary: { $value: '#f7f7f7', $type: 'color' } },
	},
}

it('design tokens multi-theme example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./design-tokens.multi-theme.example.pikain.ts', import.meta.url))

	const css = await renderExampleCSS({
		config: defineEngineConfig({
			plugins: [designTokens()],
			designTokens: {
				themes: {
					light: {
						from: 'light-mode',
						selector: ':root, :root.light',
						media: '(prefers-color-scheme: light)',
						sources: shared,
					},
					dark: {
						from: 'dark-mode',
						selector: ':root.dark',
						media: '(prefers-color-scheme: dark)',
						sources: shared,
					},
				},
			},
		}),
		usageCode: usage,
		renderScope: 'preflights-and-atomic',
	})

	await expect(css).toMatchFileSnapshot('./design-tokens.multi-theme.example.pikaout.css')
})
