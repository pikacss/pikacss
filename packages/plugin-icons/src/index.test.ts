/* eslint-disable no-template-curly-in-string */
import { log } from '@pikacss/core'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockEncodeSvgForCss = vi.fn((svg: string) => `encoded:${svg}`)
const mockLoadIcon = vi.fn()
const mockQuicklyValidateIconSet = vi.fn()
const mockSearchForIcon = vi.fn()
const mockStringToIcon = vi.fn()
const mockLoadNodeIcon = vi.fn()
const mockFetch = vi.fn()

vi.mock('@iconify/utils', () => ({
	encodeSvgForCss: mockEncodeSvgForCss,
	loadIcon: mockLoadIcon,
	quicklyValidateIconSet: mockQuicklyValidateIconSet,
	searchForIcon: mockSearchForIcon,
	stringToIcon: mockStringToIcon,
}))

vi.mock('@iconify/utils/lib/loader/node-loader', () => ({
	loadNodeIcon: mockLoadNodeIcon,
}))

vi.mock('ofetch', () => ({
	$fetch: mockFetch,
}))

function createEngine() {
	const store = new Map<string, unknown>()

	return {
		config: {
			prefix: 'pk-',
		},
		appendAutocomplete: vi.fn(),
		shortcuts: {
			add: vi.fn(),
		},
		variables: {
			store,
			add: vi.fn((definitions: Record<string, unknown>) => {
				for (const [key, value] of Object.entries(definitions))
					store.set(key, value)
			}),
		},
	}
}

const originalVSCodePid = process.env.VSCODE_PID
const originalESLint = process.env.ESLINT

beforeEach(() => {
	vi.clearAllMocks()
	delete process.env.VSCODE_PID
	delete process.env.ESLINT
	log.setWarnFn((_prefix, ...args) => console.warn(...args))
})

afterEach(() => {
	if (originalVSCodePid == null)
		delete process.env.VSCODE_PID
	else
		process.env.VSCODE_PID = originalVSCodePid

	if (originalESLint == null)
		delete process.env.ESLINT
	else
		process.env.ESLINT = originalESLint
})

describe('icons plugin', () => {
	it('registers autocomplete metadata and resolves custom icons into mask styles', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()
		const plugin = icons()

		mockStringToIcon.mockReturnValue({ prefix: 'mdi', name: 'home' })
		mockLoadIcon.mockImplementation(async (_prefix, _name, options) => {
			// Exercise iconCustomizer without unit — verifies no-op return path
			const props: Record<string, string> = {}
			await options.customizations.iconCustomizer?.('custom', 'check', props)
			expect(props)
				.toEqual({})

			return '<svg currentColor />'
		})

		await plugin.configureRawConfig?.({
			icons: {
				autocomplete: ['mdi:home'],
			},
		} as any)
		await plugin.configureEngine?.(engine as any)

		expect(engine.appendAutocomplete)
			.toHaveBeenCalledWith(expect.objectContaining({
				patterns: {
					shortcuts: expect.arrayContaining([
						'`i-${string}:${string}`',
						'`i-${string}:${string}?mask`',
					]),
				},
			}))

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]
		expect(shortcutEntry.autocomplete)
			.toContain('i-mdi:home')

		const style = await shortcutEntry.value(['i-mdi:home', 'mdi:home', 'auto'])

		expect(style)
			.toMatchObject({
				'--svg-icon': 'var(--pk-svg-icon-mdi-home)',
				'-webkit-mask': 'var(--svg-icon) no-repeat',
				'background-color': 'currentColor',
			})
		expect(engine.variables.add)
			.toHaveBeenCalledTimes(1)

		await shortcutEntry.value(['i-mdi:home', 'mdi:home', 'auto'])
		expect(engine.variables.add)
			.toHaveBeenCalledTimes(1)
	})

	it('falls back to local node icons in bg mode and passes resolved metadata to the processor', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()
		const processor = vi.fn()
		const plugin = icons()

		mockStringToIcon.mockReturnValue({ prefix: 'mdi', name: 'account' })
		mockLoadIcon.mockResolvedValue(null)
		mockLoadNodeIcon.mockResolvedValue('<svg><path /></svg>')

		await plugin.configureRawConfig?.({
			icons: {
				mode: 'bg',
				prefix: ['i-', 'icon-'],
				autocomplete: ['mdi:account'],
				processor,
			},
		} as any)
		await plugin.configureEngine?.(engine as any)

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]
		const style = await shortcutEntry.value(['icon-mdi:account', 'mdi:account', 'bg'])

		expect(style)
			.toMatchObject({
				'background': 'var(--svg-icon) no-repeat',
				'background-color': 'transparent',
			})
		expect(processor)
			.toHaveBeenCalledWith(
				expect.objectContaining({
					'background-size': '100% 100%',
				}),
				expect.objectContaining({
					collection: 'mdi',
					name: 'account',
					source: 'local',
					mode: 'bg',
				}),
			)
	})

	it('dedupes prefixes and forwards loader customizations, units, and used props', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()
		const plugin = icons()

		mockStringToIcon.mockReturnValue({ prefix: 'mdi', name: 'gear2Filled' })
		mockLoadIcon.mockImplementation(async (_prefix, _name, options) => {
			expect(options.scale)
				.toBe(2)
			expect(options.cwd)
				.toBe('/workspace')
			expect(options.customizations.additionalProps)
				.toEqual({ role: 'img', stroke: 'currentColor' })

			const props: Record<string, string> = {}
			await options.customizations.iconCustomizer?.('mdi', 'gear2Filled', props)
			expect(props)
				.toEqual({ width: '2rem', height: '2rem' })

			if (options.usedProps)
				options.usedProps.stroke = 'currentColor'

			return '<svg><path /></svg>'
		})

		await plugin.configureRawConfig?.({
			icons: {
				prefix: ['i-', '', 'icon-', 'i-'],
				scale: 2,
				cwd: '/workspace',
				unit: 'rem',
				extraProperties: { stroke: 'currentColor' },
				customizations: {
					additionalProps: { role: 'img' },
				},
			},
		} as any)
		await plugin.configureEngine?.(engine as any)

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]
		expect(shortcutEntry.autocomplete)
			.toEqual(['i-', 'icon-'])
		expect(shortcutEntry.shortcut.test('icon-mdi:gear2Filled?bg'))
			.toBe(true)

		const style = await shortcutEntry.value(['icon-mdi:gear2Filled', 'mdi:gear2Filled', 'bg'])
		expect(style)
			.toMatchObject({
				background: 'var(--svg-icon) no-repeat',
				stroke: 'currentColor',
			})
	})

	it('preserves width and height produced by a custom icon customizer and forwards non-default loader options', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()
		const plugin = icons()

		mockStringToIcon.mockReturnValue({ prefix: 'custom', name: 'badge' })
		mockLoadIcon.mockImplementation(async (_prefix, _name, options) => {
			expect(options.autoInstall)
				.toBe(true)
			expect(options.customCollections)
				.toEqual({ custom: { badge: '<svg />' } })
			expect(options.customizations.trimCustomSvg)
				.toBe(false)

			const props: Record<string, string> = { width: '24px', height: '12px' }
			await options.customizations.iconCustomizer?.('custom', 'badge', props)
			expect(props)
				.toEqual({ width: '24px', height: '12px' })

			return '<svg><rect /></svg>'
		})

		await plugin.configureRawConfig?.({
			icons: {
				autoInstall: true,
				collections: { custom: { badge: '<svg />' } } as any,
				unit: 'rem',
				customizations: {
					trimCustomSvg: false,
					async iconCustomizer(_collection: any, _icon: any, props: { width: string, height: string }) {
						props.width = '24px'
						props.height = '12px'
					},
				},
			},
		} as any)
		await plugin.configureEngine?.(engine as any)

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]
		const style = await shortcutEntry.value(['i-custom:badge', 'custom:badge', 'bg'])

		expect(style)
			.toMatchObject({
				background: 'var(--svg-icon) no-repeat',
			})
	})

	it('loads icons from the configured CDN when bundled sources are unavailable', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()
		const processor = vi.fn()
		const plugin = icons()

		mockStringToIcon.mockReturnValue({ prefix: 'mdi', name: 'bell' })
		mockLoadIcon.mockResolvedValue(null)
		mockLoadNodeIcon.mockResolvedValue(null)
		mockFetch.mockResolvedValue({ prefix: 'mdi' })
		mockQuicklyValidateIconSet.mockReturnValue({ prefix: 'mdi' })
		mockSearchForIcon.mockResolvedValue('<svg><circle /></svg>')

		await plugin.configureRawConfig?.({
			icons: {
				cdn: 'https://cdn.example.com/{collection}.json',
				processor,
			},
		} as any)
		await plugin.configureEngine?.(engine as any)

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]
		const style = await shortcutEntry.value(['i-mdi:bell', 'mdi:bell', 'auto'])

		expect(mockFetch)
			.toHaveBeenCalledWith('https://cdn.example.com/mdi.json')
		expect(style)
			.toMatchObject({
				background: 'var(--svg-icon) no-repeat',
			})
		expect(processor)
			.toHaveBeenCalledWith(
				expect.any(Object),
				expect.objectContaining({
					source: 'cdn',
					mode: 'bg',
				}),
			)
	})

	it('skips the local node loader in VS Code environments and expands CDN base URLs without placeholders', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()

		process.env.VSCODE_PID = '1'
		const plugin = icons()
		mockStringToIcon.mockReturnValue({ prefix: 'mdi', name: 'bell' })
		mockLoadIcon.mockResolvedValue(null)
		mockFetch.mockResolvedValue({ prefix: 'mdi' })
		mockQuicklyValidateIconSet.mockReturnValue({ prefix: 'mdi' })
		mockSearchForIcon.mockResolvedValue('<svg currentColor></svg>')

		await plugin.configureRawConfig?.({
			icons: {
				cdn: 'https://cdn.example.com/icons',
			},
		} as any)
		await plugin.configureEngine?.(engine as any)

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]
		const style = await shortcutEntry.value(['i-mdi:bell', 'mdi:bell', 'auto'])

		expect(mockLoadNodeIcon)
			.not.toHaveBeenCalled()
		expect(mockFetch)
			.toHaveBeenCalledWith('https://cdn.example.com/icons/mdi.json')
		expect(style)
			.toMatchObject({
				'-webkit-mask': 'var(--svg-icon) no-repeat',
			})
	})

	it('skips the local node loader in ESLint environments and warns when CDN loading fails due to fetch errors', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()
		const warn = vi.fn()

		process.env.ESLINT = '1'
		const plugin = icons()
		log.setWarnFn((_prefix, ...args) => warn(...args))
		mockStringToIcon.mockReturnValue({ prefix: 'mdi', name: 'alert' })
		mockLoadIcon.mockResolvedValue(null)
		mockFetch.mockRejectedValue(new Error('network'))

		await plugin.configureRawConfig?.({
			icons: {
				cdn: 'https://cdn.example.com/icons/',
			},
		} as any)
		await plugin.configureEngine?.(engine as any)

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]

		expect(await shortcutEntry.value(['i-mdi:alert', 'mdi:alert', 'auto']))
			.toEqual({})
		expect(mockLoadNodeIcon)
			.not.toHaveBeenCalled()
		expect(mockFetch)
			.toHaveBeenCalledWith('https://cdn.example.com/icons/mdi.json')
		expect(warn)
			.toHaveBeenCalledWith('failed to load icon "i-mdi:alert"')
	})

	it('warns when CDN payloads cannot be validated into an icon set', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()
		const warn = vi.fn()
		const plugin = icons()

		log.setWarnFn((_prefix, ...args) => warn(...args))
		mockStringToIcon.mockReturnValue({ prefix: 'mdi', name: 'alert' })
		mockLoadIcon.mockResolvedValue(null)
		mockLoadNodeIcon.mockResolvedValue(null)
		mockFetch.mockResolvedValue({ prefix: 'mdi' })
		mockQuicklyValidateIconSet.mockReturnValue(null)

		await plugin.configureRawConfig?.({
			icons: {
				cdn: 'https://cdn.example.com/icons',
			},
		} as any)
		await plugin.configureEngine?.(engine as any)

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]

		expect(await shortcutEntry.value(['i-mdi:alert', 'mdi:alert', 'auto']))
			.toEqual({})
		expect(mockFetch)
			.toHaveBeenCalledWith('https://cdn.example.com/icons/mdi.json')
		expect(warn)
			.toHaveBeenCalledWith('failed to load icon "i-mdi:alert"')
	})

	it('warns when icon names are invalid or the icon cannot be loaded from any source', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()
		const warn = vi.fn()
		const plugin = icons()

		log.setWarnFn((_prefix, ...args) => warn(...args))

		await plugin.configureRawConfig?.({ icons: {} } as any)
		await plugin.configureEngine?.(engine as any)

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]

		mockStringToIcon.mockReturnValueOnce(null)
		expect(await shortcutEntry.value(['i-invalid', 'invalid', 'auto']))
			.toEqual({})

		mockStringToIcon.mockReturnValueOnce({ prefix: 'mdi', name: 'ghost' })
		mockLoadIcon.mockResolvedValueOnce(null)
		mockLoadNodeIcon.mockResolvedValueOnce(null)
		expect(await shortcutEntry.value(['i-mdi:ghost', 'mdi:ghost', 'auto']))
			.toEqual({})

		expect(warn.mock.calls)
			.toEqual(expect.arrayContaining([
				['invalid icon name "i-invalid"'],
				['failed to load icon "i-mdi:ghost"'],
			]))
	})

	it('reuses cached CDN collections across multiple icon resolutions and falls back when search returns null', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()
		const warn = vi.fn()
		const plugin = icons()

		log.setWarnFn((_prefix, ...args) => warn(...args))
		mockLoadIcon.mockResolvedValue(null)
		mockLoadNodeIcon.mockResolvedValue(null)
		mockFetch.mockResolvedValue({ prefix: 'mdi' })
		mockQuicklyValidateIconSet.mockReturnValue({ prefix: 'mdi' })

		// First icon resolves, second does not
		mockStringToIcon
			.mockReturnValueOnce({ prefix: 'mdi', name: 'bell' })
			.mockReturnValueOnce({ prefix: 'mdi', name: 'missing' })
		mockSearchForIcon
			.mockResolvedValueOnce('<svg><circle /></svg>')
			.mockResolvedValueOnce(null)

		await plugin.configureRawConfig?.({
			icons: {
				cdn: 'https://cdn.example.com/{collection}.json',
			},
		} as any)
		await plugin.configureEngine?.(engine as any)

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]

		// First call: cache miss — fetches from CDN
		const style1 = await shortcutEntry.value(['i-mdi:bell', 'mdi:bell', 'auto'])
		expect(style1)
			.toMatchObject({ background: 'var(--svg-icon) no-repeat' })

		// Second call: cache hit — reuses CDN collection, but icon not found
		const style2 = await shortcutEntry.value(['i-mdi:missing', 'mdi:missing', 'auto'])
		expect(style2)
			.toEqual({})

		// CDN was fetched only once (cache hit on second call)
		expect(mockFetch)
			.toHaveBeenCalledTimes(1)
		expect(warn)
			.toHaveBeenCalledWith('failed to load icon "i-mdi:missing"')
	})

	it('falls back to empty config when icons is not specified in configureRawConfig', async () => {
		const { icons } = await import('./index')
		const engine = createEngine()
		const plugin = icons()

		await plugin.configureRawConfig?.({} as any)
		await plugin.configureEngine?.(engine as any)

		const shortcutEntry = engine.shortcuts.add.mock.calls[0]![0]
		expect(shortcutEntry)
			.toBeDefined()
	})
})
