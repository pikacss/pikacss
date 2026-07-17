import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('pseudo example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./pseudo.example.pikain.ts', import.meta.url))
	const css = await renderExampleCSS({ usageCode: usage })
	await expect(css).toMatchFileSnapshot('./pseudo.example.pikaout.css')
})
