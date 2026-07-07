/// <reference path="./src/pika.gen.ts" />
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
  // Design tokens as CSS variables (unused ones are pruned from the output).
  variables: {
    definitions: {
      '--color-primary': '#2c4f7c',
      '--color-accent': '#66e6ac',
      '--color-bg': '#0f172a',
      '--color-text': '#e2e8f0',
      '--radius': '0.75rem',
    },
  },

  // Reusable style shortcuts, composable from other shortcuts.
  shortcuts: {
    definitions: [
      ['card', {
        backgroundColor: 'rgb(255 255 255 / 0.06)',
        borderRadius: 'var(--radius)',
        padding: '2rem',
        border: '1px solid rgb(255 255 255 / 0.1)',
      }],
      ['btn', {
        'display': 'inline-flex',
        'alignItems': 'center',
        'gap': '0.5rem',
        'padding': '0.625rem 1.25rem',
        'borderRadius': 'var(--radius)',
        'border': 'none',
        'cursor': 'pointer',
        'fontSize': '1rem',
        'fontWeight': '600',
        'color': '#0f172a',
        'backgroundColor': 'var(--color-accent)',
        'transition': 'transform 0.15s ease, filter 0.15s ease',
        '$:hover': {
          filter: 'brightness(1.1)',
          transform: 'translateY(-1px)',
        },
      }],
    ],
  },
})
