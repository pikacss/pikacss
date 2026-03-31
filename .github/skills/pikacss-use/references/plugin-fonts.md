# Plugin: Fonts

> Read this when the user asks about web font loading, Google Fonts integration, custom @font-face, or font shortcuts.

## Installation

```bash
pnpm add -D @pikacss/plugin-fonts
```

## Setup

```ts
// pika.config.ts
import { defineEngineConfig } from '@pikacss/core'
import { fonts } from '@pikacss/plugin-fonts'

export default defineEngineConfig({
  plugins: [fonts()],
})
```

## Usage in pika()

Fonts creates `font-{token}` shortcuts:

```ts
pika('font-sans')
pika('font-display', { 'font-weight': '700' })
```

## Configuration

Set via the `fonts` key on `EngineConfig`:

### Google Fonts (default provider)

```ts
export default defineEngineConfig({
  fonts: {
    provider: 'google',  // default
    fonts: {
      sans: 'Inter',
      display: 'Playfair Display:400,700',
      mono: [{ name: 'JetBrains Mono', weights: [400, 700] }],
    },
  },
  plugins: [fonts()],
})
```

### Custom @font-face

```ts
export default defineEngineConfig({
  fonts: {
    faces: [
      {
        fontFamily: 'MyCustomFont',
        src: 'url(/fonts/custom.woff2) format("woff2")',
        fontWeight: '400',
        fontDisplay: 'swap',
      },
    ],
    fonts: {
      brand: { name: 'MyCustomFont', provider: 'none' },
    },
  },
  plugins: [fonts()],
})
```

### Raw @import

```ts
export default defineEngineConfig({
  fonts: {
    imports: ['url(https://fonts.googleapis.com/css2?family=Roboto&display=swap)'],
    families: { sans: 'Roboto, sans-serif' },
  },
  plugins: [fonts()],
})
```

## Key Options

| Option | Type | Default | Purpose |
|---|---|---|---|
| `provider` | `string` | `'google'` | Default font provider |
| `fonts` | `Record<token, FontFamilyEntry>` | — | Font token definitions |
| `families` | `Record<string, string>` | — | Raw CSS font-family stacks |
| `faces` | `FontFaceDefinition[]` | — | Explicit @font-face rules |
| `imports` | `string[]` | — | Raw @import rules |
| `display` | `string` | `'swap'` | font-display value |
| `providers` | `Record<string, Provider>` | — | Custom provider definitions |

### FontFamilyEntry

- **String form**: `'Roboto'` or `'Roboto:400,700'`
- **Object form**: `{ name: 'Roboto', weights: [400, 700], italic: true, provider: 'google' }`
