# @pikacss/plugin-typography

Typography plugin for PikaCSS. Provides `prose` shortcuts for styling long-form content.

## Installation

```bash
pnpm add -D @pikacss/plugin-typography
```

## Usage

```ts
import { defineEngineConfig } from '@pikacss/core'
import { typography } from '@pikacss/plugin-typography'

export default defineEngineConfig({
  plugins: [typography()],
})
```

Then use in templates:

```vue
<article :class="pika('prose')">
  <h1>Title</h1>
  <p>Content with beautiful typography.</p>
</article>
```

## Documentation

See the [full documentation](https://pikacss.com/official-plugins/typography).

## License

MIT
