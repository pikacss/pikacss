import { it } from 'vitest'
import { myPlugin } from './create-plugin.example'

it('create plugin example exports a plugin factory with the documented hooks', ({ expect }) => {
	const plugin = myPlugin()

	expect(plugin.name).toBe('my-plugin')
	expect(plugin.configureRawConfig).toBeTypeOf('function')
	expect(plugin.configureEngine).toBeTypeOf('function')
})