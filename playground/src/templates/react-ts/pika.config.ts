/// <reference path="./src/pika.gen.ts" />
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
  variables: {
    definitions: {
      '--color-primary': '#61dafb',
      '--color-bg': '#0f172a',
      '--color-text': '#e2e8f0',
    },
  },
})
