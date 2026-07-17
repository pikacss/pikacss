import { defineEngineConfig } from '@pikacss/core'
import { typography } from '@pikacss/plugin-typography'
import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('typography usage example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./typography.usage.example.pikain.ts', import.meta.url))

	const css = await renderExampleCSS({
		config: defineEngineConfig({
			plugins: [typography()],
		}),
		usageCode: usage,
	})

	await expect(css).toMatchFileSnapshot('./typography.usage.example.pikaout.css')
})