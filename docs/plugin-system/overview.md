# Plugin System Overview

PikaCSS has a powerful plugin system that lets you extend the engine's behavior at every stage — from config resolution to style generation. Plugins are plain objects created with the `defineEnginePlugin()` helper.

## EnginePlugin Interface

Every plugin must have a `name` and can optionally define an `order` and hook functions:

<<< @/.examples/plugin-system/overview-engine-plugin-interface.ts

## Minimal Plugin

The simplest possible plugin only needs a `name`:

<<< @/.examples/plugin-system/overview-minimal-plugin.ts

## Plugin Ordering {#plugin-ordering}

The `order` property controls when a plugin's hooks execute relative to other plugins:

| `order` value | Priority | Runs |
|---|---|---|
| `'pre'` | 0 | First |
| `undefined` (default) | 1 | Normal |
| `'post'` | 2 | Last |

Within the same priority group, plugins run in the order they are registered. PikaCSS's built-in core plugins (e.g. `core:variables`, `core:keyframes`, `core:selectors`, `core:shortcuts`, `core:important`) are loaded before user plugins, then all plugins are sorted together.

<<< @/.examples/plugin-system/overview-plugin-order.ts

## Hook Lifecycle {#hook-lifecycle}

During `createEngine(config)`, hooks are invoked in this order:

```text
createEngine(config)
│
├─ 1. configureRawConfig    (async)  — Modify the raw config
├─ 2. rawConfigConfigured   (sync)   — Notification: raw config settled
├─ 3. configureResolvedConfig (async) — Modify the resolved config
├─ 4. configureEngine        (async)  — Modify/set up the engine instance
│
└─ Engine is ready
   │
   ├─ During engine.use(...):
   │   ├─ 5. transformStyleItems       (async) — Transform style items
   │   ├─ 6. transformSelectors        (async) — Transform selectors
   │   └─ 7. transformStyleDefinitions (async) — Transform style definitions
   │
   ├─ When preflights change:
   │   └─ 8. preflightUpdated          (sync)  — Notification
   │
   ├─ When atomic style is generated:
   │   └─ 9. atomicStyleAdded          (sync)  — Notification
   │
   └─ When autocomplete config changes:
       └─ 10. autocompleteConfigUpdated (sync)  — Notification
```

Hooks 1–4 run once during engine creation. Hooks 5–10 run at runtime whenever the corresponding event occurs.

## Async Hooks (Transform) {#async-hooks}

Async hooks receive a payload and can **return a modified version**. The modified payload is then passed to the next plugin in order. If a hook returns `void` or `undefined`, the current payload is kept unchanged.

<<< @/.examples/plugin-system/overview-async-hook.ts

### `configureRawConfig`

- **When**: During `createEngine()`, before config resolution
- **Receives**: `config: EngineConfig` — the raw user config
- **Returns**: `EngineConfig | void`
- **Purpose**: Add plugins, modify prefix, add preflights, or set any config option before resolution

### `configureResolvedConfig`

- **When**: During `createEngine()`, after config resolution
- **Receives**: `resolvedConfig: ResolvedEngineConfig` — the fully resolved config
- **Returns**: `ResolvedEngineConfig | void`
- **Purpose**: Modify resolved values like the autocomplete config or preflights list

### `configureEngine`

- **When**: During `createEngine()`, after the engine instance is created
- **Receives**: `engine: Engine` — the engine instance
- **Returns**: `Engine | void`
- **Purpose**: Set up runtime features, add preflights, configure autocomplete, or attach custom properties to the engine

### `transformSelectors`

- **When**: During style extraction (triggered by `engine.use()` and preflight rendering)
- **Receives**: `selectors: string[]` — the selector chain being processed
- **Returns**: `string[] | void`
- **Purpose**: Rewrite, expand, or replace selectors (e.g. mapping `$hover` to `&:hover`)

### `transformStyleItems`

- **When**: During `engine.use()`, before style items are resolved
- **Receives**: `styleItems: ResolvedStyleItem[]` — the list of style items
- **Returns**: `ResolvedStyleItem[] | void`
- **Purpose**: Add, remove, or transform style items (e.g. expanding shortcuts)

### `transformStyleDefinitions`

- **When**: During style extraction, when processing nested style definitions
- **Receives**: `styleDefinitions: ResolvedStyleDefinition[]` — the list of style definitions
- **Returns**: `ResolvedStyleDefinition[] | void`
- **Purpose**: Modify style definition objects before they are extracted into atomic styles

## Sync Hooks (Notification) {#sync-hooks}

Sync hooks are primarily notification hooks — they inform plugins that something happened. Although the hook runner forwards non-nullish return values to the next plugin internally, the engine uses these hooks for observation rather than for normal payload transformation.

<<< @/.examples/plugin-system/overview-sync-hook.ts

### `rawConfigConfigured`

- **When**: During `createEngine()`, after `configureRawConfig` completes
- **Receives**: `config: EngineConfig` — the settled raw config
- **Purpose**: Read the final raw config (e.g. to cache values for later use in other hooks)

### `preflightUpdated`

- **When**: Whenever a preflight is added or modified
- **Receives**: nothing
- **Purpose**: React to preflight changes (e.g. trigger a rebuild)

### `atomicStyleAdded`

- **When**: Whenever a new atomic style is generated and stored
- **Receives**: `atomicStyle: AtomicStyle` — `{ id: string, content: StyleContent }`
- **Purpose**: Track or log generated atomic styles

### `autocompleteConfigUpdated`

- **When**: Whenever the autocomplete configuration changes
- **Receives**: nothing
- **Purpose**: React to autocomplete changes (e.g. rebuild completion data)

## Hook Execution Model {#execution-model}

All hooks — both async and sync — follow the same execution rules:

1. **Plugin order**: Hooks run plugin-by-plugin in sorted order (`pre` → default → `post`)
2. **Payload chaining**: If a plugin returns a non-nullish value, that value replaces the payload for the next plugin. In practice, this matters most for async hooks such as config and transform hooks.
3. **Error isolation**: If a plugin's hook throws an error, the error is caught and logged. Execution continues with the next plugin — one failing plugin does not break the chain
4. **Skipping**: If a plugin does not define a particular hook, it is simply skipped

## Complete Example {#complete-example}

A full plugin using all available hooks:

<<< @/.examples/plugin-system/overview-full-plugin.ts

## Source Reference

- `packages/core/src/internal/plugin.ts` — `EnginePlugin` interface, `defineEnginePlugin`, hook execution, plugin sorting
- `packages/core/src/internal/engine.ts` — `createEngine`, hook invocation during engine lifecycle

## Next

- Continue to [Create Plugin](/plugin-system/create-plugin) for a step-by-step guide to building your own plugin
- Review [Built-in Plugins](/guide/built-in-plugins)
- Compare [Configuration](/guide/configuration)
