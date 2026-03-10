import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import { createEngine, log } from '@pikacss/core'
import { $fetch } from 'ofetch'
import { join, resolve } from 'pathe'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { icons } from './index'

vi.mock('ofetch', () => ({
	$fetch: vi.fn(),
}))

const docsWorkspace = resolve(__dirname, '../../../docs')

async function createIconsEngine(config: Parameters<typeof createEngine>[0] = {}) {
	return createEngine({
		...config,
		plugins: [icons()],
	})
}

async function withEnv<T>(
	env: Partial<Record<'VSCODE_PID' | 'ESLINT', string | undefined>>,
	run: () => Promise<T>,
) {
	const previous = {
		VSCODE_PID: process.env.VSCODE_PID,
		ESLINT: process.env.ESLINT,
	}

	for (const [key, value] of Object.entries(env)) {
		if (value == null)
			delete process.env[key]
		else
			process.env[key] = value
	}

	try {
		return await run()
	}
	finally {
		for (const [key, value] of Object.entries(previous)) {
			if (value == null)
				delete process.env[key]
			else
				process.env[key] = value
		}
	}
}

const mockedFetch = vi.mocked($fetch)

describe('icons plugin', () => {
	beforeEach(() => {
		mockedFetch.mockReset()
		log.setWarnFn(console.warn)
	})

	it('should return a plugin object', () => {
		const plugin = icons()
		expect(plugin)
			.toBeDefined()
		expect(plugin.name)
			.toBe('icons')
	})

	it('should resolve a custom collection icon in mask mode by default', async () => {
		const engine = await createIconsEngine({
			icons: {
				collections: {
					custom: {
						logo: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>',
					},
				},
			},
		})

		const ids = await engine.use('i-custom:logo')
		const css = await engine.renderAtomicStyles(false, { atomicStyleIds: ids })

		expect(ids.length)
			.toBeGreaterThan(0)
		expect(engine.variables.store.has('--pk-svg-icon-custom-logo'))
			.toBe(true)
		expect(css)
			.toContain('-webkit-mask:var(--svg-icon) no-repeat')
		expect(css)
			.toContain('background-color:currentColor')
	})

	it('should render background mode for multi-color icons', async () => {
		const engine = await createIconsEngine({
			icons: {
				collections: {
					custom: {
						palette: '<svg viewBox="0 0 24 24"><path fill="#f00" d="M0 0h24v24H0z"/></svg>',
					},
				},
			},
		})

		const ids = await engine.use('i-custom:palette')
		const css = await engine.renderAtomicStyles(false, { atomicStyleIds: ids })

		expect(css)
			.toContain('background:var(--svg-icon) no-repeat')
		expect(css)
			.toContain('background-color:transparent')
	})

	it('should cache the generated SVG variable for repeated usage', async () => {
		const engine = await createIconsEngine({
			icons: {
				collections: {
					custom: {
						logo: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>',
					},
				},
			},
		})

		await engine.use('i-custom:logo')
		const countAfterFirstUse = engine.variables.store.size
		await engine.use('i-custom:logo')

		expect(engine.variables.store.size)
			.toBe(countAfterFirstUse)
	})

	it('should expose processor metadata and allow mutating the generated style', async () => {
		let source = ''
		const engine = await createIconsEngine({
			icons: {
				collections: {
					custom: {
						logo: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>',
					},
				},
				processor(styleItem, meta) {
					source = meta.source
					if (typeof styleItem !== 'string') {
						styleItem.display = 'inline-block'
					}
				},
			},
		})

		const ids = await engine.use('i-custom:logo')
		const css = await engine.renderAtomicStyles(false, { atomicStyleIds: ids })

		expect(source)
			.toBe('custom')
		expect(css)
			.toContain('display:inline-block')
	})

	it('should prefer custom collections over local packages', async () => {
		let source = ''
		const engine = await createIconsEngine({
			icons: {
				cwd: docsWorkspace,
				collections: {
					mdi: {
						home: '<svg viewBox="0 0 24 24"><path fill="#123456" d="M0 0h24v24H0z"/></svg>',
					},
				},
				processor(_styleItem, meta) {
					source = meta.source
				},
			},
		})

		const ids = await engine.use('i-mdi:home')

		expect(ids.length)
			.toBeGreaterThan(0)
		expect(source)
			.toBe('custom')
	})

	it('should resolve installed local Iconify packages before falling back to CDN', async () => {
		await withEnv({ VSCODE_PID: undefined, ESLINT: undefined }, async () => {
			let source = ''
			const engine = await createIconsEngine({
				icons: {
					cwd: docsWorkspace,
					cdn: 'https://cdn.example/icons',
					processor(_styleItem, meta) {
						source = meta.source
					},
				},
			})

			const ids = await engine.use('i-mdi:home')

			expect(ids.length)
				.toBeGreaterThan(0)
			expect(source)
				.toBe('local')
			expect(mockedFetch)
				.not.toHaveBeenCalled()
		})
	})

	it('should resolve icons from a user-provided SVG directory', async () => {
		const svgDir = await fs.mkdtemp(join(tmpdir(), 'pikacss-plugin-icons-'))

		try {
			await fs.writeFile(
				join(svgDir, 'logo.svg'),
				'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>',
				'utf8',
			)

			let source = ''
			const engine = await createIconsEngine({
				icons: {
					collections: {
						custom: FileSystemIconLoader(svgDir),
					},
					processor(_styleItem, meta) {
						source = meta.source
					},
				},
			})

			const ids = await engine.use('i-custom:logo')
			const css = await engine.renderAtomicStyles(false, { atomicStyleIds: ids })

			expect(ids.length)
				.toBeGreaterThan(0)
			expect(source)
				.toBe('custom')
			expect(css)
				.toContain('-webkit-mask:var(--svg-icon) no-repeat')
		}
		finally {
			await fs.rm(svgDir, { recursive: true, force: true })
		}
	})

	it('should fall back to CDN collections when the icon is not available locally', async () => {
		let source = ''
		mockedFetch.mockResolvedValue({
			prefix: 'remote',
			icons: {
				logo: {
					body: '<path fill="currentColor" d="M0 0h24v24H0z"/>',
					width: 24,
					height: 24,
				},
			},
		})

		const engine = await createIconsEngine({
			icons: {
				cdn: 'https://cdn.example/icons',
				processor(_styleItem, meta) {
					source = meta.source
				},
			},
		})

		const ids = await engine.use('i-remote:logo')

		expect(ids.length)
			.toBeGreaterThan(0)
		expect(source)
			.toBe('cdn')
		expect(mockedFetch)
			.toHaveBeenCalledWith('https://cdn.example/icons/remote.json')
	})

	it('should warn when an icon cannot be resolved', async () => {
		const warnings: string[] = []
		log.setWarnFn((prefix, ...args) => {
			warnings.push([prefix, ...args].join(' '))
		})

		const engine = await createIconsEngine({
			icons: {
				collections: {
					custom: {},
				},
			},
		})

		const ids = await engine.use('i-custom:missing')

		expect(ids)
			.toHaveLength(0)
		expect(warnings.some(message => message.includes('failed to load icon "i-custom:missing"')))
			.toBe(true)
	})
})
