<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWebContainer } from '../../composables/useWebContainer'
import { isResizing, terminalOutput } from '../../composables/useWorkbench'

defineOptions({ name: 'PreviewPanel' })

const { iframeUrl, isRunning, isBooting, isInstalling } = useWebContainer()

// The dev server signals `server-ready` before PikaCSS has generated
// `pika.gen.css`, so the first paint of the preview is unstyled and Vite's CSS
// HMR update does not retroactively style the already-rendered page. Reload the
// iframe once — ideally right after the first `pika.gen.css` HMR update appears
// (the CSS is now ready), with a timed fallback in case that log never shows.
const reloadKey = ref(0)
let reloadedOnce = false
function reloadOnce() {
	if (reloadedOnce)
		return
	reloadedOnce = true
	reloadKey.value++
}
watch([iframeUrl, terminalOutput], ([url, output]) => {
	if (!url || reloadedOnce)
		return
	// The first `hmr update … pika.gen.css` means the atomic CSS is generated.
	if (output.includes('hmr update') && output.includes('pika.gen.css'))
		setTimeout(reloadOnce, 300)
})
watch(iframeUrl, (url) => {
	if (url)
		setTimeout(reloadOnce, 4000)
})
</script>

<template>
	<div class="preview-panel">
		<div
			v-if="!isRunning"
			class="preview-placeholder"
		>
			<span v-if="isBooting">Starting WebContainer…</span>
			<span v-else-if="isInstalling">Installing dependencies… (first load only — cached for next time). You can already edit the code.</span>
			<span v-else>Starting dev server…</span>
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
