import { describe, expect, it, vi } from 'vitest'

import { typography } from './index'
import { proseHrStyle, proseListsStyle, typographyVariables } from './styles'

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

	it('scopes list-item edge margins to paragraphs so nested-list margins stay intact', () => {
		for (const list of ['ul', 'ol']) {
			expect(proseListsStyle)
				.toHaveProperty([`$ > ${list} > li > p:first-child`])
			expect(proseListsStyle)
				.toHaveProperty([`$ > ${list} > li > p:last-child`])
			expect(proseListsStyle)
				.not.toHaveProperty([`$ > ${list} > li > :first-child`])
			expect(proseListsStyle)
				.not.toHaveProperty([`$ > ${list} > li > :last-child`])
		}
	})

	it('declares an explicit hr border style so resets with `border: 0` do not hide it', () => {
		expect(proseHrStyle['$ hr'])
			.toMatchObject({
				borderTopStyle: 'solid',
				borderTopWidth: '1px',
			})
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
