// 原始碼：使用 pika() 定義樣式
// pika() 是全域函式，不需要另外匯入

const cardClass = pika({
	padding: '1.5rem',
	borderRadius: '0.75rem',
	boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
})

const titleClass = pika({
	fontSize: '1.25rem',
	fontWeight: '700',
	color: '#1a1a1a',
})

export function createCard(title: string, content: string) {
	return `
    <div class="${cardClass}">
      <h2 class="${titleClass}">${title}</h2>
      <p>${content}</p>
    </div>
  `
}
