// #region example
import { createEngine, defineEngineConfig } from '@pikacss/core'

const engine = await createEngine(defineEngineConfig({}))
const atomicStyleIds = await engine.use({ color: 'red' })

const css = [
	engine.renderLayerOrderDeclaration(),
	await engine.renderPreflights(true),
	await engine.renderAtomicStyles(true, { atomicStyleIds }),
]
	.filter(Boolean)
	.join('\n\n')
// #endregion

export { css }