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
						// group 層級的 $type 會向下套用到每個後代 token。
						$type: 'color',
						primary: { $value: '#3b82f6' },
						// $ref 節點是純粹以 JSON pointer 表達的 token；
						// 它會變成指向目標所輸出變數的別名。
						brand: { $ref: '#/color/primary' },
						// 已棄用的 token 仍會輸出；名稱會被追蹤以便發出警告。
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
