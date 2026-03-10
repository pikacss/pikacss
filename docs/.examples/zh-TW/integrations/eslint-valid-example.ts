// ✅ 合法：使用靜態字面值 arguments
pika({ color: 'red' })

// ✅ 合法：使用多個靜態 arguments
pika({ color: 'red' }, { fontSize: '16px' })

// ✅ 合法：巢狀的靜態物件（例如 pseudo-classes、media queries）
pika({ color: 'black', '&:hover': { color: 'blue' } })

// ✅ 合法：數值型別
pika({ fontSize: 16, zIndex: -1 })

// ✅ 合法：不含 expressions 的 template literal
pika({ color: `red` })

// ✅ 合法：展開靜態 object literal
pika({ ...{ color: 'red' } })

// ✅ 合法：使用不同輸出形式
pika.str({ color: 'red' })
pika.arr({ display: 'flex' })
pikap({ margin: '10px' })
