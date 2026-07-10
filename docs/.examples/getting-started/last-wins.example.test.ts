import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('last wins example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./last-wins.example.pikain.ts', import.meta.url))
	const css = await renderExampleCSS({ usageCode: usage })
	await expect(css).toMatchFileSnapshot('./last-wins.example.pikaout.css')
})
