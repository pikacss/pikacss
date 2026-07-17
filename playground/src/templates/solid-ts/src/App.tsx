import PreferencesCard from './components/PreferencesCard'

const pageClass = pika({
  'minHeight': '100vh',
  'display': 'flex',
  'flexDirection': 'column',
  'alignItems': 'center',
  'justifyContent': 'center',
  'gap': '1.25rem',
  'padding': '1.5rem',
  'backgroundColor': 'var(--bg)',
  'color': 'var(--text)',
  'fontFamily': 'system-ui, sans-serif',
  'lineHeight': '1.5',
  'transition': 'background-color 0.3s ease, color 0.3s ease',
  '@sm': { padding: '2.5rem' },
})

const badgeRowClass = pika({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  margin: '0',
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
})

const frameworkChipClass = pika('chip')

const hintClass = pika({
  margin: '0',
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
  textAlign: 'center',
})

function App() {
  return (
    <main class={pageClass}>
      <PreferencesCard />
      <p class={badgeRowClass}>
        <span>Rendered with</span>
        <span class={frameworkChipClass}>Solid</span>
      </p>
      <p class={hintClass}>
        Edit <code>pika.config.ts</code> or any file in <code>src/</code> — styles update instantly.
      </p>
    </main>
  )
}

export default App
