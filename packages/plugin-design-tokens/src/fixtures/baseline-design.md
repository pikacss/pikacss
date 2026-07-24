# Design tokens (baseline)

Base tokens live in a fenced `tokens` block. Only blocks whose info string
starts with `tokens` are read; everything else is ignored.

```tokens
{
  "color": {
    "primary": { "$value": "#3b82f6", "$type": "color" },
    "accent": { "$value": "{color.primary}", "$type": "color" }
  }
}
```

Theme overrides carry `theme=` and `selector=` attributes on the info string.

```tokens theme=dark selector=.dark
{
  "color": {
    "primary": { "$value": "#60a5fa", "$type": "color" }
  }
}
```
