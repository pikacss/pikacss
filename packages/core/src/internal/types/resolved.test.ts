import type { DefineAutocomplete, PikaAugment, ResolvedLayerName, UnionString } from '../../index'
import type { _Autocomplete, EmptyAutocomplete } from './autocomplete'
import type { ResolvedAutocomplete, ResolvedCSSProperties, ResolvedProperties, ResolvedSelector, ResolvedStyleDefinition, ResolvedStyleItem } from './resolved'
import type { InternalProperties, InternalStyleDefinition, InternalStyleItem } from './shared'
import { describe, expectTypeOf, it } from 'vitest'

describe('autocomplete and resolved types', () => {
	describe('emptyAutocomplete', () => {
		it('should have all never fields', () => {
			expectTypeOf<EmptyAutocomplete['Selector']>()
				.toEqualTypeOf<never>()
			expectTypeOf<EmptyAutocomplete['StyleItemString']>()
				.toEqualTypeOf<never>()
			expectTypeOf<EmptyAutocomplete['ExtraProperty']>()
				.toEqualTypeOf<never>()
			expectTypeOf<EmptyAutocomplete['ExtraCssProperty']>()
				.toEqualTypeOf<never>()
			expectTypeOf<EmptyAutocomplete['Layer']>()
				.toEqualTypeOf<never>()
			expectTypeOf<EmptyAutocomplete['PropertiesValue']>()
				.toEqualTypeOf<never>()
			expectTypeOf<EmptyAutocomplete['CssPropertiesValue']>()
				.toEqualTypeOf<never>()
		})
	})

	describe('defineAutocomplete', () => {
		it('should preserve the autocomplete type', () => {
			type Custom = DefineAutocomplete<{
				Selector: 'hover' | 'focus'
				StyleItemString: 'flex-center'
				ExtraProperty: '__myProp'
				ExtraCssProperty: never
				Layer: 'base' | 'components'
				PropertiesValue: never
				CssPropertiesValue: never
			}>
			expectTypeOf<Custom['Selector']>()
				.toEqualTypeOf<'hover' | 'focus'>()
			expectTypeOf<Custom['Layer']>()
				.toEqualTypeOf<'base' | 'components'>()
		})
	})

	describe('_Autocomplete interface', () => {
		it('should have all required fields', () => {
			expectTypeOf<keyof _Autocomplete>()
				.toEqualTypeOf<
				'Selector' | 'StyleItemString' | 'ExtraProperty' | 'ExtraCssProperty' | 'Layer' | 'PropertiesValue' | 'CssPropertiesValue'
			>()
		})
	})

	describe('pikaAugment', () => {
		it('should be an empty interface by default', () => {
			// PikaAugment is empty by default, so it should be assignable from {}
			// eslint-disable-next-line ts/no-empty-object-type
			expectTypeOf<{}>()
				.toMatchTypeOf<PikaAugment>()
		})
	})

	describe('resolvedAutocomplete', () => {
		it('should fall back to EmptyAutocomplete when PikaAugment is not augmented', () => {
			// Without augmentation, ResolvedAutocomplete should be exactly EmptyAutocomplete
			expectTypeOf<ResolvedAutocomplete>()
				.toEqualTypeOf<EmptyAutocomplete>()
		})
	})

	describe('resolvedLayerName', () => {
		it('should be UnionString when no layers are defined', () => {
			// Without augmentation, Layer should be never, so ResolvedLayerName should be UnionString
			expectTypeOf<ResolvedLayerName>()
				.toEqualTypeOf<UnionString>()
		})
	})

	describe('resolvedSelector', () => {
		it('should equal string when PikaAugment has no Selector override', () => {
			expectTypeOf<ResolvedSelector>()
				.toEqualTypeOf<string>()
		})
	})

	describe('resolvedProperties', () => {
		it('should equal InternalProperties when PikaAugment has no Properties override', () => {
			expectTypeOf<ResolvedProperties>()
				.toEqualTypeOf<InternalProperties>()
		})
	})

	describe('resolvedCSSProperties', () => {
		it('should be bidirectionally compatible with ResolvedProperties when ExtraProperty is never', () => {
			// With no augmentation, ExtraProperty is never, so ResolvedCSSProperties ≈ ResolvedProperties
			expectTypeOf<ResolvedCSSProperties>()
				.toMatchTypeOf<ResolvedProperties>()
			expectTypeOf<ResolvedProperties>()
				.toMatchTypeOf<ResolvedCSSProperties>()
		})
	})

	describe('resolvedStyleDefinition', () => {
		it('should equal InternalStyleDefinition when PikaAugment has no StyleDefinition override', () => {
			expectTypeOf<ResolvedStyleDefinition>()
				.toEqualTypeOf<InternalStyleDefinition>()
		})
	})

	describe('resolvedStyleItem', () => {
		it('should equal InternalStyleItem when PikaAugment has no StyleItem override', () => {
			expectTypeOf<ResolvedStyleItem>()
				.toEqualTypeOf<InternalStyleItem>()
		})
	})
})
