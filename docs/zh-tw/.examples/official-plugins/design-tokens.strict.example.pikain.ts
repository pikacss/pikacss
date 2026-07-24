// 嚴格模式下的有效用法：受治理的屬性參考了對應 $type 的 token，
// 因此不會產生任何診斷，CSS 也會正常輸出。
const buttonClassName = pika({
	color: 'var(--color-primary)',
	backgroundColor: 'var(--color-surface)',
})
