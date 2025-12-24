# Examples

Real-world usage patterns and examples for PikaCSS.

## Basic Examples

### Simple Component Styling

```tsx
import { pika } from '#pika'

function Button({ children }) {
  return (
    <button className={pika({
      'padding': '0.5rem 1rem',
      'borderRadius': '0.25rem',
      'backgroundColor': '#3b82f6',
      'color': 'white',
      'border': 'none',
      'cursor': 'pointer',
      '$:hover': {
        backgroundColor: '#2563eb',
      },
      '$:active': {
        transform: 'scale(0.98)',
      },
    })}>
      {children}
    </button>
  )
}
```

### Using Shortcuts

```tsx
// pika.config.ts
export default defineEngineConfig({
  shortcuts: {
    shortcuts: [
      ['btn', {
        padding: '0.5rem 1rem',
        borderRadius: '0.25rem',
        border: 'none',
        cursor: 'pointer',
      }],
      ['btn-primary', {
        '__shortcut': 'btn',
        'backgroundColor': '#3b82f6',
        'color': 'white',
        '$:hover': {
          backgroundColor: '#2563eb',
        },
      }],
    ]
  }
})

// Component
function Button({ children }) {
  return (
    <button className={pika('btn-primary')}>
      {children}
    </button>
  )
}
```

## Responsive Design

### Mobile-First Approach

```tsx
function Card({ title, content }) {
  return (
    <div className={pika({
      'padding': '1rem',
      'backgroundColor': 'white',
      'borderRadius': '0.5rem',
      'width': '100%',
      
      '@media (min-width: 640px)': {
        padding: '1.5rem',
        width: '50%',
      },
      
      '@media (min-width: 1024px)': {
        padding: '2rem',
        width: '33.333%',
      },
    })}>
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  )
}
```

### Container Queries (if supported)

```tsx
function ResponsiveCard() {
  return (
    <div className={pika({
      'containerType': 'inline-size',
      '$ > .content': {
        'display': 'flex',
        'flexDirection': 'column',
        '@container (min-width: 400px)': {
          flexDirection: 'row',
        },
      },
    })}>
      <div className="content">
        {/* Content */}
      </div>
    </div>
  )
}
```

## Dark Mode

### Media Query Approach

```tsx
function ThemedComponent() {
  return (
    <div className={pika({
      'backgroundColor': '#ffffff',
      'color': '#000000',
      
      '@media (prefers-color-scheme: dark)': {
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
      },
    })}>
      Content
    </div>
  )
}
```

### Class-Based Dark Mode

```tsx
// pika.config.ts
export default defineEngineConfig({
  selectors: {
    // Add custom @dark selector
    selectors: [
      ['@dark', (sel) => `.dark ${sel}`],
    ]
  }
})

// Component
function ThemedComponent() {
  return (
    <div className={pika({
      'backgroundColor': '#ffffff',
      'color': '#000000',
      
      '@dark': {
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
      },
    })}>
      Content
    </div>
  )
}
```

## Layout Patterns

### Flexbox Layouts

```tsx
function FlexLayout() {
  return (
    <div className={pika({
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
    })}>
      <aside className={pika({
        'flex': '0 0 200px',
        '@media (max-width: 768px)': {
          flex: '0 0 100%',
        },
      })}>
        Sidebar
      </aside>
      
      <main className={pika({
        flex: '1 1 0',
        minWidth: '0',
      })}>
        Main Content
      </main>
    </div>
  )
}
```

### Grid Layouts

```tsx
function GridGallery() {
  return (
    <div className={pika({
      'display': 'grid',
      'gridTemplateColumns': 'repeat(auto-fill, minmax(200px, 1fr))',
      'gap': '1rem',
      'padding': '1rem',
      
      '$ > img': {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '0.5rem',
      },
    })}>
      <img src="..." alt="..." />
      <img src="..." alt="..." />
      {/* More images */}
    </div>
  )
}
```

## Animation Examples

### Hover Effects

```tsx
function AnimatedButton() {
  return (
    <button className={pika({
      'padding': '0.5rem 1rem',
      'backgroundColor': '#3b82f6',
      'color': 'white',
      'border': 'none',
      'borderRadius': '0.25rem',
      'transition': 'all 0.2s ease',
      'transform': 'translateY(0)',
      
      '$:hover': {
        backgroundColor: '#2563eb',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
      },
      
      '$:active': {
        transform: 'translateY(0)',
        boxShadow: 'none',
      },
    })}>
      Hover Me
    </button>
  )
}
```

### Keyframe Animations

```tsx
// pika.config.ts
export default defineEngineConfig({
  preflights: [
    `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    `
  ]
})

// Component
function FadeInComponent() {
  return (
    <div className={pika({
      animation: 'fadeIn 0.5s ease-out',
    })}>
      Content fades in
    </div>
  )
}

function Spinner() {
  return (
    <div className={pika({
      'width': '40px',
      'height': '40px',
      'border': '3px solid #f3f3f3',
      'borderTop': '3px solid #3b82f6',
      'borderRadius': '50%',
      'animation': 'spin 1s linear infinite',
    })} />
  )
}
```

## Form Styling

### Input Component

```tsx
function TextInput({ label, error, ...props }) {
  return (
    <div className={pika({
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    })}>
      {label && <label>{label}</label>}
      
      <input
        className={pika({
          'padding': '0.5rem 0.75rem',
          'border': error ? '2px solid #ef4444' : '1px solid #d1d5db',
          'borderRadius': '0.375rem',
          'fontSize': '1rem',
          'outline': 'none',
          
          '$:focus': {
            borderColor: error ? '#ef4444' : '#3b82f6',
            boxShadow: error 
              ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
              : '0 0 0 3px rgba(59, 130, 246, 0.1)',
          },
          
          '$::placeholder': {
            color: '#9ca3af',
          },
        })}
        {...props}
      />
      
      {error && (
        <span className={pika({
          color: '#ef4444',
          fontSize: '0.875rem',
        })}>
          {error}
        </span>
      )}
    </div>
  )
}
```

### Checkbox Component

```tsx
function Checkbox({ label, ...props }) {
  return (
    <label className={pika({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
    })}>
      <input
        type="checkbox"
        className={pika({
          'width': '1.25rem',
          'height': '1.25rem',
          'cursor': 'pointer',
          'accentColor': '#3b82f6',
        })}
        {...props}
      />
      <span>{label}</span>
    </label>
  )
}
```

## Advanced Patterns

### Component Variants

```tsx
// pika.config.ts
export default defineEngineConfig({
  shortcuts: {
    shortcuts: [
      ['btn-base', {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        fontWeight: '500',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }],
      
      // Size variants
      ['btn-sm', { __shortcut: 'btn-base', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }],
      ['btn-lg', { __shortcut: 'btn-base', padding: '0.75rem 1.5rem', fontSize: '1.125rem' }],
      
      // Color variants
      ['btn-primary', {
        '__shortcut': 'btn-base',
        'backgroundColor': '#3b82f6',
        'color': 'white',
        '$:hover': { backgroundColor: '#2563eb' },
      }],
      ['btn-secondary', {
        '__shortcut': 'btn-base',
        'backgroundColor': '#6b7280',
        'color': 'white',
        '$:hover': { backgroundColor: '#4b5563' },
      }],
      ['btn-outline', {
        '__shortcut': 'btn-base',
        'backgroundColor': 'transparent',
        'color': '#3b82f6',
        'border': '2px solid #3b82f6',
        '$:hover': {
          backgroundColor: '#3b82f6',
          color: 'white',
        },
      }],
    ]
  }
})

// Component
function Button({ variant = 'primary', size = 'base', children }) {
  const variantClass = `btn-${variant}`
  const sizeClass = size !== 'base' ? `btn-${size}` : 'btn-base'
  
  return (
    <button className={pika(sizeClass, variantClass)}>
      {children}
    </button>
  )
}

// Usage
<Button variant="primary" size="sm">Small Primary</Button>
<Button variant="outline" size="lg">Large Outline</Button>
```

### Conditional Styling

```tsx
function Alert({ type = 'info', message }) {
  const styles = pika({
    'padding': '1rem',
    'borderRadius': '0.5rem',
    'borderLeft': '4px solid',
    'borderLeftColor': type === 'error' ? '#ef4444' 
      : type === 'warning' ? '#f59e0b'
      : type === 'success' ? '#10b981'
      : '#3b82f6',
    'backgroundColor': type === 'error' ? '#fef2f2'
      : type === 'warning' ? '#fffbeb'
      : type === 'success' ? '#f0fdf4'
      : '#eff6ff',
    'color': type === 'error' ? '#991b1b'
      : type === 'warning' ? '#92400e'
      : type === 'success' ? '#065f46'
      : '#1e40af',
  })
  
  return <div className={styles}>{message}</div>
}
```

### Utility Function Pattern

```tsx
// utils/styles.ts
export function createButtonStyles(variant: 'primary' | 'secondary' | 'outline') {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  }
  
  const variants = {
    primary: {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
    secondary: {
      backgroundColor: '#6b7280',
      color: 'white',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '2px solid #3b82f6',
      color: '#3b82f6',
    },
  }
  
  return { ...base, ...variants[variant] }
}

// Component
function Button({ variant }) {
  return (
    <button className={pika(createButtonStyles(variant))}>
      Click Me
    </button>
  )
}
```

## Icons Integration

```tsx
// pika.config.ts
import { icons } from '@pikacss/plugin-icons'

export default defineEngineConfig({
  plugins: [icons()],
  icons: {
    prefix: 'i-',
    scale: 1,
  }
})

// Component
function IconButton({ icon, label }) {
  return (
    <button className={pika({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    })}>
      <i className={pika(`i-${icon}`)} />
      {label}
    </button>
  )
}

// Usage
<IconButton icon="mdi:home" label="Home" />
<IconButton icon="carbon:user" label="Profile" />
```

## Performance Optimization

### Reusing Style Objects

```tsx
// Good: Reuse style objects
const buttonStyles = {
  padding: '0.5rem 1rem',
  borderRadius: '0.25rem',
  cursor: 'pointer',
}

function Button1() {
  return <button className={pika(buttonStyles)}>Button 1</button>
}

function Button2() {
  return <button className={pika(buttonStyles)}>Button 2</button>
}
```

### Extracting Common Patterns

```tsx
// Common styles
const flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const card = {
  padding: '1.5rem',
  backgroundColor: 'white',
  borderRadius: '0.5rem',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
}

// Usage
function Card({ children }) {
  return (
    <div className={pika(card, flexCenter)}>
      {children}
    </div>
  )
}
```

## Testing

### Testing Components with PikaCSS

```tsx
// Component.test.tsx
import { render } from '@testing-library/react'
import { Button } from './Button'

test('button renders with correct classes', () => {
  const { container } = render(<Button>Click Me</Button>)
  const button = container.querySelector('button')
  
  // Check that atomic classes are applied
  expect(button.className).toMatch(/[a-z]+/)
})

test('button applies hover styles', () => {
  const { container } = render(<Button>Click Me</Button>)
  const button = container.querySelector('button')
  
  // Trigger hover and check computed styles
  // (requires actual CSS to be loaded in test environment)
})
```

## Real-World Application Structure

```
src/
  ├── styles/
  │   ├── shortcuts.ts          # Reusable shortcuts
  │   ├── themes.ts             # Theme configurations
  │   └── utilities.ts          # Utility functions
  ├── components/
  │   ├── Button/
  │   │   ├── Button.tsx
  │   │   └── Button.styles.ts
  │   └── Card/
  │       ├── Card.tsx
  │       └── Card.styles.ts
  └── pika.config.ts
```

```ts
// src/styles/shortcuts.ts
export const shortcuts = [
  // Layout
  ['flex-center', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }],
  
  // Components
  ['btn', {
    display: 'inline-flex',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    cursor: 'pointer',
  }],
]

// src/components/Button/Button.styles.ts
export const buttonStyles = {
  '__shortcut': 'btn',
  'transition': 'all 0.2s',
  '$:hover': {
    transform: 'translateY(-1px)',
  },
}

// src/components/Button/Button.tsx
import { pika } from '#pika'
import { buttonStyles } from './Button.styles'

export function Button({ children }) {
  return (
    <button className={pika(buttonStyles)}>
      {children}
    </button>
  )
}
```
