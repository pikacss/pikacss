<script setup lang="ts">
import { activeFileContent, activeFilePath, isReadOnly } from '../../composables/useWorkbench'
import MonacoEditor from '../MonacoEditor.vue'

defineOptions({ name: 'EditorPanel' })

// We need to map activeFilePath to language
function getLanguage(path: string) {
	if (path.endsWith('.css'))
		return 'css'
	if (path.endsWith('.html'))
		return 'html'
	if (path.endsWith('.json'))
		return 'json'
	return 'typescript'
}
</script>

<template>
	<div class="editor-panel">
		<div class="editor-content">
			<MonacoEditor
				v-model="activeFileContent"
				:language="getLanguage(activeFilePath)"
				:path="`file:///${activeFilePath}`"
				:readOnly="isReadOnly"
			/>
		</div>
	</div>
</template>

<style scoped>
.editor-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #1e1e1e;
}

.editor-content {
    flex: 1;
    overflow: hidden;
}
</style>
