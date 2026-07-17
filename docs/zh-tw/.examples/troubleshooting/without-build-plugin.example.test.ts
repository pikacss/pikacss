import { it } from 'vitest'
import { css } from './without-build-plugin.example'

it('without build plugin example composes rendered CSS from the engine API', async ({ expect }) => {
	expect(css).toContain('@layer')
	expect(css).toContain('color: red;')
})