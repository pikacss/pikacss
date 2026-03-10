// ❌ 不合法：直接引用變數
const color = 'red'
pika({ color: color })

// ❌ 不合法：把變數直接當成 argument
const styles = { color: 'red' }
pika(styles)

// ❌ 不合法：在值裡呼叫函式
pika({ color: getColor() })

// ❌ 不合法：帶有 expression 的 template literal
const size = 16
pika({ fontSize: `${size}px` })

// ❌ 不合法：展開變數
const base = { color: 'red' }
pika({ ...base })

// ❌ 不合法：條件運算式
const isDark = true
pika({ color: isDark ? 'white' : 'black' })

// ❌ 不合法：二元運算式
const x = 10
pika({ width: x + 'px' })

// ❌ 不合法：成員存取運算式
const theme = { color: 'red' }
pika({ color: theme.color })

// ❌ 不合法：動態計算的 key
const key = 'color'
pika({ [key]: 'red' })
