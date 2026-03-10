// 在 Vue 元件模板或任何支援的檔案中：
// `pika()` 函式接受 style definition objects
// 並在 build-time 回傳 atomic CSS class names。

// 單一 style object
const className = pika({
	color: 'red',
	fontSize: '16px',
})
// 到了 build-time，這會變成像「pk-a pk-b」這樣的 class names
// 其中 `pk-a` → `.pk-a { color: red }`，而 `pk-b` → `.pk-b { font-size: 16px }`
