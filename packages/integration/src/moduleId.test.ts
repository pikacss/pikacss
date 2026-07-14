import { describe, expect, it } from 'vitest'
import { parseModuleId } from './moduleId'

describe('parseModuleId', () => {
	it('normalizes an absolute id without query', () => {
		expect(parseModuleId('/repo/src/App.tsx', '/repo'))
			.toEqual({ file: '/repo/src/App.tsx', query: null, ext: 'tsx' })
	})

	it('resolves relative ids against cwd', () => {
		expect(parseModuleId('src/main.ts', '/repo'))
			.toEqual({ file: '/repo/src/main.ts', query: null, ext: 'ts' })
	})

	it('splits query and keeps it without the leading question mark', () => {
		expect(parseModuleId('/repo/src/App.vue?vue&type=script&lang.ts', '/repo'))
			.toEqual({ file: '/repo/src/App.vue', query: 'vue&type=script&lang.ts', ext: 'vue' })
	})

	it('strips hash suffixes with and without a query', () => {
		expect(parseModuleId('/repo/src/App.vue#frag', '/repo'))
			.toEqual({ file: '/repo/src/App.vue', query: null, ext: 'vue' })
		expect(parseModuleId('/repo/src/App.vue?raw#frag', '/repo'))
			.toEqual({ file: '/repo/src/App.vue', query: 'raw', ext: 'vue' })
	})

	it('lowercases the extension', () => {
		expect(parseModuleId('/repo/src/App.VUE', '/repo').ext)
			.toBe('vue')
	})

	it('returns an empty extension for extensionless and dot-prefixed files', () => {
		expect(parseModuleId('/repo/Makefile', '/repo').ext)
			.toBe('')
		expect(parseModuleId('/repo/.gitignore', '/repo').ext)
			.toBe('')
	})

	it('normalizes backslashes and dot segments', () => {
		expect(parseModuleId('src\\..\\src\\main.ts', 'C:\\repo').file)
			.toBe('C:/repo/src/main.ts')
		expect(parseModuleId('/repo/src/../src/main.ts', '/repo').file)
			.toBe('/repo/src/main.ts')
	})
})
