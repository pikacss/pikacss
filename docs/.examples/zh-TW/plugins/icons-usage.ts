// pika() 是全域函式，不需要另外匯入

// 基本圖示用法：prefix + collection:name
pika('i-mdi:home')
pika('i-mdi:account')
pika('i-lucide:settings')

// 強制使用 mask 模式（icon 會透過 currentColor 繼承文字顏色）
pika('i-mdi:home?mask')

// 強制使用背景模式（icon 會保留原本顏色）
pika('i-mdi:home?bg')

// 自動模式（預設）：若 SVG 含有 currentColor 就使用 mask，否則使用 bg
pika('i-mdi:home?auto')
