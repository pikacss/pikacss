import { describe, expect, it } from 'vitest'
import { createFnConfig } from '../fnConfig'
import { dialectForExtension, jsProcessor } from './js'

const options = { fnConfig: createFnConfig('pika') }

describe('dialectForExtension', () => {
	it('maps extensions to dialects with js fallback', () => {
		expect(dialectForExtension('ts'))
			.toBe('ts')
		expect(dialectForExtension('mts'))
			.toBe('ts')
		expect(dialectForExtension('cts'))
			.toBe('ts')
		expect(dialectForExtension('tsx'))
			.toBe('tsx')
		expect(dialectForExtension('jsx'))
			.toBe('jsx')
		expect(dialectForExtension('js'))
			.toBe('js')
		expect(dialectForExtension('mjs'))
			.toBe('js')
		expect(dialectForExtension('cjs'))
			.toBe('js')
		expect(dialectForExtension('unknown'))
			.toBe('js')
	})
})

describe('jsProcessor', () => {
	it('analyzes by extension-derived dialect', async () => {
		const ts = await jsProcessor.analyze('const a = <string>v; pika(\'x\')', '/repo/src/mod.ts', options)
		expect(ts.calls)
			.toHaveLength(1)

		const tsx = await jsProcessor.analyze('const a = <div className={pika(\'x\')} />', '/repo/src/App.tsx', options)
		expect(tsx.calls)
			.toHaveLength(1)
	})

	it('returns id and code untouched with single-quote literals', async () => {
		const code = 'pika({ color: \'red\' })'
		const result = await jsProcessor.analyze(code, '/repo/src/mod.js', options)
		expect(result.id)
			.toBe('/repo/src/mod.js')
		expect(result.code)
			.toBe(code)
		expect(result.calls[0]!.quote)
			.toBe('\'')
	})
})
