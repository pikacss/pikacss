// Output format: 'inline'
// pika.inl() produces bare class names — no quotes, no array brackets.
// TypeScript types pika.inl() as returning void to signal that the compiled
// value is not meant to be used as a regular string or array.

// Source:
pika.inl({ color: 'red', fontSize: '16px' })
// Compiled output:
a b // [!code highlight]
