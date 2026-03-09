import type { DefineAutocomplete } from '@pikacss/core'
import { defineEnginePlugin } from '@pikacss/core'

// Augment PikaAugment to register layer names for autocomplete.
// Users who install this plugin will get autocomplete for these layer names
// when using WithLayer preflights anywhere in their project.
declare module '@pikacss/core' {
	interface PikaAugment {
		Autocomplete: DefineAutocomplete<{
			Selector: never
			StyleItemString: never
			Layer: 'base' | 'components' | 'utilities'
			PropertyValue: never
			CSSPropertyValue: never
		}>
	}
}

export function myLayerPlugin() {
	return defineEnginePlugin({
		name: 'my-layer-plugin',
		configureEngine: async (engine) => {
			// The 'layer' field now has autocomplete for 'base' | 'components' | 'utilities'
			engine.addPreflight({
				layer: 'base', // ← TypeScript suggests: 'base', 'components', 'utilities'
				preflight: 'body { margin: 0; }',
			})
		},
	})
}
