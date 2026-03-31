import type { Arrayable, UnionString } from './utils'

/**
 * Extracts the string keys of `T`, returning `never` when `T` itself is `never`.
 * @internal
 *
 * @typeParam T - The type whose string keys to extract.
 *
 * @remarks Wraps `T` in a tuple to prevent distributive collapse on `never`, then narrows to `string` keys only. Used internally to derive autocomplete property names from augmented type maps.
 *
 * @example
 * ```ts
 * type Keys = AutocompleteKeys<{ foo: 1; bar: 2 }> // 'foo' | 'bar'
 * type Empty = AutocompleteKeys<never>              // never
 * ```
 */
export type AutocompleteKeys<T> = [T] extends [never] ? never : Extract<keyof T, string>

/**
 * Configuration for pattern-based autocomplete suggestions that are expanded at code generation time.
 *
 * @remarks Patterns define template strings or records that the code-generation layer uses to produce expanded autocomplete entries. Unlike direct entries, patterns describe *how* to generate completions rather than listing them explicitly.
 *
 * @example
 * ```ts
 * const patterns: AutocompletePatternsConfig = {
 *   selectors: ['hover', 'focus'],
 *   properties: { spacing: ['sm', 'md', 'lg'] },
 * }
 * ```
 */
export interface AutocompletePatternsConfig {
	/**
	 * Selector pattern strings expanded into autocomplete selector suggestions.
	 *
	 * @default undefined
	 */
	selectors?: Arrayable<string>
	/**
	 * Shortcut pattern strings expanded into autocomplete shortcut suggestions.
	 *
	 * @default undefined
	 */
	shortcuts?: Arrayable<string>
	/**
	 * Property-to-values mapping whose keys are property names and values are the allowed value patterns.
	 *
	 * @default undefined
	 */
	properties?: Record<string, Arrayable<string>>
	/**
	 * CSS property-to-values mapping whose keys are CSS property names and values are the allowed value patterns.
	 *
	 * @default undefined
	 */
	cssProperties?: Record<string, Arrayable<string>>
}

/**
 * A partial set of autocomplete entries contributed by a plugin or engine subsystem at runtime.
 *
 * @remarks Plugins call `engine.appendAutocomplete()` with an `AutocompleteContribution` to incrementally register new completions for selectors, shortcuts, properties, and CSS properties. Contributions are merged additively into the resolved autocomplete config.
 *
 * @example
 * ```ts
 * engine.appendAutocomplete({
 *   selectors: 'dark',
 *   cssProperties: { color: ['red', 'blue'] },
 * })
 * ```
 */
export interface AutocompleteContribution {
	/**
	 * Selector name strings to add to the autocomplete suggestion pool.
	 *
	 * @default undefined
	 */
	selectors?: Arrayable<string>
	/**
	 * Shortcut name strings to add to the autocomplete suggestion pool.
	 *
	 * @default undefined
	 */
	shortcuts?: Arrayable<string>
	/**
	 * Extra non-CSS property names to register in the autocomplete type surface (e.g. `__shortcut`, `__layer`).
	 *
	 * @default undefined
	 */
	extraProperties?: Arrayable<string>
	/**
	 * Extra CSS property names (including custom properties) to register in the autocomplete type surface.
	 *
	 * @default undefined
	 */
	extraCssProperties?: Arrayable<string>
	/**
	 * Map of property names to their accepted TypeScript type strings or literal value suggestions.
	 *
	 * @default undefined
	 */
	properties?: Record<string, Arrayable<string>>
	/**
	 * Map of CSS property names to their accepted value suggestions.
	 *
	 * @default undefined
	 */
	cssProperties?: Record<string, Arrayable<string>>
	/**
	 * Pattern-based entries that define how to generate expanded autocomplete suggestions.
	 *
	 * @default undefined
	 */
	patterns?: AutocompletePatternsConfig
}

/**
 * User-facing autocomplete configuration supplied in `EngineConfig.autocomplete`.
 *
 * @remarks Accepts the same shape as `AutocompleteContribution` but additionally allows `properties` and `cssProperties` as tuple arrays for ordered definitions. Normalized into the resolved config during engine initialization.
 *
 * @example
 * ```ts
 * const config: AutocompleteConfig = {
 *   selectors: ['hover', 'focus'],
 *   properties: [['spacing', ['sm', 'md', 'lg']]],
 * }
 * ```
 */
export interface AutocompleteConfig {
	/**
	 * Selector name strings for autocomplete suggestions.
	 *
	 * @default undefined
	 */
	selectors?: Arrayable<string>
	/**
	 * Shortcut name strings for autocomplete suggestions.
	 *
	 * @default undefined
	 */
	shortcuts?: Arrayable<string>
	/**
	 * Extra non-CSS property names to surface in autocomplete.
	 *
	 * @default undefined
	 */
	extraProperties?: Arrayable<string>
	/**
	 * Extra CSS property names to surface in autocomplete.
	 *
	 * @default undefined
	 */
	extraCssProperties?: Arrayable<string>
	/**
	 * Property-to-type mapping. Accepts either a record or an ordered array of `[property, type]` tuples.
	 *
	 * @default undefined
	 */
	properties?: [property: string, tsType: Arrayable<string>][] | Record<string, Arrayable<string>>
	/**
	 * CSS property-to-value mapping. Accepts either a record or an ordered array of `[property, value]` tuples.
	 *
	 * @default undefined
	 */
	cssProperties?: [property: string, value: Arrayable<string>][] | Record<string, Arrayable<string>>
	/**
	 * Pattern-based entries for generating expanded autocomplete suggestions.
	 *
	 * @default undefined
	 */
	patterns?: AutocompletePatternsConfig
}

/**
 * Fully resolved form of `AutocompletePatternsConfig` where all arrayable values have been normalized into `Set` and `Map` collections.
 * @internal
 *
 * @remarks Produced during engine config resolution. Using `Set` and `Map` avoids duplicate entries and enables efficient incremental appends by plugins.
 *
 * @example
 * ```ts
 * const patterns: ResolvedAutocompletePatternsConfig = {
 *   selectors: new Set(['hover']),
 *   shortcuts: new Set(),
 *   properties: new Map(),
 *   cssProperties: new Map(),
 * }
 * ```
 */
export interface ResolvedAutocompletePatternsConfig {
	/** Set of resolved selector autocomplete patterns. */
	selectors: Set<string>
	/** Set of resolved shortcut autocomplete patterns. */
	shortcuts: Set<string>
	/** Map of property names to their expanded autocomplete value patterns. */
	properties: Map<string, string[]>
	/** Map of CSS property names to their expanded autocomplete value patterns. */
	cssProperties: Map<string, string[]>
}

/**
 * Fully resolved autocomplete configuration used at runtime by the engine and integration layer.
 * @internal
 *
 * @remarks All user-facing arrayable and record values are normalized into `Set`/`Map` structures during engine config resolution. Plugins append entries via `engine.appendAutocomplete()` which mutates this structure in place.
 *
 * @example
 * ```ts
 * const ac: ResolvedAutocompleteConfig = {
 *   selectors: new Set(['hover']),
 *   shortcuts: new Set(),
 *   extraProperties: new Set(['__layer']),
 *   extraCssProperties: new Set(),
 *   properties: new Map(),
 *   cssProperties: new Map(),
 *   patterns: { selectors: new Set(), shortcuts: new Set(), properties: new Map(), cssProperties: new Map() },
 * }
 * ```
 */
export interface ResolvedAutocompleteConfig {
	/** Known selector names available for autocomplete. */
	selectors: Set<string>
	/** Known shortcut names available for autocomplete. */
	shortcuts: Set<string>
	/** Non-CSS property names injected by plugins (e.g. `__shortcut`, `__layer`, `__important`). */
	extraProperties: Set<string>
	/** Extra CSS property names (including custom properties) injected by plugins. */
	extraCssProperties: Set<string>
	/** Property-to-type mappings for TypeScript type generation. */
	properties: Map<string, string[]>
	/** CSS property-to-value mappings for value-level autocomplete. */
	cssProperties: Map<string, string[]>
	/** Resolved pattern-based autocomplete entries. */
	patterns: ResolvedAutocompletePatternsConfig
}

/**
 * Shape contract for the autocomplete type map that plugins augment via module augmentation on `PikaAugment`.
 * @internal
 *
 * @remarks Each member corresponds to a dimension of the autocomplete surface. Plugin authors extend `PikaAugment` with a `DefineAutocomplete` entry whose members populate IDE completions.
 *
 * @example
 * ```ts
 * interface _Autocomplete {
 *   Selector: 'hover' | 'focus'
 *   Shortcut: 'btn' | 'card'
 *   Layer: 'base' | 'components'
 *   PropertyValue: { spacing: 'sm' | 'md' }
 *   CSSPropertyValue: { color: 'primary' | 'secondary' }
 * }
 * ```
 */
export interface _Autocomplete {
	/** Union of known selector names for IDE autocomplete. */
	Selector: UnionString
	/** Union of known shortcut names for IDE autocomplete. */
	Shortcut: UnionString
	/** Union of known layer names for IDE autocomplete. */
	Layer: UnionString
	/** Record mapping extra property names to their accepted value types for IDE autocomplete. */
	PropertyValue: Record<string, unknown>
	/** Record mapping CSS property names to their accepted value unions for IDE autocomplete. */
	CSSPropertyValue: Record<string, UnionString>
}

/**
 * Identity helper that constrains the type parameter to the `_Autocomplete` shape, used inside `PikaAugment` to define the autocomplete map for a plugin.
 *
 * @typeParam A - The autocomplete map satisfying the `_Autocomplete` contract.
 *
 * @remarks Provides compile-time validation that the augmented autocomplete map has all required members.
 *
 * @example
 * ```ts
 * declare module '@pikacss/core' {
 *   interface PikaAugment {
 *     Autocomplete: DefineAutocomplete<{
 *       Selector: 'hover' | 'focus'
 *       Shortcut: never
 *       Layer: 'base'
 *       PropertyValue: never
 *       CSSPropertyValue: never
 *     }>
 *   }
 * }
 * ```
 */
export type DefineAutocomplete<A extends _Autocomplete> = A

/**
 * Default autocomplete map used when no plugin provides an augmentation, with all dimensions set to `never`.
 * @internal
 *
 * @remarks Serves as the fallback in `ResolvedAutocomplete` so the engine always has a valid autocomplete shape even without any plugin augmentations.
 *
 * @example
 * ```ts
 * // When PikaAugment has no Autocomplete key:
 * type Resolved = ResolvedAutocomplete // EmptyAutocomplete
 * ```
 */
export type EmptyAutocomplete = DefineAutocomplete<{
	Selector: never
	Shortcut: never
	Layer: never
	PropertyValue: never
	CSSPropertyValue: never
}>
