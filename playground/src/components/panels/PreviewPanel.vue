<script setup lang="ts">
import { useWebContainer } from '../../composables/useWebContainer'
import { isResizing } from '../../composables/useWorkbench'

defineOptions({ name: 'PreviewPanel' })

const { iframeUrl, isRunning, isBooting, isInstalling } = useWebContainer()
</script>

<template>
	<div class="preview-panel">
		<div
			v-if="!isRunning"
			class="preview-placeholder"
		>
			<span v-if="isBooting">Starting WebContainer...</span>
			<span v-else-if="isInstalling">Installing dependencies...</span>
			<span v-else>Waiting for server...</span>
		</div>
		<iframe
			v-if="iframeUrl"
			:src="iframeUrl"
			class="preview-iframe"
			:style="{ pointerEvents: isResizing ? 'none' : 'auto' }"
		/>
	</div>
</template>

<style scoped>
.preview-panel {
    height: 100%;
    background-color: white;
    position: relative;
}

.preview-placeholder {
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    background-color: #1e1e1e;
}

.preview-iframe {
    width: 100%;
    height: 100%;
    border-style: none;
}
</style>
