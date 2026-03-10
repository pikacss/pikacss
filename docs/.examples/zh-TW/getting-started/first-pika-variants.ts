// pika()：預設輸出格式由 integration 決定，通常會是 string
const classes = pika({ color: 'red', fontSize: '1rem' })
// => "pk-a pk-b"（以空白分隔的 class names 字串）

// pika.str()：強制回傳 string
const str = pika.str({ color: 'red', fontSize: '1rem' })
// => "pk-a pk-b"

// pika.arr()：強制回傳 array
const arr = pika.arr({ color: 'red', fontSize: '1rem' })
// => ["pk-a", "pk-b"]
