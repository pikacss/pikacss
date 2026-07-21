import { log as coreLog } from '@pikacss/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { consoleDiagnosticHandler, log } from './log'

afterEach(() => {
	log.setWarnFn(console.warn.bind(console))
	log.setErrorFn(console.error.bind(console))
})

describe('console diagnostic adapter', () => {
	it('reuses the core logger singleton', () => {
		expect(log)
			.toBe(coreLog)
	})

	it('routes warnings without a cause to the warning sink', () => {
		const warn = vi.fn()
		log.setWarnFn(warn)

		consoleDiagnosticHandler({
			level: 'warning',
			code: 'test-warning',
			message: 'warning message',
		})

		expect(warn)
			.toHaveBeenCalledWith('[PikaCSS][WARN]', '[test-warning] warning message')
	})

	it('routes errors and their cause to the error sink', () => {
		const error = vi.fn()
		const cause = new Error('failure')
		log.setErrorFn(error)

		consoleDiagnosticHandler({
			level: 'error',
			code: 'test-error',
			message: 'error message',
			cause,
		})

		expect(error)
			.toHaveBeenCalledWith('[PikaCSS][ERROR]', '[test-error] error message', cause)
	})
})
