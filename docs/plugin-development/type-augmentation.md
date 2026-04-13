---
title: Type Augmentation
description: Extend PikaCSS TypeScript interfaces with module augmentation.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/internal/types/engine.ts'
  - 'packages/core/src/internal/types/shared.ts'
  - 'packages/core/src/internal/types/autocomplete.ts'
  - 'packages/core/src/types.ts'
category: plugin-development
order: 30
---

# Type Augmentation

Extend PikaCSS TypeScript interfaces so your plugin's configuration options get full type checking and autocomplete.

## EngineConfig

Augment the `EngineConfig` interface to add plugin-specific configuration fields:

```ts
declare module '@pikacss/core' {
  interface EngineConfig {
    /** My plugin's configuration */
    myPlugin?: {
      enabled?: boolean
      theme?: 'light' | 'dark'
    }
  }
}
```

After augmentation, users get autocomplete when configuring the engine:

```ts
defineEngineConfig({
  plugins: [myPlugin()],
  myPlugin: {
    enabled: true, // ✅ autocomplete works
    theme: 'dark', // ✅ type-checked
  },
})
```

This page keeps the same `myPlugin()` factory name used in [Create a Plugin](/plugin-development/create-a-plugin) so the augmentation key and consumer config stay aligned across the plugin-authoring guides.

## Engine

Augment the `Engine` interface to add methods or properties to engine instances:

```ts
declare module '@pikacss/core' {
  interface Engine {
    /** Custom method added by my plugin */
    getTheme: () => string
  }
}
```

Then in your `configureEngine` hook:

```ts
defineEnginePlugin({
  name: 'my-plugin',
  configureEngine: (engine) => {
    engine.getTheme = () => 'dark'
  },
})
```

## PikaAugment

The `PikaAugment` interface provides type-level extension points for the autocomplete system. Plugins can register custom selectors, shortcuts, properties, and property values:

```ts
import type { DefineAutocomplete } from '@pikacss/core'

declare module '@pikacss/core' {
  interface PikaAugment {
    Autocomplete: DefineAutocomplete<{
      Selector: '@my-selector'
      Shortcut: 'my-shortcut'
      Layer: never
      PropertyValue: never
      CSSPropertyValue: never
    }>
  }
}
```

This ensures that custom selectors and shortcuts defined by your plugin appear in IDE autocomplete suggestions within style definitions.

## Next

- [Define Helpers](/plugin-development/define-helpers) — `defineEngineConfig` and `defineEnginePlugin`.
- [Create a Plugin](/plugin-development/create-a-plugin) — plugin structure and the defineEnginePlugin helper.
- [Available Hooks](/plugin-development/available-hooks) — all lifecycle hooks you can implement.
