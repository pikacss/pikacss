import { createEngine } from '@pikacss/core'
import { describe, expect, it } from 'vitest'
import { typography } from './index'

async function createTypographyEngine(config: Parameters<typeof createEngine>[0] = {}) {
	return createEngine({
		...config,
		plugins: [typography()],
	})
}

async function expectShortcutToResolve(shortcut: string) {
	const engine = await createTypographyEngine()
	const ids = await engine.use(shortcut)
	expect(ids.length)
		.toBeGreaterThan(0)
	for (const id of ids) {
		expect(engine.store.atomicStyles.has(id))
			.toBe(true)
	}
	return engine
}

describe('typography plugin', () => {
	it('should have plugin name "typography"', () => {
		const plugin = typography()
		expect(plugin.name)
			.toBe('typography')
	})

	it('should add typography variables to the engine variables store', async () => {
		const engine = await createTypographyEngine()
		const variableNames = [...engine.variables.store.keys()]
		expect(variableNames)
			.toContain('--pk-prose-color-body')
		expect(variableNames)
			.toContain('--pk-prose-color-headings')
		expect(variableNames)
			.toContain('--pk-prose-color-links')
		expect(variableNames)
			.toContain('--pk-prose-color-code')
		expect(variableNames)
			.toContain('--pk-prose-kbd-shadows')
	})

	it('should register prose-base shortcut', async () => {
		const engine = await expectShortcutToResolve('prose-base')
		// prose-base should be resolved (no unknown strings)
		const atomicStyleIds = [...engine.store.atomicStyles.keys()]
		expect(atomicStyleIds.length)
			.toBeGreaterThan(0)
	})

	;['prose-paragraphs', 'prose-links', 'prose'].forEach((shortcut) => {
		it(`should register ${shortcut} shortcut`, async () => {
			await expectShortcutToResolve(shortcut)
		})
	})

	;[
		['prose-sm', '0.875rem'],
		['prose-lg', '1.125rem'],
		['prose-xl', '1.25rem'],
		['prose-2xl', '1.5rem'],
	].forEach(([shortcut, expectedFontSize]) => {
		it(`should register ${shortcut} size variant`, async () => {
			const engine = await expectShortcutToResolve(shortcut!)
			const css = await engine.renderAtomicStyles(false)
			expect(css)
				.toContain(expectedFontSize)
		})
	})

	it('should allow custom variables to override defaults', async () => {
		const engine = await createTypographyEngine({
			typography: {
				variables: {
					'--pk-prose-color-body': '#333',
				},
			},
		})
		const resolved = engine.variables.store.get('--pk-prose-color-body')
		expect(resolved)
			.toBeDefined()
		// The last resolved value should be the overridden one
		const lastValue = resolved![resolved!.length - 1]
		expect(lastValue!.value)
			.toBe('#333')
	})
})
