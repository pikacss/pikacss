// 編譯後，不會留下 pika 匯入，也不會有函式呼叫
// 最後只會剩下一般字串字面值

const cardClass = 'a b c'

const titleClass = 'd e f'

export function createCard(title: string, content: string) {
	return `
    <div class="${cardClass}">
      <h2 class="${titleClass}">${title}</h2>
      <p>${content}</p>
    </div>
  `
}
