<script setup lang="ts">
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import { onMounted, onUnmounted, ref } from 'vue'
import '@xterm/xterm/css/xterm.css'

const emit = defineEmits<{
	(e: 'ready', term: Terminal): void
}>()
const container = ref<HTMLElement | null>(null)
const terminal = ref<Terminal | null>(null)
const fitAddon = new FitAddon()

onMounted(() => {
	if (!container.value)
		return

	terminal.value = new Terminal({
		theme: {
			background: '#1e1e1e',
		},
		convertEol: true,
	})

	terminal.value.loadAddon(fitAddon)
	terminal.value.open(container.value)
	fitAddon.fit()

	emit('ready', terminal.value)

	emit('ready', terminal.value)

	window.addEventListener('resize', onResize)
})

function onResize() {
	try {
		fitAddon.fit()
	}
	catch {
		// ignore
	}
}

onUnmounted(() => {
	try {
		terminal.value?.dispose()
	}
	catch {
		// ignore
	}
	window.removeEventListener('resize', onResize)
})

function write(data: string) {
	terminal.value?.write(data)
}

defineExpose({
	write,
	fit: () => {
		try {
			fitAddon.fit()
		}
		catch {}
	},
})
</script>

<template>
	<div
		ref="container"
		:class="pika({ width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#1e1e1e' })"
	/>
</template>
