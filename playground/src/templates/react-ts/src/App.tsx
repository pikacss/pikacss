import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main
      className={pika({
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
      <h1 className={pika({ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)' })}>
        PikaCSS × React
      </h1>
      <p className={pika({ color: '#94a3b8' })}>
        Styles are written with <code>pika()</code> calls and compiled to atomic CSS at build time.
      </p>
      <button
        type="button"
        className={pika({
          'padding': '0.625rem 1.25rem',
          'borderRadius': '0.75rem',
          'border': 'none',
          'cursor': 'pointer',
          'fontSize': '1rem',
          'fontWeight': '600',
          'color': '#0f172a',
          'backgroundColor': 'var(--color-primary)',
          '$:hover': { filter: 'brightness(1.1)' },
        })}
        onClick={() => setCount(c => c + 1)}
      >
        count is {count}
      </button>
    </main>
  )
}

export default App
