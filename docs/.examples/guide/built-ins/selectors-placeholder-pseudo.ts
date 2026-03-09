import { defineSelector } from '@pikacss/core'

// $ is replaced with the element's default selector (e.g., .%)
// Then % is replaced with the atomic style ID (e.g., pk-a)

// Pseudo-class: append to the element selector
const hover = defineSelector(['hover', '$:hover'])
//   $ → .%  →  .%:hover  →  .pk-a:hover

// Pseudo-element: append to the element selector
const before = defineSelector(['before', '$::before'])
//   $ → .%  →  .%::before  →  .pk-a::before

// Ancestor selector: place $ after the parent
const dark = defineSelector(['dark', '[data-theme="dark"] $'])
//   $ → .%  →  [data-theme="dark"] .%  →  [data-theme="dark"] .pk-a

// At-rules: no $ needed — the engine auto-appends the element selector
const md = defineSelector(['md', '@media (min-width: 768px)'])
//   no $, no %  →  defaultSelector (.%) is appended  →  two-level nesting:
//   @media (min-width: 768px) { .pk-a { ... } }
