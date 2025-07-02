import { describe, expect, it } from 'vitest'
import { createEngine } from '../../../../src/internal/engine'

describe('plugin-variables', () => {
	it('should define and render basic CSS variables', async () => {
		const engine = await createEngine({
			variables: {
				variables: {
					'--color-primary': 'blue',
					'--font-size': '16px',
				},
			},
		})
		await engine.use({ color: 'var(--color-primary)', fontSize: 'var(--font-size)' })
		const css = await engine.renderPreflights(false)
		expect(css).toContain(':root{--color-primary:blue;--font-size:16px;}')
	})

	it('should handle nested variable definitions', async () => {
		const engine = await createEngine({
			variables: {
				variables: {
					'.dark': {
						'--color-bg': 'black',
					},
					'.light': {
						'--color-bg': 'white',
					},
				},
			},
		})
		await engine.use({ dark: { backgroundColor: 'var(--color-bg)' } })
		const css = await engine.renderPreflights(false)
		expect(css).toContain('.dark{--color-bg:black;}')
		expect(css).toContain('.light{--color-bg:white;}')
	})

	it('should prune unused variables by default', async () => {
		const engine = await createEngine({
			variables: {
				variables: {
					'--unused-var': 'value',
				},
			},
		})
		const css = await engine.renderPreflights(false)
		expect(css).not.toContain('--unused-var')
	})

	it('should not prune variables in safeList', async () => {
		const engine = await createEngine({
			variables: {
				variables: {
					'--safe-var': 'safe-value',
				},
				safeList: ['--safe-var'],
			},
		})
		const css = await engine.renderPreflights(false)
		expect(css).toContain('--safe-var:safe-value')
	})

	it('should not prune variables when pruneUnused is false', async () => {
		const engine = await createEngine({
			variables: {
				variables: {
					'--unpruned-var': 'unpruned-value',
				},
				pruneUnused: false,
			},
		})
		const css = await engine.renderPreflights(false)
		expect(css).toContain('--unpruned-var:unpruned-value')
	})

	it('should add autocomplete suggestions for variables', async () => {
		const engine = await createEngine({
			variables: {
				variables: {
					'--my-var': {
						value: '10px',
						autocomplete: {
							asValueOf: ['padding', 'margin'],
							asProperty: true,
						},
					},
				},
			},
		})
		expect(engine.config.autocomplete.cssProperties.get('padding')).toContain('var(--my-var)')
		expect(engine.config.autocomplete.cssProperties.get('margin')).toContain('var(--my-var)')
		expect(engine.config.autocomplete.extraCssProperties).toContain('--my-var')
	})
})
