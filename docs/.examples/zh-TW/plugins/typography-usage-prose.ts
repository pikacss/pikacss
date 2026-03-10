// pika() 是全域函式，不需要另外匯入

// 一次套用整組 typography 樣式
const article = pika('prose')

// 套用指定的尺寸 variant
const smallArticle = pika('prose-sm')
const largeArticle = pika('prose-lg')

// 和自訂樣式一起使用
const styledArticle = pika('prose', { maxWidth: '80ch' })
