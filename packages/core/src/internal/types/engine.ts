import type { EnginePlugin } from '../plugin'
import type { ResolvedAutocompleteConfig } from './autocomplete'
import type { Preflight, ResolvedPreflight } from './preflight'

// #region EngineConfig
export interface EngineConfig {
	/**
	 * Register plugins to extend PikaCSS functionality.
	 *
	 * @example
	 * ```ts
	 * {
	 *   plugins: [
	 *     icons(), // Add icon support
	 *     customPlugin() // Custom plugin
	 *   ]
	 * }
	 * ```
	 */
	plugins?: EnginePlugin[]

	/**
	 * Set the prefix for generated atomic style id.
	 *
	 * @default 'pk-'
	 * @example
	 * ```ts
	 * {
	 *   prefix: 'pk-' // Generated atomic id will be 'pk-xxx'
	 * }
	 * ```
	 */
	prefix?: string

	/**
	 * Set the default selector format. '%' will be replaced with the atomic style id.
	 *
	 * @default '.%'
	 * @example
	 * ```ts
	 * {
	 *   defaultSelector: '.%' // Use with class attribute: <div class="a b c">
	 *   // or
	 *   defaultSelector: '[data-pika~="%"]' // Use with attribute selector: <div data-pika="a b c">
	 * }
	 * ```
	 */
	defaultSelector?: string

	/**
	 * Define global CSS styles that will be injected before atomic styles.
	 * Can be used for CSS variables, global animations, base styles, etc.
	 *
	 * @default []
	 * @example
	 * ```ts
	 * {
	 *   preflights: [
	 *     // Use CSS string directly
	 *     ':root { --color: blue }',
	 *     // Or use function to generate dynamically
	 *     (engine) => ':root { --theme: dark }'
	 *   ]
	 * }
	 * ```
	 */
	preflights?: Preflight[]

	/**
	 * Configure CSS @layer order. Keys are layer names, values are order numbers (lower = earlier).
	 * Merged on top of the default layers `{ preflights: 1, utilities: 10 }`, so any keys not
	 * specified here will keep their default order values.
	 *
	 * @default { preflights: 1, utilities: 10 }
	 * @example
	 * ```ts
	 * {
	 *   layers: { base: 0, components: 5, utilities: 10 }
	 * }
	 * ```
	 */
	layers?: Record<string, number>

	/**
	 * The layer name that unlayered preflights are automatically wrapped into.
	 *
	 * @default 'preflights'
	 */
	defaultPreflightsLayer?: string

	/**
	 * The layer name that atomic styles without an explicit `__layer` are placed into.
	 *
	 * @default 'utilities'
	 */
	defaultUtilitiesLayer?: string
}
// #endregion EngineConfig

export interface ResolvedEngineConfig {
	rawConfig: EngineConfig
	prefix: string
	defaultSelector: string
	plugins: EnginePlugin[]
	preflights: ResolvedPreflight[]
	autocomplete: ResolvedAutocompleteConfig
	/** Always contains at least the default layers (`preflights` and `utilities`). */
	layers: Record<string, number>
	defaultPreflightsLayer: string
	defaultUtilitiesLayer: string
}
