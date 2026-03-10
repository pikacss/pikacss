// 經過 build-time 編譯後，pika() 呼叫會被替換
// 成一般字串字面值，不會留下函式呼叫。

const buttonClass = 'a b c d e'

document.querySelector('#btn')!.className = buttonClass
