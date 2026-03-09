// In a Vue component template or any supported file:
// The `pika()` function accepts style definition objects
// and returns atomic CSS class names at build time.

// Single style object
const className = pika({
	color: 'red',
	fontSize: '16px',
})
// At build time, this becomes something like: "pk-a pk-b"
// where `pk-a` → `.pk-a { color: red }` and `pk-b` → `.pk-b { font-size: 16px }`
