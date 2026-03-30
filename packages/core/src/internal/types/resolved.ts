import type { _Autocomplete, AutocompleteKeys, EmptyAutocomplete } from './autocomplete'
import type { InternalProperties, InternalStyleDefinition, InternalStyleItem, PikaAugment } from './shared'
import type { IsNever, ResolveFrom, UnionString } from './utils'

/**
 * The effective autocomplete map resolved from `PikaAugment.Autocomplete`, falling back to `EmptyAutocomplete` when no plugin augments it.
 * @internal
 *
 * @remarks This is the source-of-truth autocomplete shape that all downstream resolved types (`ResolvedAutocompletePropertyValue`, `ResolvedSelector`, etc.) derive from.
 *
 * @example
 * ```ts
 * // With augmentation: resolves to the plugin-provided map
 * // Without augmentation: resolves to EmptyAutocomplete
 * type AC = ResolvedAutocomplete
 * ```
 */
export type ResolvedAutocomplete = ResolveFrom<PikaAugment, 'Autocomplete', _Autocomplete, EmptyAutocomplete>
/**
 * The property-value record extracted from the resolved autocomplete map, mapping extra property names to their accepted value types.
 * @internal
 *
 * @remarks Used to derive the set of extra (non-CSS) properties and their value unions for type-safe `pika()` calls.
 *
 * @example
 * ```ts
 * type PV = ResolvedAutocompletePropertyValue // Record<string, unknown> or plugin-augmented map
 * ```
 */
export type ResolvedAutocompletePropertyValue = ResolvedAutocomplete['PropertyValue']
/**
 * The CSS property-value record extracted from the resolved autocomplete map, mapping CSS property names to their accepted value unions.
 * @internal
 *
 * @remarks Used to extend the standard `CSSProperties` value types with plugin-contributed suggestions (e.g. design token names for `color`).
 *
 * @example
 * ```ts
 * type CPV = ResolvedAutocompleteCSSPropertyValue // Record<string, UnionString> or plugin-augmented map
 * ```
 */
export type ResolvedAutocompleteCSSPropertyValue = ResolvedAutocomplete['CSSPropertyValue']
/**
 * Union of extra (non-CSS) property name strings derived from the resolved autocomplete property-value map.
 * @internal
 *
 * @remarks These property names (e.g. `__shortcut`, `__layer`, `__important`) are injected by core plugins into the `Properties` interface so they appear in `pika()` call autocomplete.
 *
 * @example
 * ```ts
 * type EP = ResolvedExtraProperty // '__shortcut' | '__layer' | ...
 * ```
 */
export type ResolvedExtraProperty = AutocompleteKeys<ResolvedAutocompletePropertyValue>
/**
 * Union of extra CSS property name strings derived from the resolved autocomplete CSS property-value map.
 * @internal
 *
 * @remarks Includes custom properties and vendor-specific properties registered by plugins (e.g. CSS variable names from the variables plugin).
 *
 * @example
 * ```ts
 * type ECP = ResolvedExtraCSSProperty // '--my-color' | '--spacing-sm' | ...
 * ```
 */
export type ResolvedExtraCSSProperty = AutocompleteKeys<ResolvedAutocompleteCSSPropertyValue>
/**
 * Union of known CSS `@layer` names, falling back to `UnionString` when no plugin augments the `Layer` dimension.
 *
 * @remarks When plugins define layer names via `DefineAutocomplete`, this type narrows to those names while still accepting arbitrary strings. Used in the `__layer` property autocomplete.
 *
 * @example
 * ```ts
 * type LN = ResolvedLayerName // 'base' | 'components' | ... or UnionString
 * ```
 */
export type ResolvedLayerName = IsNever<ResolvedAutocomplete['Layer']> extends true ? UnionString : ResolvedAutocomplete['Layer']
/**
 * The effective selector string type resolved from `PikaAugment.Selector`, falling back to plain `string`.
 * @internal
 *
 * @remarks Plugins can narrow the selector type via module augmentation to restrict accepted selector strings in `pika()` calls.
 *
 * @example
 * ```ts
 * type S = ResolvedSelector // string (default) or narrowed by plugin
 * ```
 */
export type ResolvedSelector = ResolveFrom<PikaAugment, 'Selector', string, string>
/**
 * The effective `Properties` type resolved from `PikaAugment.Properties`, falling back to the internal default `InternalProperties`.
 * @internal
 *
 * @remarks This is the full property map including standard CSS, custom, and extra properties. Used as the base type for style definition values.
 *
 * @example
 * ```ts
 * type P = ResolvedProperties // Properties (default) or plugin-augmented
 * ```
 */
export type ResolvedProperties = ResolveFrom<PikaAugment, 'Properties', any, InternalProperties>
/**
 * The subset of `ResolvedProperties` that contains only standard CSS properties, computed by excluding extra (non-CSS) property keys.
 * @internal
 *
 * @remarks Omits keys that come from `ResolvedExtraProperty` (e.g. `__shortcut`, `__layer`), leaving only real CSS property names.
 *
 * @example
 * ```ts
 * type CP = ResolvedCSSProperties // Standard CSS properties minus __shortcut, __layer, etc.
 * ```
 */
export type ResolvedCSSProperties = Omit<ResolvedProperties, ResolvedExtraProperty>
/**
 * The effective `StyleDefinition` type resolved from `PikaAugment.StyleDefinition`, falling back to the internal default.
 * @internal
 *
 * @remarks A style definition can be a flat property map or a nested selector-keyed structure. Plugin augmentation can extend this with additional accepted shapes.
 *
 * @example
 * ```ts
 * type SD = ResolvedStyleDefinition // StyleDefinition (default) or plugin-augmented
 * ```
 */
export type ResolvedStyleDefinition = ResolveFrom<PikaAugment, 'StyleDefinition', any, InternalStyleDefinition>
/**
 * The effective `StyleItem` type resolved from `PikaAugment.StyleItem`, falling back to the internal default.
 * @internal
 *
 * @remarks A style item is either a string reference (shortcut name / class name), a style definition object, or a combination. Plugin augmentation can extend accepted item shapes.
 *
 * @example
 * ```ts
 * type SI = ResolvedStyleItem // StyleItem (default) or plugin-augmented
 * ```
 */
export type ResolvedStyleItem = ResolveFrom<PikaAugment, 'StyleItem', any, InternalStyleItem>
