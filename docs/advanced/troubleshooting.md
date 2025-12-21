---
title: Troubleshooting
description: Common issues and solutions when working with PikaCSS
outline: deep
---

# Troubleshooting

Common issues and solutions when working with PikaCSS.

## Build Errors

### "Cannot find module 'pika.gen.ts'"

**Cause**: The TypeScript type definition file hasn't been generated yet.

**Solution**:
1. Ensure your bundler plugin is configured correctly
2. Run the dev server once to trigger generation
3. Add to `tsconfig.json`:

```json
{
	"include": ["src/**/*", "pika.gen.ts"]
}
```

### "pika is not defined"

**Cause**: The `pika` function import is missing or the bundler isn't transforming the code.

**Solution**:
1. Check that the PikaCSS plugin is added to your bundler config
2. Ensure the file is included in `scan.include` pattern
3. For TypeScript, add the reference:

```typescript
/// <reference path="./pika.gen.ts" />
```

## Styles Not Applying

### Styles not visible in browser

**Possible causes**:
1. Virtual CSS module not imported
2. CSS file not generated
3. Class names not being applied

**Solutions**:
1. Import the virtual module in your entry file:

```typescript
import 'pika.css'
```

2. Check if `pika.gen.css` is being generated (look in your project root)

3. Inspect the generated HTML to verify class names are present

### Styles appearing but wrong

**Cause**: Conflicting styles or specificity issues.

**Solutions**:
1. Use `__important: true` to increase specificity:

```typescript
pika({ __important: true, color: 'red' })
```

2. Check for conflicting CSS from other sources

3. Verify the selector configuration in `pika.config.ts`

## Hot Module Replacement (HMR)

### Styles not updating on save

**Possible causes**:
1. HMR not configured properly
2. File not being watched
3. Virtual module caching issue

**Solutions**:
1. Restart the dev server
2. Check that files are in `scan.include` pattern
3. Clear the bundler cache:

```bash
# Vite
rm -rf node_modules/.vite

# Webpack
rm -rf node_modules/.cache
```

### New styles added but old ones remain

**Cause**: The CSS generation is additive during development.

**Solution**: This is expected behavior. Unused styles are pruned during production build.

## TypeScript Issues

### No autocomplete for shortcuts

**Cause**: `pika.gen.ts` is outdated or not generated.

**Solutions**:
1. Save a file that uses `pika()` to trigger regeneration
2. Restart the TypeScript server in VS Code:
   - `Cmd+Shift+P` → "TypeScript: Restart TS Server"

### Type errors with custom properties

**Cause**: CSS custom properties not recognized.

**Solution**: Add them to variables config:

```typescript
variables: {
  variables: {
    '--my-custom-prop': 'value'
  }
}
```

## Plugin Issues

### Plugin not loading

**Cause**: Plugin not added to config or incorrect import.

**Solution**:

```typescript
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
	plugins: [
		icons() // Don't forget to call the function!
	]
})
```

### Plugin configuration not applied

**Cause**: Config in wrong location.

**Solution**: Plugin configs go at the root level, not inside `plugins`:

```typescript
export default defineEngineConfig({
	plugins: [icons()],
	icons: { // Plugin config at root
		prefix: 'i-',
		scale: 1.2
	}
})
```

## Performance Issues

### Build is slow

**Solutions**:
1. Narrow down `scan.include` patterns:

```typescript
PikaCSS({
	scan: {
		include: ['src/**/*.{tsx,vue}'], // Be specific
		exclude: ['**/*.test.*', '**/*.spec.*']
	}
})
```

2. Enable CSS caching (usually default)

### Large CSS output

**Solutions**:
1. Enable `pruneUnused` for variables:

```typescript
variables: {
	pruneUnused: true
}
```

2. Review shortcuts for unused patterns

3. Production build automatically prunes unused styles

## Debugging Tips

### Inspect generated CSS

Check the `pika.gen.css` file to see all generated atomic styles.

### View style mapping

In development, hover over `pika()` calls in VS Code to see the generated CSS preview.

### Check atomic style IDs

Add a temporary log to see what's being generated:

```typescript
const classes = pika({ color: 'red' })
console.log('Generated classes:', classes)
```

### Verify configuration

Add a log to check config is loaded:

```typescript
// pika.config.ts
const config = defineEngineConfig({ ... })
console.log('PikaCSS config loaded:', config)
export default config
```

## Common Mistakes

### Using runtime variables in `pika()`

❌ **Won't work** (evaluated at build time):

```typescript
const color = getThemeColor()
pika({ color }) // Error: color is undefined at build time
```

✅ **Use CSS variables instead**:

```typescript
pika({ color: 'var(--theme-color)' })
```

### Forgetting to call plugin functions

❌ **Wrong**:

```typescript
plugins: [icons] // Missing ()
```

✅ **Correct**:

```typescript
plugins: [icons()]
```

### Confusing `&` and `$` in selectors

Both `&` and `$` are valid but have different meanings:

| Symbol | Meaning | Usage |
|--------|---------|-------|
| `$` | PikaCSS syntax - refers to the generated atomic class | Use for pseudo-classes on the atomic class |
| `&` | CSS native nesting - refers to the parent selector | Use for CSS native nesting behavior |

```typescript
// Using $ (PikaCSS self-reference)
pika({ '$:hover': { color: 'red' } })
// Results in: .generated-class:hover { color: red }

// Using & (CSS native nesting)
pika({ '&:hover': { color: 'red' } })
// Results in parent-relative selector (CSS nesting behavior)
```

::: tip
Use `$` when you want to add pseudo-classes/elements to the generated atomic class itself. Use `&` when you need CSS native nesting behavior.
:::

## Getting Help

If you're still stuck:

1. Check the [GitHub Issues](https://github.com/pikacss/pikacss/issues) for similar problems
2. Search the [Examples](https://github.com/pikacss/pikacss/tree/main/examples) for working configurations
3. Open a new issue with:
   - PikaCSS version
   - Build tool and version
   - Minimal reproduction
   - Error messages
