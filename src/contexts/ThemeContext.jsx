import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const THEMES = ['light', 'dark', 'midnight', 'ocean-breeze', 'warm-night', 'sunset-gold']

const ThemeContext = createContext({ theme: 'light', setTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    return t && THEMES.includes(t) ? t : 'light'
  })
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    THEMES.forEach((t) => root.classList.remove(`theme-${t}`))
    root.classList.add(`theme-${theme}`)
    localStorage.setItem('theme', theme)
    setChanging(true)
    const id = setTimeout(() => setChanging(false), 250)
    return () => clearTimeout(id)
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme: setThemeState }), [theme])

  return (
    <ThemeContext.Provider value={value}>
      <AnimatePresence>
        {changing ? (
          <motion.div
            key={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none fixed inset-0 bg-primary"
          />
        ) : null}
      </AnimatePresence>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

