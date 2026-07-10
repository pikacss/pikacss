---
title: Type Augmentation
description: Extend PikaCSS TypeScript interfaces with module augmentation.
relatedPackages:
  - '@pikacss/core'
relatedSources:
  - 'packages/core/src/types/engine.ts'
  - 'packages/core/src/types/shared.ts'
  - 'packages/core/src/types/autocomplete.ts'
  - 'packages/core/src/types/public.ts'
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

The `PikaAugment` interface (declared empty in `packages/core/src/types/shared.ts`) is the type-level extension hub of PikaCSS. The core types resolve five members from it — `Autocomplete`, `Selector`, `Properties`, `StyleDefinition`, and `StyleItem` (see `packages/core/src/types/resolved.ts`) — falling back to internal defaults when a member is absent.

There are two ways to feed it. Pick based on whether your users run the build integration.

### With codegen (how official plugins do it)

No official plugin hand-writes a `PikaAugment` augmentation. Instead, plugins contribute autocomplete data **at runtime**, and the integration's `tsCodegen` writes the `PikaAugment` augmentation into the generated `pika.gen.ts` (see `packages/integration/src/tsCodegen.ts`). Everything your plugin registers through the engine shows up in users' IDEs automatically:

```ts
defineEnginePlugin({
  name: 'my-plugin',
  configureEngine: (engine) => {
    engine.appendAutocomplete({
      // Literal suggestions — emitted as string literal types
      selectors: '@my-selector',
      shortcuts: 'my-shortcut',
      // Pattern suggestions — raw TypeScript type source, emitted verbatim
      // (template literal types work well here)
      patterns: {
        shortcuts: '`my-shortcut-${string}`',
      },
    })
  },
})
```

Rule-level `autocomplete` options feed the same pool: `engine.selectors.add`, `engine.shortcuts.add`, and the corresponding config `definitions` accept autocomplete entries alongside dynamic (RegExp) rules, and `@pikacss/plugin-icons` uses exactly this flow — `appendAutocomplete` with shortcut patterns plus a dynamic shortcut rule.

### Without codegen (manual augmentation)

If your plugin targets engine-only setups where no `pika.gen.ts` is generated (`tsCodegen: false`, or direct `createEngine()` usage), you can augment `PikaAugment.Autocomplete` by hand:

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

::: warning Conflicts with the generated file
The generated `pika.gen.ts` declares the same `Autocomplete` member on `PikaAugment`. TypeScript requires merged interface members with the same name to have identical types, so a hand-written `Autocomplete` augmentation and an enabled `tsCodegen` will conflict. Ship manual augmentation only for no-codegen scenarios — with the integration, use the runtime flow above instead.
:::

The remaining members (`Selector`, `Properties`, `StyleDefinition`, `StyleItem`) can be augmented the same way to widen or replace the shapes accepted by `pika()`. They are normally supplied by the generated file; override them manually only in no-codegen setups and with the same conflict caveat.

## Next

- [Define Helpers](/plugin-development/define-helpers) — `defineEngineConfig` and `defineEnginePlugin`.
- [Create a Plugin](/plugin-development/create-a-plugin) — plugin structure and the defineEnginePlugin helper.
- [Available Hooks](/plugin-development/available-hooks) — all lifecycle hooks you can implement.
