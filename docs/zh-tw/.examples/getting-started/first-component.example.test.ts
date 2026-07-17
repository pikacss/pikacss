import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('first component example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./first-component.example.pikain.ts', import.meta.url))
	const css = await renderExampleCSS({ usageCode: usage })
	await expect(css).toMatchFileSnapshot('./first-component.example.pikaout.css')
})
