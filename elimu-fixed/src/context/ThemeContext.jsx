import { createContext, useContext, useState, useEffect } from 'react'
import db from '../db/schema.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    db.settings.get('theme').then(rec => {
      if (rec?.value) {
        setTheme(rec.value)
        applyTheme(rec.value)
      }
    }).catch(() => {})
  }, [])

  function applyTheme(t) {
    if (t === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
  }

  async function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
    await db.settings.put({ key: 'theme', value: next })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
