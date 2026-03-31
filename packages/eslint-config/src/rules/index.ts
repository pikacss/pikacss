import noDynamicArgs from './no-dynamic-args'

/**
 * Registry of all PikaCSS ESLint rules keyed by short rule name.
 * @internal
 *
 * @remarks
 * Each entry maps a rule name (e.g. `'no-dynamic-args'`) to its
 * `RuleModule` implementation. The registry is consumed by the exported
 * plugin object and should not be used directly.
 *
 * @example
 * ```ts
 * rules['no-dynamic-args'] // RuleModule
 * ```
 */
export const rules = {
	'no-dynamic-args': noDynamicArgs,
}
