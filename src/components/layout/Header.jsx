import { NavLink, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import UserMenu from './UserMenu.jsx'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const THEMES = [
  { value: 'light', label: 'Light (Gold & Blue)' },
  { value: 'dark', label: 'Dark (Gold & Blue)' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'ocean-breeze', label: 'Ocean Breeze' },
  { value: 'warm-night', label: 'Warm Night' },
  { value: 'sunset-gold', label: 'Sunset Gold' },
]

export default function Header() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    function onClick(e) {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 transition-all">
      <div className="container-xl h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {/* TODO: Replace with actual Lagos Service Hub logo file */}
          <div
            className="h-10 px-3 rounded-lg flex items-center justify-center font-bold tracking-wide text-white border border-border shadow-sm"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--grad-a), var(--grad-b))' }}
          >
            LSH
          </div>
          <span className="font-semibold tracking-wide">Lagos Service Hub</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className="hover:text-primary">
            Home
          </NavLink>
          <NavLink to="/browse" className="hover:text-primary">
            Browse
          </NavLink>
          {!user ? (
            <>
              <NavLink to="/login" className="hover:text-primary">
                Login
              </NavLink>
              <NavLink to="/register" className="hover:text-primary">
                Register
              </NavLink>
            </>
          ) : null}
        </nav>
        <div className="flex items-center gap-3" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="bg-card border border-border rounded px-3 h-9 text-sm inline-flex items-center gap-2 transition-all"
          >
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundImage: 'linear-gradient(135deg, var(--grad-a), var(--grad-b))' }} />
              <span>{THEMES.find((t) => t.value === theme)?.label}</span>
            </span>
          </button>
          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: reduce ? 0 : 0.18 }}
                className="absolute right-4 top-[64px] w-56 bg-card border border-border rounded shadow-lg z-50"
                role="listbox"
              >
                <ul className="p-2 space-y-1">
                  {THEMES.map((t) => (
                    <li key={t.value}>
                      <button
                        onClick={() => {
                          setTheme(t.value)
                          setOpen(false)
                        }}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-muted ${t.value === theme ? 'font-semibold' : ''}`}
                        role="option"
                        aria-selected={t.value === theme}
                      >
                        <span className="w-4 h-4 rounded-full" style={{ backgroundImage: 'linear-gradient(135deg, var(--grad-a), var(--grad-b))' }} />
                        <span>{t.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>
          {user ? <UserMenu /> : null}
        </div>
      </div>
    </header>
  )
}
