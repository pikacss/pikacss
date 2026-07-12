import type { FileSystemTree } from '@webcontainer/api'
import type Terminal from '../components/Terminal.vue'
import { useDebounceFn } from '@vueuse/core'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { reactive, ref, watch } from 'vue'
import { templates } from '../templates'
import { useWebContainer } from './useWebContainer'

// Singleton state
// The app may be served under a sub-path (e.g. /playground/), so the template
// segment is whatever follows the Vite base URL. A `?template=` query param
// overrides it (used by the snapshot generator so it doesn't depend on routing).
const BASE_URL = import.meta.env.BASE_URL
const pathTemplateKey = window.location.pathname.startsWith(BASE_URL)
	? window.location.pathname.slice(BASE_URL.length)
		.split('/')[0]
	: window.location.pathname.split('/')[1]
const requestedTemplateKey = new URLSearchParams(window.location.search)
	.get('template') || pathTemplateKey
const initialTemplateKey = (requestedTemplateKey && Object.hasOwn(templates, requestedTemplateKey))
	? requestedTemplateKey as keyof typeof templates
	: 'solid-ts'

export const selectedTemplate = ref<string>(initialTemplateKey)
export const activeFilePath = ref<string>(templates[initialTemplateKey]!.entryFile)
export const activeFileContent = ref<string>('')
export const isReadOnly = ref(false)
export const isResizing = ref(false)
export const projectTree = reactive<FileSystemTree>(JSON.parse(JSON.stringify(templates[initialTemplateKey]!.files)))
export const terminalInstance = ref<InstanceType<typeof Terminal> | null>(null)
export const terminalOutput = ref('')

const { writeFile } = useWebContainer()

// Helper functions (internal)
export function writeToTerminal(data: string) {
	terminalOutput.value += data
	terminalInstance.value?.write(data)
}
function flattenTree(tree: FileSystemTree, prefix = ''): Record<string, string> {
	const result: Record<string, string> = {}
	for (const [name, node] of Object.entries(tree)) {
		const path = prefix ? `${prefix}/${name}` : name
		if ('file' in node) {
			if ('contents' in node.file && typeof node.file.contents === 'string') {
				result[path] = node.file.contents
			}
		}
		else if ('directory' in node) {
			Object.assign(result, flattenTree(node.directory, path))
		}
	}
	return result
}

function updateTreeFromMap(tree: FileSystemTree, map: Record<string, string>, prefix = '') {
	for (const [name, node] of Object.entries(tree)) {
		const path = prefix ? `${prefix}/${name}` : name
		if ('file' in node) {
			if (map[path] !== undefined && 'contents' in node.file) {
				node.file.contents = map[path]
			}
		}
		else if ('directory' in node) {
			updateTreeFromMap(node.directory, map, path)
		}
	}
}

// Actions
export async function onFileSelect(path: string) {
	activeFilePath.value = path

	const segments = path.split('/')
	let current: any = projectTree
	for (const segment of segments) {
		if (current[segment]?.directory) {
			current = current[segment].directory
		}
		else if (current[segment]?.file) {
			const file = current[segment].file
			const content = typeof file.contents === 'string' ? file.contents : ''
			activeFileContent.value = content
			isReadOnly.value = false
			return
		}
		else {
			break
		}
	}
}

export function handleTemplateSwitch(key: string) {
	if (key === selectedTemplate.value)
		return
	window.location.href = `${BASE_URL}${key}`
}

export const updateHash = useDebounceFn(() => {
	const flatMap = flattenTree(projectTree)
	const hash = compressToEncodedURIComponent(JSON.stringify(flatMap))
	window.history.replaceState(null, '', `#${hash}`)
}, 1000)

export function loadFromHash() {
	const hash = window.location.hash.slice(1)
	if (!hash)
		return false
	try {
		const json = decompressFromEncodedURIComponent(hash)
		if (json) {
			const map = JSON.parse(json)
			updateTreeFromMap(projectTree, map)
			return true
		}
	}
	catch (e) {
		console.error('Failed to load from hash', e)
	}
	return false
}

// Watcher for content changes
watch(activeFileContent, useDebounceFn(async (newVal) => {
	const segments = activeFilePath.value.split('/')
	let current: any = projectTree
	let targetNode: any = null

	for (const segment of segments) {
		if (current[segment]?.directory) {
			current = current[segment].directory
		}
		else if (current[segment]?.file) {
			targetNode = current[segment].file
			break
		}
	}

	if (targetNode) {
		if (targetNode.contents === newVal) {
			return
		}
		targetNode.contents = newVal
	}

	await writeFile(activeFilePath.value, newVal)
	updateHash()
}, 500))

export function getInitialTemplateKey() {
	return initialTemplateKey
}
