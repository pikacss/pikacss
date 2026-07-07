<script setup lang="ts">
defineProps<{
	modelValue: string
	options: string[]
}>()

defineEmits<{
	(e: 'update:modelValue', value: string): void
	(e: 'select', value: string): void
}>()
</script>

<template>
	<div :class="pika({ display: 'flex', alignItems: 'center', gap: '0.5rem' })">
		<span :class="pika({ fontSize: '0.875rem', color: '#9ca3af' })">Template:</span>
		<select
			:value="modelValue"
			:class="pika({ 'backgroundColor': '#1e1e1e', 'borderWidth': '1px', 'borderColor': '#333', 'color': '#d1d5db', 'fontSize': '0.875rem', 'borderRadius': '0.25rem', 'paddingLeft': '0.5rem', 'paddingRight': '0.5rem', 'paddingTop': '0.25rem', 'paddingBottom': '0.25rem', 'outline': 'none', '$:focus': { borderColor: '#3b82f6' } })"
			@change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value); $emit('select', ($event.target as HTMLSelectElement).value)"
		>
			<option
				v-for="opt in options"
				:key="opt"
				:value="opt"
			>
				{{ opt }}
			</option>
		</select>
	</div>
</template>
