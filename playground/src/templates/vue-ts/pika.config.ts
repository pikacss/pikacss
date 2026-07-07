/// <reference path="./src/pika.gen.ts" />
import { defineEngineConfig } from '@pikacss/unplugin-pikacss'

export default defineEngineConfig({
  variables: {
    definitions: {
      '--color-primary': '#42b883',
      '--color-bg': '#1a1a2e',
      '--color-text': '#e2e8f0',
    },
  },
})
