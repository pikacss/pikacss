import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('important example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./important.example.pikain.ts', import.meta.url))
	const css = await renderExampleCSS({
		config: { important: true },
		usageCode: usage,
	})
	await expect(css).toMatchFileSnapshot('./important.example.pikaout.css')
})
