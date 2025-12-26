---
title: Troubleshooting
description: PikaCSS troubleshooting guide for LLMs
outline: deep
llmstxt:
  description: PikaCSS troubleshooting - common errors, debugging tips, common mistakes
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
pikacss({
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

❌ **Won't work** (dynamic prop):
```typescript
function Button({ variant }) {
  // variant is only known at runtime
  pika({ backgroundColor: variant === 'primary' ? 'blue' : 'gray' })
}
```

✅ **Use CSS variables instead**:
```typescript
// Define styles with CSS variables
const buttonClass = pika({ 
  backgroundColor: 'var(--btn-color)' 
})

// Set the variable at runtime
function Button({ variant }) {
  const color = variant === 'primary' ? 'blue' : 'gray'
  return (
    <button 
      className={buttonClass} 
      style={{ '--btn-color': color }}
    >
      Click me
    </button>
  )
}
```

✅ **Or use conditional shortcuts**:
```typescript
function Button({ variant }) {
  const classes = variant === 'primary' 
    ? pika('btn-primary') 
    : pika('btn-secondary')
  return <button className={classes}>Click me</button>
}
```

:::tip Why This Limitation?
PikaCSS is a **zero runtime** library. All style transformations happen at **build time**. The bundler plugin analyzes source code during the build process and extracts `pika()` calls to generate atomic CSS. Runtime values don't exist during build, so they cannot be included in the generated CSS.

**Benefits:**
- Zero JavaScript overhead in the browser
- Optimal CSS bundle size (only used styles)
- Better performance (no style computation at runtime)

**For dynamic styling:**
- Use CSS custom properties (CSS variables)
- Use conditional class application with pre-defined shortcuts
- Combine multiple static `pika()` calls conditionally
:::

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

- **`&`**: CSS native nesting syntax - refers to the parent selector in nested context
- **`$`**: PikaCSS syntax - refers to the generated atomic class itself

```typescript
// Using & (CSS native nesting)
pika({ '&:hover': { color: 'red' } })
// Results in parent-relative selector (CSS nesting behavior)

// Using $ (PikaCSS self-reference)
pika({ '$:hover': { color: 'red' } })
// Results in: .generated-class:hover { color: red }
```

⚠️ **Choose based on your intent**: Use `$` when you want to add pseudo-classes/elements to the generated atomic class itself. Use `&` when you need CSS native nesting behavior.
