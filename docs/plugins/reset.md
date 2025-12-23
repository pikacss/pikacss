````markdown
---
title: Reset
description: Learn how to use reset plugin in PikaCSS
outline: deep
---

# Reset

The `@pikacss/plugin-reset` provides a modern CSS reset to ensure a consistent baseline across different browsers.

## Installation

::: code-group

```bash [pnpm]
pnpm add -D @pikacss/plugin-reset
```

```bash [yarn]
yarn add -D @pikacss/plugin-reset
```

```bash [npm]
npm install -D @pikacss/plugin-reset
```

:::

## Setup

Add the plugin to your `pika.config.ts`:

::: code-group

```ts [Vite Project]
// pika.config.ts
import { reset } from '@pikacss/plugin-reset'
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
	plugins: [
		reset(),
	],
})
```

```ts [Nuxt Project]
// pika.config.ts
import { reset } from '@pikacss/plugin-reset'
import { defineEngineConfig } from '@pikacss/nuxt-pikacss'

export default defineEngineConfig({
	plugins: [
		reset(),
	],
})
```

:::

## Configuration

You can specify the reset style in your `pika.config.ts`:

```ts
export default defineEngineConfig({
	plugins: [
		reset(),
	],

	reset: 'modern-normalize', // 'normalize' | 'modern-normalize' | 'the-new-css-reset' | 'eric-meyer' | 'andy-bell'
})
```

## Supported Styles

The following reset styles are available:

- `modern-normalize`: [modern-normalize](https://github.com/sindresorhus/modern-normalize) (Default)
- `normalize`: [Normalize.css](https://necolas.github.io/normalize.css/)
- `the-new-css-reset`: [The New CSS Reset](https://github.com/elad2412/the-new-css-reset)
- `eric-meyer`: [Eric Meyer's Reset CSS](https://meyerweb.com/eric/tools/css/reset/)
- `andy-bell`: [A Modern CSS Reset by Andy Bell](https://piccalil.li/blog/a-modern-css-reset/)

## How It Works

The plugin uses the `configureEngine` hook to inject the reset styles into the engine's `preflights`. These styles will be rendered at the beginning of your generated CSS.

````
