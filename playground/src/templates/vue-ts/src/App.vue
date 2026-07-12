<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <main
    :class="pika({
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
      fontFamily: 'system-ui, sans-serif',
    })"
  >
    <h1 :class="pika({ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)' })">
      PikaCSS × Vue
    </h1>
    <p :class="pika({ color: '#94a3b8' })">
      <!-- `pika&#40;&#41;` renders as pika(); HTML entities keep the literal out of
           the source so the PikaCSS transform can't rewrite it to '' and Vue's
           template compiler doesn't parse it as an interpolation. -->
      Styles are written with <code>pika&#40;&#41;</code> calls and compiled to atomic CSS at build time.
    </p>
    <button
      type="button"
      :class="pika({
        'padding': '0.625rem 1.25rem',
        'borderRadius': '0.75rem',
        'border': 'none',
        'cursor': 'pointer',
        'fontSize': '1rem',
        'fontWeight': '600',
        'color': '#0f172a',
        'backgroundColor': 'var(--color-primary)',
        '$:hover': { filter: 'brightness(1.1)' },
      })"
      @click="count++"
    >
      count is {{ count }}
    </button>
  </main>
</template>
