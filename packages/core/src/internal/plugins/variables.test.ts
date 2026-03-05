import { describe, expect, it } from 'vitest'
import { createEngine } from '../engine'
import { extractUsedVarNames, extractUsedVarNamesFromPreflightResult, normalizeVariableName } from './variables'

describe('extractUsedVarNames', () => {
	it('should extract a single var name', () => {
		expect(extractUsedVarNames('var(--color)'))
			.toEqual(['--color'])
	})

	it('should extract multiple var names', () => {
		expect(extractUsedVarNames('var(--color) var(--bg)'))
			.toEqual(['--color', '--bg'])
	})

	it('should return empty array for no var() usage', () => {
		expect(extractUsedVarNames('red'))
			.toEqual([])
	})

	it('should return empty array for empty string', () => {
		expect(extractUsedVarNames(''))
			.toEqual([])
	})

	it('should handle var() with fallback values', () => {
		const result = extractUsedVarNames('var(--color, red)')
		expect(result)
			.toEqual(['--color'])
	})

	it('should handle nested var() references', () => {
		const result = extractUsedVarNames('var(--a, var(--b))')
		expect(result)
			.toEqual(['--a', '--b'])
	})

	it('should handle complex CSS values with var()', () => {
		const result = extractUsedVarNames('1px solid var(--border-color)')
		expect(result)
			.toEqual(['--border-color'])
	})

	it('should handle var names with hyphens', () => {
		expect(extractUsedVarNames('var(--my-long-variable-name)'))
			.toEqual(['--my-long-variable-name'])
	})
})

describe('normalizeVariableName', () => {
	it('should return name as-is if it starts with --', () => {
		expect(normalizeVariableName('--color'))
			.toBe('--color')
	})

	it('should prepend -- if missing', () => {
		expect(normalizeVariableName('color'))
			.toBe('--color')
	})

	it('should handle empty string', () => {
		expect(normalizeVariableName(''))
			.toBe('--')
	})

	it('should handle names already with --', () => {
		expect(normalizeVariableName('--my-var'))
			.toBe('--my-var')
	})
})

describe('variables plugin (engine integration)', () => {
	describe('basic variable definition', () => {
		it('should render variables in preflight', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--color': '#fff',
						'--bg': '#000',
					},
					pruneUnused: false,
				},
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--color: #fff;')
			expect(preflight)
				.toContain('--bg: #000;')
		})

		it('should place variables under :root by default', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--color': '#fff',
					},
					pruneUnused: false,
				},
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain(':root')
			expect(preflight)
				.toContain('--color: #fff;')
		})
	})

	describe('pruneUnused', () => {
		it('should prune unused variables by default (pruneUnused: true)', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--unused-color': '#fff',
					},
				},
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight).not.toContain('--unused-color')
		})

		it('should keep variables when pruneUnused is false', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--always-present': 'blue',
					},
					pruneUnused: false,
				},
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--always-present: blue;')
		})

		it('should keep used variables when pruneUnused is true', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--text-color': '#333',
					},
					pruneUnused: true,
				},
			})

			await engine.use({ color: 'var(--text-color)' })

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--text-color: #333;')
		})

		it('should keep transitively referenced variables when pruneUnused is true', async () => {
			// atomic styles use --primary, which references --base; --base should not be pruned
			const engine = await createEngine({
				variables: {
					variables: {
						'--base': '#3498db',
						'--primary': 'var(--base)',
					},
					pruneUnused: true,
				},
			})

			await engine.use({ color: 'var(--primary)' })

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--primary: var(--base);')
			expect(preflight)
				.toContain('--base: #3498db;')
		})

		it('should handle multi-level transitive variable references', async () => {
			// A → B → C chain: using A should keep B and C
			const engine = await createEngine({
				variables: {
					variables: {
						'--c': '#fff',
						'--b': 'var(--c)',
						'--a': 'var(--b)',
						'--unrelated': 'red',
					},
					pruneUnused: true,
				},
			})

			await engine.use({ color: 'var(--a)' })

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--a: var(--b);')
			expect(preflight)
				.toContain('--b: var(--c);')
			expect(preflight)
				.toContain('--c: #fff;')
			expect(preflight).not.toContain('--unrelated')
		})

		it('should keep variables referenced by other preflights (string format)', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--brand': 'hotpink',
						'--unused': 'gray',
					},
					pruneUnused: true,
				},
				preflights: [
					'body { background: var(--brand); }',
				],
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--brand: hotpink;')
			expect(preflight).not.toContain('--unused')
		})

		it('should keep variables referenced by other preflights (PreflightDefinition format)', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--spacing': '8px',
						'--unused': 'none',
					},
					pruneUnused: true,
				},
				preflights: [
					{ '.container': { padding: 'var(--spacing)' } },
				],
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--spacing: 8px;')
			expect(preflight).not.toContain('--unused')
		})

		it('should keep transitively referenced vars from other preflights', async () => {
			// Another preflight uses --alias, --alias references --base; --base should be kept
			const engine = await createEngine({
				variables: {
					variables: {
						'--base': '#000',
						'--alias': 'var(--base)',
						'--unused': 'red',
					},
					pruneUnused: true,
				},
				preflights: [
					'html { color: var(--alias); }',
				],
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--alias: var(--base);')
			expect(preflight)
				.toContain('--base: #000;')
			expect(preflight).not.toContain('--unused')
		})
	})

	describe('nested selectors', () => {
		it('should place variables under nested selectors', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--color': '#fff',
						'[data-theme="dark"]': {
							'--color': '#000',
						},
					},
					pruneUnused: false,
				},
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain(':root')
			expect(preflight)
				.toContain('--color: #fff;')
			expect(preflight)
				.toContain('[data-theme="dark"]')
			expect(preflight)
				.toContain('--color: #000;')
		})
	})

	describe('null-value variables (autocomplete only)', () => {
		it('should not render variables with null values', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--external-var': null,
					},
					pruneUnused: false,
				},
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight).not.toContain('--external-var')
		})
	})

	describe('safeList', () => {
		it('should keep safeList variables even when pruneUnused is true', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--safe-var': 'green',
						'--unsafe-var': 'red',
					},
					pruneUnused: true,
					safeList: ['--safe-var'],
				},
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--safe-var: green;')
			expect(preflight).not.toContain('--unsafe-var')
		})
	})

	describe('variable object format', () => {
		it('should support variable object with pruneUnused override', async () => {
			const engine = await createEngine({
				variables: {
					variables: {
						'--always': {
							value: 'red',
							pruneUnused: false,
						},
					},
					pruneUnused: true,
				},
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--always: red;')
		})
	})

	describe('dynamic add via engine.variables.add', () => {
		it('should allow adding variables dynamically', async () => {
			const engine = await createEngine({
				variables: {
					variables: {},
					pruneUnused: false,
				},
			})

			engine.variables.add({
				'--dynamic-var': 'purple',
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--dynamic-var: purple;')
		})
	})

	describe('array variables config', () => {
		it('should accept array of variable definitions', async () => {
			const engine = await createEngine({
				variables: {
					variables: [
						{ '--a': 'one' },
						{ '--b': 'two' },
					],
					pruneUnused: false,
				},
			})

			const preflight = await engine.renderPreflights(true)
			expect(preflight)
				.toContain('--a: one;')
			expect(preflight)
				.toContain('--b: two;')
		})
	})
})

describe('extractUsedVarNamesFromPreflightResult', () => {
	it('should extract var names from a plain CSS string', () => {
		const result = extractUsedVarNamesFromPreflightResult('color: var(--text); background: var(--bg);')
		expect(result)
			.toEqual(['--text', '--bg'])
	})

	it('should return an empty array for a CSS string without var()', () => {
		expect(extractUsedVarNamesFromPreflightResult('color: red;'))
			.toEqual([])
	})

	it('should return an empty array for an empty string', () => {
		expect(extractUsedVarNamesFromPreflightResult(''))
			.toEqual([])
	})

	it('should extract var names from a PreflightDefinition object (string CSS values)', () => {
		const result = extractUsedVarNamesFromPreflightResult({
			':root': { color: 'var(--text-color)' },
		})
		expect(result)
			.toContain('--text-color')
	})

	it('should recursively extract from nested PreflightDefinition objects', () => {
		const result = extractUsedVarNamesFromPreflightResult({
			':root': {
				'.child': { border: 'var(--border-color)' },
			},
		})
		expect(result)
			.toContain('--border-color')
	})

	it('should handle an empty PreflightDefinition object', () => {
		expect(extractUsedVarNamesFromPreflightResult({}))
			.toEqual([])
	})

	it('should extract multiple var names from a PreflightDefinition with multiple properties', () => {
		const result = extractUsedVarNamesFromPreflightResult({
			':root': {
				color: 'var(--fg)',
				background: 'var(--bg)',
			},
		})
		expect(result)
			.toContain('--fg')
		expect(result)
			.toContain('--bg')
	})

	it('should return normalized (--prefixed) var names from a string', () => {
		// var() always includes --, so names should already start with --
		const result = extractUsedVarNamesFromPreflightResult('border: 1px solid var(--border-color);')
		expect(result)
			.toEqual(['--border-color'])
	})
})
