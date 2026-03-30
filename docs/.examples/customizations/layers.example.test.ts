import { it } from 'vitest'
import { readExampleFile, renderExampleCSS } from '../_utils/pika-example'

it('layers example output matches engine', async ({ expect }) => {
	const usage = await readExampleFile(new URL('./layers.example.pikain.ts', import.meta.url))
	const css = await renderExampleCSS({
		config: { layers: { components: 5, utilities: 10 } },
		usageCode: usage,
		renderScope: 'full',
	})
	await expect(css).toMatchFileSnapshot('./layers.example.pikaout.css')
})
