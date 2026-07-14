import { describe, expect, it } from 'vitest'
import { createFnConfig } from '../fnConfig'
import { analyzeJs } from './analyze'
import { PikaTransformError } from './errors'

const fnConfig = createFnConfig('pika')

describe('analyzeJs', () => {
	it('returns calls sorted by offset with evaluated args and ranges', () => {
		const code = 'const b = pika.str({ color: \'blue\' })\nconst a = pika(\'bg:red\', \'c:white\')'
		const calls = analyzeJs(code, '/repo/src/mod.ts', 'ts', fnConfig)

		expect(calls)
			.toHaveLength(2)
		expect(calls[0]!.variant.name)
			.toBe('pika.str')
		expect(code.slice(calls[0]!.start, calls[0]!.end))
			.toBe('pika.str({ color: \'blue\' })')
		expect(calls[0]!.args)
			.toEqual([{ color: 'blue' }])
		expect(calls[1]!.variant.name)
			.toBe('pika')
		expect(code.slice(calls[1]!.start, calls[1]!.end))
			.toBe('pika(\'bg:red\', \'c:white\')')
		expect(calls[1]!.args)
			.toEqual(['bg:red', 'c:white'])
		expect(calls[1]!.loc)
			.toEqual({ line: 2, column: 10 })
	})

	it('defaults quote to single and honors an override', () => {
		expect(analyzeJs('pika(\'a\')', '/m.ts', 'ts', fnConfig)[0]!.quote)
			.toBe('\'')
		expect(analyzeJs('pika(\'a\')', '/m.ts', 'ts', fnConfig, { quote: '"' })[0]!.quote)
			.toBe('"')
	})

	it('spreads static arrays at the call level', () => {
		const calls = analyzeJs('pika(...[\'a\', \'b\'], \'c\')', '/m.ts', 'ts', fnConfig)
		expect(calls[0]!.args)
			.toEqual(['a', 'b', 'c'])
	})

	it('rejects call spread of a non-array value', () => {
		expect(() => analyzeJs('pika(...{ a: 1 })', '/m.ts', 'ts', fnConfig))
			.toThrow('call spread of a non-array value')
	})

	it('applies offsets so ranges are absolute into a surrounding file', () => {
		const chunk = 'const a = pika(\'x\')'
		const calls = analyzeJs(chunk, '/m.vue', 'ts', fnConfig, {
			offsets: { startIndex: 50, startLine: 4, startColumn: 0 },
		})
		expect(calls[0]!.start)
			.toBe(50 + chunk.indexOf('pika'))
		expect(calls[0]!.loc.line)
			.toBe(4)
	})

	it('wraps parse failures in PikaTransformError with stage and loc', () => {
		try {
			analyzeJs('const a = {', '/repo/src/broken.ts', 'ts', fnConfig)
			expect.unreachable()
		}
		catch (error: any) {
			expect(error)
				.toBeInstanceOf(PikaTransformError)
			expect(error.stage)
				.toBe('parse')
			expect(error.id)
				.toBe('/repo/src/broken.ts')
			expect(error.loc?.line)
				.toBe(1)
		}
	})

	it('fails the whole analysis when any call has a non-static argument', () => {
		const code = 'pika(\'ok\')\npika({ color: theme })'
		expect(() => analyzeJs(code, '/m.ts', 'ts', fnConfig))
			.toThrow(PikaTransformError)
	})

	it('uses call-site scope for global-constant shadowing in arguments', () => {
		const code = 'function f(undefined: any) { return pika({ a: undefined }) }'
		expect(() => analyzeJs(code, '/m.ts', 'ts', fnConfig))
			.toThrow('identifier "undefined" is not statically known')
		expect(analyzeJs('pika({ a: undefined })', '/m.ts', 'ts', fnConfig)[0]!.args)
			.toEqual([{ a: undefined }])
	})

	it('returns an empty list for sources without macro calls', () => {
		expect(analyzeJs('const a = 1', '/m.ts', 'ts', fnConfig))
			.toEqual([])
	})
})
