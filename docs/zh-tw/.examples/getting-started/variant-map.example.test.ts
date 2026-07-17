import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('variant map example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./variant-map.example.pikain.ts', import.meta.url))
	const css = await renderExampleCSS({ usageCode: usage })
	await expect(css).toMatchFileSnapshot('./variant-map.example.pikaout.css')
})
