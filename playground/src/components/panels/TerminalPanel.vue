<script setup lang="ts">
import { ref, watch } from 'vue'
import { terminalInstance, terminalOutput } from '../../composables/useWorkbench'

// Terminal ref needs to be exposed or managed?
// In App.vue, terminalRef was used to write data.
// We need to access this terminal instance from useWebContainer logic in App.vue?
// App.vue passed `(data) => terminalRef.value?.write(data)` to `install` and `startDevServer`.
// With this refactor, App.vue no longer has direct access to the template ref of TerminalPanel (because it's rendered by Dockview).
// We need a way to communicate. Event Bus? Or store the terminal instance in useWorkbench/Store?

// Better: Move `terminalRef` to useWorkbench or a new singleton useTerminal?
// If we have only one terminal.

import Terminal from '../Terminal.vue'

defineOptions({ name: 'TerminalPanel' }) // We need to add this

const terminalRef = ref<InstanceType<typeof Terminal> | null>(null)

watch(terminalRef, (el) => {
	if (el) {
		terminalInstance.value = el
		// Restore history
		if (terminalOutput.value) {
			el.write(terminalOutput.value)
		}
	}
})

// Handle resizing
// Dockview handles resizing of the container, but XTerm needs to be told to fit to the new dimensions.
// We can use a ResizeObserver on the container.

// props.api.onDidDimensionsChange(() => {
//    terminalRef.value?.fit()
// })
</script>

<template>
	<div class="terminal-panel">
		<div class="terminal-content">
			<Terminal ref="terminalRef" />
		</div>
	</div>
</template>

<style scoped>
.terminal-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-top: 1px solid #374151; /* Keep border? Maybe redundant with Dockview splitters. Let's remove top border if dockview has it. */
    /* Actually standard splitpanes had no borders, dockview has. */
    /* I'll un-style the border-top. */
}

.terminal-content {
    flex: 1;
    background-color: #1e1e1e;
    padding: 0.5rem;
    overflow: hidden;
}
</style>
