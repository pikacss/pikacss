import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('null removal example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./null-removal.example.pikain.ts', import.meta.url))
	const css = await renderExampleCSS({ usageCode: usage })
	await expect(css).toMatchFileSnapshot('./null-removal.example.pikaout.css')
})
