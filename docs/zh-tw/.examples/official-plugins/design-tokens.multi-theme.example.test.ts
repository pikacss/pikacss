import type { DesignTokenGroup } from '@pikacss/plugin-design-tokens'
import { defineEngineConfig } from '@pikacss/core'
import { designTokens } from '@pikacss/plugin-design-tokens'
import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

// 單一來源檔案在其最上層存放多個主題分區。每個
// 主題都用 `from` 選取自己的分區；分區的 key 會從
// 輸出的變數名稱中去除。
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
