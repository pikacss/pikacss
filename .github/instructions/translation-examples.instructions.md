---
applyTo:
  - "docs/.examples/zh-TW/**/*"
---

# Traditional Chinese (Taiwan) Example Localization Conventions — PikaCSS

Use this file when localizing example files under `docs/.examples/zh-TW/`.

## Source Of Truth

- English examples under `docs/.examples/` are the only source of truth.
- Every localized example under `docs/.examples/zh-TW/` must mirror the English source 1:1.
- Keep the same relative path, file name, file type, code order, and snippet shape as the English source.
- Do not add, remove, or reorder code, comments, or output blocks unless the English source changes first.

## Localization Workflow

1. Read the English source example under `docs/.examples/`.
2. Create or update the mirrored file under `docs/.examples/zh-TW/` with the same relative path.
3. Translate comments and clearly human-readable explanatory text only.
4. Preserve executable code, identifiers, imports, package names, APIs, file paths, and output semantics.
5. Compare the localized file against the English source to confirm structure and behavior still match.

## Translate Only

- Line comments such as `// ...`
- Block comments such as `/* ... */`
- HTML comments such as `<!-- ... -->`
- Explanatory output comments inside CSS or generated-output examples
- Human-readable descriptive labels embedded in comments

## Keep In English

- Identifiers, variable names, function names, type names, API names, package names
- File names and file paths
- Executable strings whose value is part of program behavior
- Established technical vocabulary when translation would reduce clarity, such as `engine`, `plugin`, `hook`, `selector`, `runtime`, `build-time`, `atomic CSS`, `autocomplete`, and `class names`

## Style Rules

- Write comments in natural Traditional Chinese for Taiwan.
- Prefer concise, engineering-oriented phrasing over literal English sentence order.
- Keep the comment tone aligned with the surrounding example: short, direct, explanatory.
- Avoid mixed-language phrasing when the Chinese wording is already clear and idiomatic.
- If a comment reads like a translation artifact rather than something a Taiwanese engineer would write, rewrite it.
