import { createEngine } from '@pikacss/core'
import { describe, expect, it } from 'vitest'

import { typography } from '../src'

describe('plugin-typography', () => {
	it('returns plugin definition', () => {
		const plugin = typography()
		expect(plugin.name)
			.toBe('typography')
	})

	it('should add prose shortcut and variables', async () => {
		const engine = await createEngine({
			plugins: [typography()],
		})

		const ids = await engine.use('prose')
		const css = await engine.renderAtomicStyles(true, { atomicStyleIds: ids })

		expect(css)
			.toContain('color: var(--pk-prose-color-body)')
		expect(css)
			.toContain('max-width: 65ch')

		const preflights = await engine.renderPreflights(true)
		expect(preflights)
			.toContain('--pk-prose-color-body: currentColor')
		expect(preflights)
			.toContain('--pk-prose-color-headings: currentColor')
	})

	it('should support size modifiers', async () => {
		const engine = await createEngine({
			plugins: [typography()],
		})

		const ids = await engine.use('prose-lg')
		const css = await engine.renderAtomicStyles(true, { atomicStyleIds: ids })

		expect(css)
			.toContain('font-size: 1.125rem')
		expect(css)
			.toContain('line-height: 1.77')
	})

	it('should support custom variables', async () => {
		const engine = await createEngine({
			plugins: [typography({
				variables: {
					'--pk-prose-color-body': '#333',
				},
			})],
		})

		await engine.use('prose')
		const preflights = await engine.renderPreflights(true)
		expect(preflights)
			.toContain('--pk-prose-color-body: #333')
	})

	it('should support modular prose shortcuts', async () => {
		const engine = await createEngine({
			plugins: [typography()],
		})

		// Test prose-base
		const baseIds = await engine.use('prose-base')
		const baseCss = await engine.renderAtomicStyles(true, { atomicStyleIds: baseIds })
		expect(baseCss)
			.toContain('color: var(--pk-prose-color-body)')
		expect(baseCss)
			.toContain('max-width: 65ch')

		// Test prose-headings
		const headingsIds = await engine.use('prose-headings')
		const headingsCss = await engine.renderAtomicStyles(true, { atomicStyleIds: headingsIds })
		expect(headingsCss)
			.toContain('font-size: 2.25em') // h1
		expect(headingsCss)
			.toContain('font-size: 1.5em') // h2

		// Test prose-lists
		const listsIds = await engine.use('prose-lists')
		const listsCss = await engine.renderAtomicStyles(true, { atomicStyleIds: listsIds })
		expect(listsCss)
			.toContain('list-style-type: decimal')
		expect(listsCss)
			.toContain('list-style-type: disc')

		// Test prose-code
		const codeIds = await engine.use('prose-code')
		const codeCss = await engine.renderAtomicStyles(true, { atomicStyleIds: codeIds })
		expect(codeCss)
			.toContain('var(--pk-prose-color-code)')

		// Test prose-tables
		const tablesIds = await engine.use('prose-tables')
		const tablesCss = await engine.renderAtomicStyles(true, { atomicStyleIds: tablesIds })
		expect(tablesCss)
			.toContain('table-layout: auto')
	})

	it('should allow combining modular shortcuts', async () => {
		const engine = await createEngine({
			plugins: [typography()],
		})

		// Combine only base + headings + paragraphs
		const baseIds = await engine.use('prose-base')
		const headingsIds = await engine.use('prose-headings')
		const paragraphsIds = await engine.use('prose-paragraphs')

		const allIds = [...baseIds, ...headingsIds, ...paragraphsIds]
		const css = await engine.renderAtomicStyles(true, { atomicStyleIds: allIds })

		expect(css)
			.toContain('max-width: 65ch') // from base
		expect(css)
			.toContain('font-size: 2.25em') // from headings
		expect(css)
			.toContain('margin-top: 1.25em') // from paragraphs
	})
})
