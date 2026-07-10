import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('runtime value example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./runtime-value.example.pikain.ts', import.meta.url))
	const css = await renderExampleCSS({ usageCode: usage })
	await expect(css).toMatchFileSnapshot('./runtime-value.example.pikaout.css')
})
