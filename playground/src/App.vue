<script setup lang="ts">
import type { DockviewApi, DockviewReadyEvent } from 'dockview-vue'
import { DockviewVue } from 'dockview-vue'
import { markRaw, onMounted, ref, shallowRef, watch } from 'vue'
import EditorPanel from './components/panels/EditorPanel.vue'
import ExplorerPanel from './components/panels/ExplorerPanel.vue'
import PreviewPanel from './components/panels/PreviewPanel.vue'
import TerminalPanel from './components/panels/TerminalPanel.vue'
import TemplateSelector from './components/TemplateSelector.vue'
import { useMonacoConfig } from './composables/useMonacoConfig'
import { getCachedSnapshot, putCachedSnapshot } from './composables/useSnapshotCache'
import { useWebContainer } from './composables/useWebContainer'
import {
	activeFilePath,
	getInitialTemplateKey,
	handleTemplateSwitch,
	loadFromHash,
	onFileSelect,
	projectTree,
	selectedTemplate,
	writeToTerminal,
} from './composables/useWorkbench'
import { templates } from './templates'

defineOptions({
	components: {
		ExplorerPanel,
		EditorPanel,
		PreviewPanel,
		TerminalPanel,
	},
})

// -- Dependencies --
const { boot, install, mountCachedSnapshot, exportSnapshot, startDevServer, isBooting, isInstalling, isRunning, instance } = useWebContainer()
const { loadMonacoConfig, loadPikaGlobals } = useMonacoConfig()

const initialTemplateKey = getInitialTemplateKey()
// Whether this session mounted a cached snapshot instead of installing. When it
// did not, we export + cache the freshly installed deps once the dev server is
// ready, so the next visit is fast.
const usedCachedSnapshot = ref(false)
watch(isRunning, async (running) => {
	if (!running || usedCachedSnapshot.value)
		return
	const gz = await exportSnapshot()
	if (gz)
		await putCachedSnapshot(initialTemplateKey, templates[initialTemplateKey]!.files, gz)
}, { once: true })

// -- Dockview Config --
const dockviewApi = shallowRef<DockviewApi | null>(null)

// Update Editor Title when active file changes
watch(activeFilePath, (path) => {
	if (dockviewApi.value) {
		const panel = dockviewApi.value.getPanel('editor')
		if (panel) {
			panel.setTitle(path)
		}
	}
})

// Register components with markRaw
// Using shallowRef to avoid deep reactivity overhead, though regular object + markRaw is also fine.
const panelComponents = {
	ExplorerPanel: markRaw(ExplorerPanel),
	EditorPanel: markRaw(EditorPanel),
	PreviewPanel: markRaw(PreviewPanel),
	TerminalPanel: markRaw(TerminalPanel),
}

function createDefaultLayout(api: DockviewApi) {
	api.clear()

	// Create Layout
	// 3 Columns: [Explorer] | [Editor] | [Right Group: Preview / Terminal]

	const explorer = api.addPanel({
		id: 'explorer',
		component: 'ExplorerPanel',
		title: 'EXPLORER',
		params: { tabHeight: 0 },
	})

	// Editor to the right of Explorer
	const editor = api.addPanel({
		id: 'editor',
		component: 'EditorPanel',
		title: activeFilePath.value || 'EDITOR',
		position: { referencePanel: explorer, direction: 'right' },
	})

	// Preview to the right of Editor
	const preview = api.addPanel({
		id: 'preview',
		component: 'PreviewPanel',
		title: 'PREVIEW',
		position: { referencePanel: editor, direction: 'right' },
	})

	// Terminal below Preview
	api.addPanel({
		id: 'terminal',
		component: 'TerminalPanel',
		title: 'TERMINAL',
		position: { referencePanel: preview, direction: 'below' },
	})
}

function onReady(event: DockviewReadyEvent) {
	try {
		const api = event.api
		dockviewApi.value = api
		createDefaultLayout(api)
	}
	catch (e) {
		console.error('Dockview onReady failed:', e)
	}
}

function onResetLayout() {
	if (dockviewApi.value) {
		createDefaultLayout(dockviewApi.value)
	}
}

// -- Lifecycle --
onMounted(async () => {
	loadFromHash()

	// Set initial content for the default active file
	onFileSelect(activeFilePath.value)

	// Boot
	try {
		const config = templates[initialTemplateKey]!

		if (!isBooting.value) {
			await boot()
		}

		if (instance.value) {
			// Try a cached dependency snapshot from a previous visit (IndexedDB),
			// which lets us skip the slow in-browser npm install.
			const cached = await getCachedSnapshot(initialTemplateKey, config.files)
			usedCachedSnapshot.value = cached != null && await mountCachedSnapshot(cached)
			if (usedCachedSnapshot.value)
				writeToTerminal('\r\n\x1b[32mMounted cached dependencies; skipping install.\x1b[0m\r\n')

			// Mount the current template source (incl. URL-hash edits) on top,
			// leaving any snapshot node_modules in place.
			await instance.value.mount(projectTree)

			if (!usedCachedSnapshot.value)
				await install(config.installCommand, data => writeToTerminal(data))

			// Load types and config from VFS in background. Declare the `pika`
			// global afterwards (loadTypes calls setExtraLibs, which would otherwise
			// wipe it) so the editor stops reporting "Cannot find name 'pika'".
			loadMonacoConfig(instance.value)
				.catch(e => console.error('[MonacoConfig] Failed:', e))
				.finally(() => loadPikaGlobals())
		}

		await startDevServer(config.devCommand, data => writeToTerminal(data))
	}
	catch (e) {
		console.error('Boot Failed', e)
		writeToTerminal(`\r\n\x1b[31mBoot Failed: ${e}\x1b[0m\r\n`)
	}
})

const templateOptions = Object.keys(templates)
</script>

<template>
	<div :class="pika({ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', color: 'white' })">
		<!-- Header -->
		<header :class="pika({ height: '3rem', borderBottomWidth: '1px', borderBottomColor: '#374151', display: 'flex', alignItems: 'center', paddingLeft: '1rem', paddingRight: '1rem', flexShrink: '0', backgroundColor: '#252526' })">
			<h1 :class="pika({ fontSize: '0.875rem', fontWeight: 'bold', color: '#d1d5db', marginRight: '1rem' })">
				PikaCSS Playground
			</h1>
			<TemplateSelector
				:modelValue="selectedTemplate"
				:options="templateOptions"
				@select="handleTemplateSwitch"
			/>
			<div
				v-if="isBooting"
				:class="pika({ marginLeft: 'auto', fontSize: '0.75rem', color: '#6b7280' })"
			>
				Booting...
			</div>
			<div
				v-else-if="isInstalling"
				:class="pika({ marginLeft: 'auto', fontSize: '0.75rem', color: '#60a5fa' })"
			>
				Installing...
			</div>
			<div
				v-else-if="isRunning"
				:class="pika({ marginLeft: 'auto', fontSize: '0.75rem', color: '#4ade80' })"
			>
				Ready
			</div>

			<button
				:class="pika({
					marginLeft: '1rem',
					fontSize: '0.75rem',
					padding: '0.25rem 0.5rem',
					borderRadius: '0.25rem',
					backgroundColor: '#374151',
					color: '#d1d5db',
					border: 'none',
					cursor: 'pointer',
					transition: 'background-color 0.2s',
				})"
				@click="onResetLayout"
			>
				Reset Layout
			</button>
		</header>

		<!-- Main Content -->
		<main :class="pika({ flex: '1 1 0%', display: 'flex', overflow: 'hidden' })">
			<DockviewVue
				:components="panelComponents"
				class="dockview-theme-abyss"
				@ready="onReady"
			/>
		</main>
	</div>
</template>

<style>
/* Dockview styling */
@import 'dockview-core/dist/styles/dockview.css';

.dockview-theme-abyss {
    height: 100%;
    width: 100%;
}
</style>
