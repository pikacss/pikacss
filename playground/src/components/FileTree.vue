<script setup lang="ts">
import type { DirectoryNode, FileNode, FileSystemTree } from '@webcontainer/api'
import { computed } from 'vue'

const props = defineProps<{
	tree: FileSystemTree
	path?: string // Current accumulated path (e.g. "src/")
	activePath?: string
	depth?: number
}>()

const emit = defineEmits<{
	(e: 'select', path: string, content: string | undefined): void
}>()

const sortedEntries = computed(() => {
	return Object.entries(props.tree)
		.sort(([aName, aNode], [bName, bNode]) => {
		// Sort directories first
			const aIsDir = 'directory' in aNode
			const bIsDir = 'directory' in bNode
			if (aIsDir && !bIsDir)
				return -1
			if (!aIsDir && bIsDir)
				return 1
			return aName.localeCompare(bName)
		})
})

function getFullPath(name: string) {
	return props.path ? `${props.path}/${name}` : name
}

function onClick(name: string, node: DirectoryNode | FileNode | any) {
	if ('file' in node && 'contents' in node.file) {
		// File click
		const fullPath = getFullPath(name)
		const content = typeof node.file.contents === 'string'
			? node.file.contents
			: new TextDecoder()
					.decode(node.file.contents)
		emit('select', fullPath, content)
	}
	else {
		// Directory click (toggle? for now just ignore/expand)
		// Ideally we'd have toggle local state.
		// For this simple version, directories are always expanded.
	}
}
</script>

<template>
	<div :class="pika({ fontSize: '0.875rem', userSelect: 'none' })">
		<div
			v-for="[name, node] in sortedEntries"
			:key="name"
		>
			<!-- File/Folder Row -->
			<div
				:class="[pika({ 'display': 'flex', 'alignItems': 'center', 'paddingTop': '0.25rem', 'paddingBottom': '0.25rem', 'paddingLeft': '0.5rem', 'paddingRight': '0.5rem', 'cursor': 'pointer', 'whiteSpace': 'nowrap', 'overflow': 'hidden', 'textOverflow': 'ellipsis', '$:hover': { backgroundColor: '#2a2d2e' } }), activePath === getFullPath(name) ? pika({ backgroundColor: '#37373d', color: 'white' }) : '']"
				:style="{ paddingLeft: `${(depth || 0) * 12 + 8}px` }"
				@click.stop="onClick(name, node)"
			>
				<!-- Icon -->
				<span
					v-if="'directory' in node"
					:class="pika('i-vscode-icons:default-folder', { width: '1rem', height: '1rem', marginRight: '0.375rem', flexShrink: '0' })"
				/>
				<span
					v-else
					:class="pika('i-vscode-icons:default-file', { width: '1rem', height: '1rem', marginRight: '0.375rem', flexShrink: '0' })"
				/>

				<!-- Name -->
				<span :class="pika({ color: '#d1d5db' })">{{ name }}</span>
			</div>

			<!-- Recursive Children -->
			<div v-if="'directory' in node">
				<FileTree
					:tree="node.directory"
					:path="getFullPath(name)"
					:activePath="activePath"
					:depth="(depth || 0) + 1"
					@select="(p, c) => emit('select', p, c)"
				/>
			</div>
		</div>
	</div>
</template>
