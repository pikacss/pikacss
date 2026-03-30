import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('cascade example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./cascade.example.pikain.ts', import.meta.url))
	const css = await renderExampleCSS({ usageCode: usage })
	await expect(css).toMatchFileSnapshot('./cascade.example.pikaout.css')
})
