<script setup lang="ts">
defineProps<{
  label: string
  description: string
  checked: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()

const rowClass = pika({
  'display': 'flex',
  'alignItems': 'center',
  'justifyContent': 'space-between',
  'gap': '1rem',
  'padding': '0.625rem 0',
  '$:not(:last-child)': { borderBottom: '1px solid var(--border)' },
})

const textClass = pika({ display: 'flex', flexDirection: 'column', gap: '0.125rem' })
const labelClass = pika({ fontSize: '0.875rem', fontWeight: '500' })
const descClass = pika({ fontSize: '0.75rem', color: 'var(--text-muted)' })

// Conflicting declarations (track color, knob transform) live in exactly one
// applied class per state — never in the shared `switch-track` shortcut — so
// atomic CSS ordering can never flip a state.
const trackOnClass = pika('switch-track', {
  'backgroundColor': 'var(--accent)',
  '$::before': { transform: 'translate(1rem, -50%)' },
})
const trackOffClass = pika('switch-track', {
  'backgroundColor': 'var(--switch-off)',
  '$::before': { transform: 'translate(0, -50%)' },
})
</script>

<template>
  <div :class="rowClass">
    <span :class="textClass">
      <span :class="labelClass">{{ label }}</span>
      <span :class="descClass">{{ description }}</span>
    </span>
    <button
      type="button"
      role="switch"
      :aria-checked="checked"
      :aria-label="label"
      :class="checked ? trackOnClass : trackOffClass"
      @click="$emit('toggle')"
    />
  </div>
</template>
