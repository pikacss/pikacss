import type { DiagnosticHandler } from '@pikacss/core'
import type { TokenIR } from './ir'
import type { DesignTokensConfig, StrictLevel, TokenLayer } from './types'
import { mergeTypeAutocomplete } from './autocomplete'
import { resolveToken } from './resolve'

// Kebab-cases an authored property name (`backgroundColor` -> `background-color`)
// so it can be matched against the CSS-property-keyed governed/shorthand maps.
// Custom properties (`--*`) are left untouched. Mirrors core's `toKebab`, which
// is not part of the public `@pikacss/core` export surface.
function toKebab(property: string): string {
	if (property.startsWith('--'))
		return property
	return property.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)
}

// CSS-wide keywords accepted on any governed property (rule 4b).
const CSS_WIDE_KEYWORDS = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer'])

// Built-in per-`$type` literal allowlist (rule 4c). Kept intentionally minimal.
const BUILTIN_ALLOWLIST: Record<string, string[]> = {
	color: ['transparent', 'currentcolor'],
	dimension: ['0', 'auto'],
}

// Functional values whose var() references are validated as a group (rule 4d).
const FUNCTIONAL_RE = /\b(?:calc|color-mix|min|max|clamp|light-dark)\(/

// A value that is a single `var(--x)` reference (with optional fallback).
const BARE_VAR_RE = /^var\(\s*(--[\w-]+)\s*(?:,[^)]*)?\)$/

// All var(--x) references in a value.
const VAR_REF_RE = /var\(\s*(--[\w-]+)/g

// Color literal patterns scanned inside shorthand values (rule 5).
const COLOR_LITERAL_RE = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(/i

// Shorthand properties whose color literals are flagged when a color token exists.
// limit: only literal color patterns are detected; lengths and other sub-values
// inside a shorthand are NOT parsed. Upgrade path: full per-shorthand value
// parsing (split into longhands, then govern each via rules 3-4).
const SHORTHAND_PROPERTIES = new Set([
	'border',
	'border-top',
	'border-right',
	'border-bottom',
	'border-left',
	'background',
	'outline',
])

/**
 * The resolved per-engine state strict mode needs to validate authored values.
 *
 * @internal
 */
export interface StrictContext {
	level: StrictLevel
	overrides: Record<string, StrictLevel>
	allowedValues: (string | RegExp)[]
	semanticOnly: boolean
	/** Token var name → declared `$type` (only tokens carrying a `$type`). */
	typeByVar: ReadonlyMap<string, string>
	/** Every emitted token var name, regardless of `$type`. */
	allTokenVars: ReadonlySet<string>
	deprecatedNames: ReadonlySet<string>
	layerNames: ReadonlyMap<string, TokenLayer>
	/** Governed CSS property → its governing `$type`. */
	propertyToType: ReadonlyMap<string, string>
	/** `$type` → parseable base token values, for did-you-mean suggestions. */
	tokensByType: ReadonlyMap<string, { name: string, value: string }[]>
	hasColorToken: boolean
}

// Maps a strict level to its diagnostic severity, or null when suppressed.
function levelToSeverity(level: StrictLevel): 'warning' | 'error' | null {
	if (level === 'warn')
		return 'warning'
	if (level === 'error')
		return 'error'
	return null
}

/**
 * Builds the strict-mode context from normalized tokens and the resolved config.
 *
 * @internal
 *
 * @param irNodes - The normalized token IR nodes.
 * @param config - The design tokens config (its `strict` block drives behavior).
 * @param prefix - The global variable-name prefix fallback.
 * @param deprecatedNames - The deprecated token var-name registry.
 * @param layerNames - The token var-name → layer registry.
 * @returns The resolved {@link StrictContext}.
 */
export function buildStrictContext(
	irNodes: TokenIR[],
	config: DesignTokensConfig,
	prefix: string,
	deprecatedNames: ReadonlySet<string>,
	layerNames: ReadonlyMap<string, TokenLayer>,
): StrictContext {
	const strict = config.strict ?? {}
	const merged = mergeTypeAutocomplete(config.typeAutocomplete)

	const typeByVar = new Map<string, string>()
	const allTokenVars = new Set<string>()
	const typesWithTokens = new Set<string>()
	const tokensByType = new Map<string, { name: string, value: string }[]>()

	for (const ir of irNodes) {
		const { name, value } = resolveToken(ir, prefix)
		allTokenVars.add(name)
		if (ir.type == null)
			continue
		typeByVar.set(name, ir.type)
		typesWithTokens.add(ir.type)
		// Base tokens (no theme scope) provide the canonical values used for
		// did-you-mean suggestions; theme overrides share the same var name.
		if (ir.themeScope == null) {
			const list = tokensByType.get(ir.type) ?? []
			list.push({ name, value })
			tokensByType.set(ir.type, list)
		}
	}

	// A property is governed when it is listed under a `$type` that has at least
	// one registered token. First governed `$type` in map order wins the property.
	const propertyToType = new Map<string, string>()
	for (const [type, entry] of Object.entries(merged)) {
		if (entry === false || !typesWithTokens.has(type))
			continue
		for (const property of [entry].flat()) {
			if (!propertyToType.has(property))
				propertyToType.set(property, type)
		}
	}

	return {
		level: strict.level ?? 'off',
		overrides: strict.overrides ?? {},
		allowedValues: strict.allowedValues ?? [],
		semanticOnly: strict.semanticOnly ?? false,
		typeByVar,
		allTokenVars,
		deprecatedNames,
		layerNames,
		propertyToType,
		tokensByType,
		hasColorToken: typesWithTokens.has('color'),
	}
}

/**
 * Reports whether strict mode has any active check, so the transform hook can
 * take a zero-cost early return when everything is `'off'`.
 *
 * @internal
 */
export function isStrictActive(ctx: StrictContext): boolean {
	return ctx.level !== 'off'
		|| Object.values(ctx.overrides)
			.some(level => level !== 'off')
}

// Resolves the effective level for a property: property-key override wins over
// `$type`-key override, which wins over the baseline level.
function resolveEffectiveLevel(ctx: StrictContext, property: string, type: string | undefined): StrictLevel {
	if (property in ctx.overrides)
		return ctx.overrides[property]!
	if (type != null && type in ctx.overrides)
		return ctx.overrides[type]!
	return ctx.level
}

// Collects every var(--x) reference name from a value.
function collectVarRefs(value: string): string[] {
	const refs: string[] = []
	for (const match of value.matchAll(VAR_REF_RE))
		refs.push(match[1]!)
	return refs
}

// Checks a value against the user-configured extra allowlist (rule 4c, user part).
function matchesAllowedValues(value: string, allowed: (string | RegExp)[]): boolean {
	return allowed.some(entry => typeof entry === 'string'
		? entry === value
		: entry.test(value))
}

// Validity of a value on a governed property of the given `$type` (rule 4).
function isValidGovernedValue(value: string, type: string, ctx: StrictContext): boolean {
	const t = value.trim()

	// Rule 4a: a bare var(--x) reference to a token of the governing `$type`.
	const bare = t.match(BARE_VAR_RE)
	if (bare != null && ctx.typeByVar.get(bare[1]!) === type)
		return true

	// Rule 4b: CSS-wide keyword.
	if (CSS_WIDE_KEYWORDS.has(t.toLowerCase()))
		return true

	// Rule 4c: built-in per-`$type` allowlist + user allowedValues.
	if (BUILTIN_ALLOWLIST[type]?.includes(t.toLowerCase()))
		return true
	if (matchesAllowedValues(t, ctx.allowedValues))
		return true

	// Rule 4d: functional value whose every var() ref is a registered token, with
	// at least one var() ref.
	if (FUNCTIONAL_RE.test(t)) {
		const refs = collectVarRefs(t)
		if (refs.length >= 1 && refs.every(ref => ctx.allTokenVars.has(ref)))
			return true
	}

	return false
}

// Parses a color literal (#hex 3/6, rgb()/rgba()) into an RGB triple, or null.
function parseColor(value: string): [number, number, number] | null {
	const v = value.trim()
	const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
	if (hex != null) {
		let h = hex[1]!
		if (h.length === 3)
			h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!
		return [
			Number.parseInt(h.slice(0, 2), 16),
			Number.parseInt(h.slice(2, 4), 16),
			Number.parseInt(h.slice(4, 6), 16),
		]
	}
	const rgb = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i)
	if (rgb != null)
		return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
	return null
}

// Parses a dimension literal into a numeric magnitude and unit, or null.
function parseDimension(value: string): { num: number, unit: string } | null {
	const m = value.trim()
		.match(/^(-?[\d.]+)([a-z%]*)$/i)
	if (m == null)
		return null
	const num = Number(m[1])
	if (Number.isNaN(num))
		return null
	return { num, unit: m[2]!.toLowerCase() }
}

// Nearest-token suggestion for a violating value (rule 6), or undefined when it
// cannot be computed (unparseable value, or no comparable token of that type).
function suggestNearestToken(value: string, type: string, ctx: StrictContext): string | undefined {
	const candidates = ctx.tokensByType.get(type)
	if (candidates == null || candidates.length === 0)
		return undefined

	if (type === 'color') {
		const target = parseColor(value)
		if (target == null)
			return undefined
		let best: string | undefined
		let bestDist = Number.POSITIVE_INFINITY
		for (const candidate of candidates) {
			const rgb = parseColor(candidate.value)
			if (rgb == null)
				continue
			const dist = (rgb[0] - target[0]) ** 2 + (rgb[1] - target[1]) ** 2 + (rgb[2] - target[2]) ** 2
			if (dist < bestDist) {
				bestDist = dist
				best = candidate.name
			}
		}
		return best
	}

	const target = parseDimension(value)
	if (target == null)
		return undefined
	let best: string | undefined
	let bestDist = Number.POSITIVE_INFINITY
	for (const candidate of candidates) {
		const dim = parseDimension(candidate.value)
		if (dim == null || dim.unit !== target.unit)
			continue
		const dist = Math.abs(dim.num - target.num)
		if (dist < bestDist) {
			bestDist = dist
			best = candidate.name
		}
	}
	return best
}

// Builds the suffix appended to a value-violation message when a suggestion exists.
function suggestionSuffix(suggestion: string | undefined): string {
	return suggestion == null ? '' : ` Did you mean var(${suggestion})?`
}

// Normalizes a raw style-definition property value into the literal strings to
// check. Handles scalars and the `[primary, fallbacks]` tuple form.
function collectValueStrings(value: unknown): string[] {
	if (value == null)
		return []
	if (typeof value === 'string')
		return [value]
	if (typeof value === 'number')
		return [String(value)]
	if (Array.isArray(value) && value.length === 2 && Array.isArray(value[1])) {
		const [primary, fallbacks] = value as [unknown, unknown[]]
		return [...fallbacks, primary]
			.filter((v): v is string | number => typeof v === 'string' || typeof v === 'number')
			.map(String)
	}
	return []
}

/**
 * Inspects one property/value pair and appends any strict-mode diagnostics.
 *
 * @internal
 *
 * @param rawProperty - The property name as authored (camelCase or custom `--*`).
 * @param rawValue - The authored value (scalar or `[primary, fallbacks]` tuple).
 * @param ctx - The resolved strict context.
 * @param onDiagnostic - Handler each violation is reported through as a core
 * `Diagnostic` (`{ level, code, message, plugin: 'design-tokens' }`); never thrown.
 *
 * @remarks Runs, in order: deprecated-token usage (rule 7, when `level !== 'off'`),
 * semantic-only violations (rule 8), governed-value validity (rules 3-4), and
 * shorthand color-literal detection (rule 5). Each check is independent and may
 * emit its own diagnostic. Property keys beginning with `__` (engine pseudo
 * properties like `__shortcut`) are skipped.
 */
export function checkDeclaration(
	rawProperty: string,
	rawValue: unknown,
	ctx: StrictContext,
	onDiagnostic: DiagnosticHandler,
): void {
	if (rawProperty.startsWith('__'))
		return

	const property = toKebab(rawProperty)
	const values = collectValueStrings(rawValue)
	if (values.length === 0)
		return

	const governingType = ctx.propertyToType.get(property)
	const isShorthand = SHORTHAND_PROPERTIES.has(property)

	for (const value of values) {
		const refs = collectVarRefs(value)

		// Rule 7: deprecated-token usage (independent of property governance).
		if (ctx.level !== 'off') {
			for (const ref of refs) {
				if (ctx.deprecatedNames.has(ref)) {
					onDiagnostic({
						level: 'warning',
						code: 'deprecated-token',
						message: `Value "${value}" on "${property}" references deprecated design token "${ref}".`,
						plugin: 'design-tokens',
					})
				}
			}
		}

		// Rule 8: semantic-only — referencing a primitive-layer token is a violation.
		if (ctx.semanticOnly && ctx.level !== 'off') {
			const effective = resolveEffectiveLevel(ctx, property, governingType)
			const severity = levelToSeverity(effective)
			if (severity != null) {
				for (const ref of refs) {
					if (ctx.layerNames.get(ref) === 'primitive') {
						onDiagnostic({
							level: severity,
							code: 'semantic-only',
							message: `Value "${value}" on "${property}" references primitive-layer token "${ref}"; only semantic tokens are allowed.`,
							plugin: 'design-tokens',
						})
					}
				}
			}
		}

		// Rules 3-4: governed-value validity.
		if (governingType != null && !isValidGovernedValue(value, governingType, ctx)) {
			const effective = resolveEffectiveLevel(ctx, property, governingType)
			const severity = levelToSeverity(effective)
			if (severity != null) {
				const suggestion = suggestNearestToken(value, governingType, ctx)
				onDiagnostic({
					level: severity,
					code: 'strict-value',
					message: `Value "${value}" on "${property}" is not an allowed value for a "${governingType}" token property.${suggestionSuffix(suggestion)}`,
					plugin: 'design-tokens',
				})
			}
		}

		// Rule 5: shorthand color-literal detection (best-effort).
		if (isShorthand && ctx.hasColorToken && COLOR_LITERAL_RE.test(value)) {
			const effective = resolveEffectiveLevel(ctx, property, undefined)
			const severity = levelToSeverity(effective)
			if (severity != null) {
				// Suggest against the isolated hex literal (the whole shorthand value
				// is not a parseable color); rgb()/hsl() literals get no suggestion.
				const hex = value.match(/#[0-9a-f]{3,8}\b/i)
				const suggestion = hex != null ? suggestNearestToken(hex[0], 'color', ctx) : undefined
				onDiagnostic({
					level: severity,
					code: 'strict-value',
					message: `Value "${value}" on shorthand "${property}" contains a literal color; use a color design token.${suggestionSuffix(suggestion)}`,
					plugin: 'design-tokens',
				})
			}
		}
	}
}
