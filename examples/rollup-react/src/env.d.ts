/// <reference types="node" />

// CSS modules
declare module '*.css' {
	const content: Record<string, string>
	export default content
}

// Virtual pika.css
declare module 'virtual:pika.css' {
	const content: void
	export default content
}
