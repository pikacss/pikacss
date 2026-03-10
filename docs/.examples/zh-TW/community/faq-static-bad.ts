// pika() 是全域函式，不需要另外匯入

// ❌ Runtime 變數，無法在 build-time 評估
const userColor = getUserPreference()
const btn = pika({
	backgroundColor: userColor, // 錯誤：userColor 無法被靜態分析
})
