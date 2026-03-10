---
applyTo:
	- "docs/zh-TW/**/*.md"
---

# Traditional Chinese (Taiwan) Translation Conventions — PikaCSS

Use this file when translating English markdown pages into Traditional Chinese for Taiwan.

## Source Of Truth

- English docs under `docs/` are the only source of truth.
- Every translated page under `docs/zh-TW/` must stay structurally identical to its English source.
- Keep the same file name, heading order, paragraph order, callout order, list order, table structure, `## Next` links, and snippet imports.
- Do not add, remove, or reorder content unless the English source changes first.

## Translation Workflow

1. Read the English source page.
2. Translate it into Traditional Chinese for Taiwan.
3. Keep code, identifiers, package names, file names, and snippet semantics unchanged.
4. Rewrite internal docs links to `/zh-TW/...` when the translated counterpart exists; otherwise keep the English route.
5. Point snippet imports to `@/.examples/zh-TW/...` when the mirrored localized example exists.
6. Compare the zh-TW page against the English source to confirm 1:1 structure.

## Language Rules

- Target audience: developers in Taiwan.
- Prefer Taiwan technical usage over mainland wording.
- Use direct, technical prose, but make it read like native Taiwanese technical writing rather than sentence-by-sentence English.
- Keep mixed-language phrasing when the English technical term is clearer and more natural.
- When a term is obviously technical and translation would reduce clarity, keep the English term.
- If a technical term is ambiguous and not listed in the glossary below, stop and ask before standardizing it.
- Prefer smooth, readable Chinese sentence flow over rigid English word order.
- Avoid obvious translation calques such as `這代表`, `這也是`, `本來就是`, `會長這樣` when a simpler native phrasing works better.
- Preserve emphasis in tone, not by copying English sentence shape.
- Rewrite any sentence that still sounds translated.

## Terminology Glossary

### Keep In English

- engine
- build-time
- atomic CSS
- virtual module
- generated files
- plugin / plugins
- hook / hooks
- selector / selectors
- config / configuration
- runtime
- autocomplete
- bundler
- class names

### Translate To Traditional Chinese (Taiwan)

- theme -> 主題
- theming -> 主題化
- docs -> 文件
- example -> 範例
- generated CSS output file -> 產生的 CSS 輸出檔

## Taiwan Wording Baseline

- Prefer Taiwan wording such as `設定`, `檔案`, `模組`, `原始碼`, `程式碼`, `匯入`, `匯出`, `全域`, `變數`, `函式`, `巢狀`, `物件`, `用戶端`, `伺服器`, `連結`, and `搜尋`.
- Use the cn2tw4programmer mapping provided by the repository owner as the default wording reference for general terms.
- Do not force translation for product names, APIs, package names, or established English technical vocabulary.

## Links And Snippets

- zh-TW markdown pages should import localized example copies from `@/.examples/zh-TW/...` when that mirrored file exists.
- Keep all code blocks, inline identifiers, package names, and file paths unchanged.
- Internal links in zh-TW pages must point to the zh-TW route when the translated counterpart exists.
- If the translated counterpart does not exist yet, temporarily link back to the English route to avoid dead links during progressive rollout.
