import { describe, expect, it, vi } from 'vitest'

import { typography } from './index'
import { typographyVariables } from './styles'

function createEngine() {
	return {
		shortcuts: {
			add: vi.fn(),
		},
		variables: {
			add: vi.fn(),
		},
	}
}

describe('typography plugin', () => {
	it('registers default variables and prose shortcuts during engine setup', async () => {
		const plugin = typography()
		const engine = createEngine()

		await plugin.configureEngine?.(engine as any)

		expect(engine.variables.add)
			.toHaveBeenCalledWith(typographyVariables)

		const shortcutNames = engine.shortcuts.add.mock.calls
			.map(call => call[0][0])

		expect(shortcutNames)
			.toEqual(expect.arrayContaining([
				'prose-base',
				'prose',
				'prose-sm',
				'prose-lg',
				'prose-xl',
				'prose-2xl',
				'prose-code',
				'prose-tables',
			]))
	})

	it('merges custom variables before registering shortcuts', async () => {
		const plugin = typography()
		const engine = createEngine()

		plugin.configureRawConfig?.({
			typography: {
				variables: {
					'--pk-prose-color-body': '#123456',
				},
			},
		} as any)
		plugin.configureRawConfig?.({} as any)

		await plugin.configureEngine?.(engine as any)

		expect(engine.variables.add)
			.toHaveBeenCalledWith(expect.objectContaining({
				'--pk-prose-color-body': '#123456',
			}))
		expect(engine.shortcuts.add)
			.toHaveBeenCalled()
	})
})
