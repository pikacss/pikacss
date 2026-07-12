<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWebContainer } from '../../composables/useWebContainer'
import { isResizing } from '../../composables/useWorkbench'

defineOptions({ name: 'PreviewPanel' })

const { iframeUrl, isRunning, isBooting, isInstalling } = useWebContainer()

// The dev server signals `server-ready` before PikaCSS has generated
// `pika.gen.css`, so the first paint of the preview is unstyled (Vite's CSS HMR
// update does not retroactively style the already-rendered page). Reload the
// iframe once, shortly after it first appears, so it picks up the generated CSS.
const reloadKey = ref(0)
let reloadedOnce = false
watch(iframeUrl, (url) => {
	if (url && !reloadedOnce) {
		reloadedOnce = true
		setTimeout(() => reloadKey.value++, 1500)
	}
})
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
			:key="reloadKey"
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
