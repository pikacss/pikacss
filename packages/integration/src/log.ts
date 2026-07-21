import type { DiagnosticHandler } from '@pikacss/core'
import { log as coreLog } from '@pikacss/core'

/** Console-backed logger used by Node.js build-tool integrations. */
export const log = coreLog

log.setDebugFn((prefix, ...args) => console.log(prefix, ...args))
log.setInfoFn((prefix, ...args) => console.log(prefix, ...args))
log.setWarnFn((prefix, ...args) => console.warn(prefix, ...args))
log.setErrorFn((prefix, ...args) => console.error(prefix, ...args))

/** Default diagnostic adapter used by official Node.js integrations. */
export const consoleDiagnosticHandler: DiagnosticHandler = (diagnostic) => {
	const message = `[${diagnostic.code}] ${diagnostic.message}`
	const args = diagnostic.cause == null ? [] : [diagnostic.cause]
	if (diagnostic.level === 'error')
		log.error(message, ...args)
	else
		log.warn(message, ...args)
}
