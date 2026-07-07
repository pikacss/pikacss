import type { WebContainerProcess } from '@webcontainer/api'
import { WebContainer } from '@webcontainer/api'
import { ref, shallowRef } from 'vue'
// import { files } from '../templates/files';

// Singleton instance
let webcontainerInstance: WebContainer | null = null

// Singleton State
const isBooting = ref(false)
const isInstalling = ref(false)
const isRunning = ref(false)
const iframeUrl = ref<string>('')
const terminalInstance = shallowRef<WebContainerProcess | null>(null)
const instance = shallowRef<WebContainer | null>(null)

export function useWebContainer() {
	/**
	 * Boot the WebContainer and mount the initial file system.
	 */
	async function boot() {
		if (webcontainerInstance)
			return

		try {
			isBooting.value = true
			webcontainerInstance = await WebContainer.boot()
			instance.value = webcontainerInstance
			// await webcontainerInstance.mount(files); // Removed default mount
			isBooting.value = false
		}
		catch (error) {
			console.error('Failed to boot WebContainer:', error)
			isBooting.value = false // Still technically failed
		}
	}

	/**
	 * Run `npm install` inside the container.
	 * Pipe output to a callback if provided.
	 */
	async function install(command: string = 'npm install', onOutput?: (data: string) => void) {
		if (!webcontainerInstance)
			return

		isInstalling.value = true
		const parts = command.split(' ')
		const cmd = parts[0]
		const args = parts.slice(1)

		if (!cmd)
			throw new Error('Invalid execute command')

		const process = await webcontainerInstance.spawn(cmd, args)

		process.output.pipeTo(
			new WritableStream({
				write(data) {
					if (onOutput)
						onOutput(data)
				},
			}),
		)

		const exitCode = await process.exit
		isInstalling.value = false

		if (exitCode !== 0) {
			throw new Error('Installation failed')
		}
	}

	/**
	 * Start the dev server (`npm run dev`).
	 */
	async function startDevServer(command: string = 'npm run dev', onOutput?: (data: string) => void) {
		if (!webcontainerInstance)
			return

		const parts = command.split(' ')
		const cmd = parts[0]
		const args = parts.slice(1)

		if (!cmd)
			throw new Error('Invalid execute command')

		const process = await webcontainerInstance.spawn(cmd, args)
		terminalInstance.value = process

		process.output.pipeTo(
			new WritableStream({
				write(data) {
					if (onOutput)
						onOutput(data)
				},
			}),
		)

		webcontainerInstance.on('server-ready', (_port, url) => {
			iframeUrl.value = url
			isRunning.value = true
		})
	}

	/**
	 * Write a file to the container.
	 */
	async function writeFile(path: string, content: string) {
		if (!webcontainerInstance)
			return
		await webcontainerInstance.fs.writeFile(path, content)
	}

	/**
	 * Read a file from the container.
	 */
	async function readFile(path: string): Promise<string> {
		if (!webcontainerInstance)
			return ''
		try {
			const content = await webcontainerInstance.fs.readFile(path, 'utf-8')
			return content
		}
		catch {
			return ''
		}
	}

	return {
		boot,
		install,
		startDevServer,
		writeFile,
		readFile,
		isBooting,
		isInstalling,
		isRunning,
		iframeUrl,
		instance,
	}
}
