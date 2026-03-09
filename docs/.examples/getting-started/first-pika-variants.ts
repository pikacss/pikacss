// pika() - Default output format (configured by integration, usually string)
const classes = pika({ color: 'red', fontSize: '1rem' })
// => "pk-a pk-b" (string of space-separated class names)

// pika.str() - Force string output
const str = pika.str({ color: 'red', fontSize: '1rem' })
// => "pk-a pk-b"

// pika.arr() - Force array output
const arr = pika.arr({ color: 'red', fontSize: '1rem' })
// => ["pk-a", "pk-b"]
