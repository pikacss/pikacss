<script setup lang="ts">
import { activeFilePath, onFileSelect, projectTree } from '../../composables/useWorkbench'
import FileTree from '../FileTree.vue'

defineOptions({ name: 'ExplorerPanel' })
</script>

<template>
	<div class="explorer-panel">
		<div class="panel-content">
			<FileTree
				:tree="projectTree"
				:activePath="activeFilePath"
				@select="onFileSelect"
			/>
		</div>
	</div>
</template>

<style scoped>
.explorer-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #252526;
}

.panel-content {
    flex: 1;
    overflow: auto;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
}
</style>
