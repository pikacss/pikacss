import { createSignal } from 'solid-js'

function App() {
  const [count, setCount] = createSignal(0)

  return (
    <main
      class={pika({
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'system-ui, sans-serif',
      })}
    >
      <h1
        class={pika({
          fontSize: '2.5rem',
          fontWeight: '700',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(90deg, var(--color-accent), #7dd3fc)',
          backgroundClip: 'text',
          color: 'transparent',
        })}
      >
        PikaCSS × SolidJS
      </h1>

      <section class={pika('card', { maxWidth: '28rem', textAlign: 'center' })}>
        <p class={pika({ margin: '0 0 1rem', lineHeight: '1.6', color: '#94a3b8' })}>
          Styles in this file are written with
          {' '}
          <code class={pika({ color: 'var(--color-accent)' })}>{'pika()'}</code>
          {' '}
          calls and compiled to atomic CSS at build time — zero runtime.
        </p>
        <button type="button" class={pika('btn')} onClick={() => setCount(c => c + 1)}>
          count is
          {' '}
          {count()}
        </button>
      </section>

      <p class={pika({ fontSize: '0.875rem', color: '#64748b' })}>
        Edit
        {' '}
        <code>src/App.tsx</code>
        {' '}
        or
        {' '}
        <code>pika.config.ts</code>
        {' '}
        and watch the output update.
      </p>
    </main>
  )
}

export default App
