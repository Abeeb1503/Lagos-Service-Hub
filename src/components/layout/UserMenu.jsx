import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 bg-card border border-border rounded px-2 py-1"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="w-6 h-6 rounded-full bg-primary" />
        <span className="text-sm">{user?.name}</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 mt-2 w-48 bg-card border border-border rounded shadow-lg"
          >
            <div className="p-2">
              {user?.role === 'seller' ? (
                <Link to="/seller/profile" className="block px-2 py-1 rounded hover:bg-muted">Profile</Link>
              ) : user?.role === 'buyer' ? (
                <Link to="/buyer/profile" className="block px-2 py-1 rounded hover:bg-muted">Profile</Link>
              ) : (
                <Link to="/profile" className="block px-2 py-1 rounded hover:bg-muted">Profile</Link>
              )}
              {user?.role === 'buyer' ? (
                <Link to="/buyer" className="block px-2 py-1 rounded hover:bg-muted">
                  Dashboard
                </Link>
              ) : null}
              {user?.role === 'seller' ? (
                <Link to="/seller" className="block px-2 py-1 rounded hover:bg-muted">
                  Dashboard
                </Link>
              ) : null}
              {user?.role === 'admin' ? (
                <Link to="/admin" className="block px-2 py-1 rounded hover:bg-muted">
                  Dashboard
                </Link>
              ) : null}
              {user?.role === 'seller' ? (
                <Link to="/seller/settings" className="block px-2 py-1 rounded hover:bg-muted">Settings</Link>
              ) : user?.role === 'buyer' ? (
                <Link to="/buyer/settings" className="block px-2 py-1 rounded hover:bg-muted">Settings</Link>
              ) : (
                <Link to="/settings" className="block px-2 py-1 rounded hover:bg-muted">Settings</Link>
              )}
              <button onClick={logout} className="w-full text-left px-2 py-1 rounded hover:bg-muted">
                Logout
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
