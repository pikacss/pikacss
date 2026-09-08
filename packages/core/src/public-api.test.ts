import type { ImportantConfig, KeyframesConfig, SelectorsConfig, ShortcutsConfig, VariablesConfig } from './index'
import { describe, expect, expectTypeOf, it } from 'vitest'
import * as api from './index'

// Keep negative public-surface checks away from the import block so auto-sorting imports cannot detach the directives.
// @ts-expect-error Internal plugin implementation functions are not public root type exports.
type InternalImportantMustStayPrivate = import('./index').important
// @ts-expect-error Internal variables helpers are not public root type exports.
type InternalVariableHelperMustStayPrivate = import('./index').normalizeVariableName

// Locks the published runtime export surface of the package's main entry.
// Any added/removed export is a deliberate, reviewed change (a SemVer event
// once 1.0 ships) rather than an accidental leak. Update the list intentionally
// when the public API changes.
type PrivateSurfaceRegression = [InternalImportantMustStayPrivate, InternalVariableHelperMustStayPrivate]

describe('@pikacss/core public API surface', () => {
	it('keeps internal built-in plugin implementation types private', () => {
		expectTypeOf<PrivateSurfaceRegression>()
			.toBeArray()
	})
	it('exports the intended built-in plugin authoring types without leaking implementation helpers', () => {
		expectTypeOf<ImportantConfig>()
			.toBeObject()
		expectTypeOf<KeyframesConfig>()
			.toBeObject()
		expectTypeOf<SelectorsConfig>()
			.toBeObject()
		expectTypeOf<ShortcutsConfig>()
			.toBeObject()
		expectTypeOf<VariablesConfig>()
			.toBeObject()
	})

	it('exports exactly the intended runtime members', () => {
		expect(Object.keys(api)
			.sort())
			.toEqual([
				'createEngine',
				'createLogger',
				'defineEngineConfig',
				'defineEnginePlugin',
				'escapeRegExp',
				'isPlainObjectRecord',
				'log',
				'renderCSSStyleBlocks',
				'renderTypegenDocument',
				'renderTypegenJSDoc',
				'sortLayerNames',
			])
	})
})
