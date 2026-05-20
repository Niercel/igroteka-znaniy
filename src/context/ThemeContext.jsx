import { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const pageThemes = {
  '/': { from: 'from-purple-900', to: 'to-indigo-900', dark: true },
  '/login': { from: 'from-pink-900', to: 'to-purple-900', dark: true },
  '/register': { from: 'from-pink-900', to: 'to-purple-900', dark: true },
  '/dashboard': { from: 'from-emerald-50', to: 'to-teal-50', dark: false },
  '/games': { from: 'from-pink-50', to: 'to-purple-50', dark: false },
  '/play': { from: 'from-purple-50', to: 'to-pink-50', dark: false },
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const location = useLocation()
  const [bgClass, setBgClass] = useState('from-purple-900 to-indigo-900')
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const path = location.pathname
    let theme = pageThemes['/']
    for (const key in pageThemes) {
      if (path.startsWith(key) && key !== '/') {
        theme = pageThemes[key]
        break
      }
    }
    if (theme) {
      setBgClass(`${theme.from} ${theme.to}`)
      setIsDark(theme.dark)
    }
  }, [location])

  return (
    <ThemeContext.Provider value={{ bgClass, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function usePageTheme() {
  return useContext(ThemeContext)
}