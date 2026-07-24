import type { TokenIR } from './ir'
import { describe, expect, it } from 'vitest'

import { resolveToken } from './resolve'

describe('resolveToken', () => {
	it('resolves literal values and inline aliases', () => {
		const ir: TokenIR = { path: ['border', 'default'], kind: { t: 'value', value: '1px solid {color.border}' } }
		expect(resolveToken(ir, ''))
			.toEqual({ name: '--border-default', value: '1px solid var(--color-border)', themeScope: undefined })
	})

	it('resolves internal aliases to the target variable name with prefix', () => {
		const ir: TokenIR = { path: ['color', 'accent'], kind: { t: 'aliasInternal', targetPath: ['color', 'primary'] } }
		expect(resolveToken(ir, 'app'))
			.toEqual({ name: '--app-color-accent', value: 'var(--app-color-primary)', themeScope: undefined })
	})

	it('resolves external aliases to the referenced css variable verbatim', () => {
		const ir: TokenIR = { path: ['color', 'bg'], kind: { t: 'aliasExternal', cssVar: '--external-bg' } }
		expect(resolveToken(ir, ''))
			.toEqual({ name: '--color-bg', value: 'var(--external-bg)', themeScope: undefined })
	})

	it('carries the theme scope through', () => {
		const ir: TokenIR = { path: ['color', 'bg'], kind: { t: 'value', value: '#000' }, themeScope: { selector: '.dark' } }
		expect(resolveToken(ir, ''))
			.toEqual({ name: '--color-bg', value: '#000', themeScope: { selector: '.dark' } })
	})
})
