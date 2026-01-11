import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  const styles = {
    success: 'bg-primary text-white',
    error: 'bg-danger text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-secondary text-white',
    default: 'bg-card text-text border border-border',
  }
  const cls = styles[type] || styles.default

  useEffect(() => {
    if (!duration) return
    const t = setTimeout(() => {
      if (onClose) onClose()
    }, duration)
    return () => clearTimeout(t)
  }, [message, type, duration, onClose])

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className={`fixed bottom-4 right-4 z-[300] rounded px-3 py-2 shadow-lg ${cls}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <span>{message}</span>
            <button
              onClick={onClose}
              className="ml-2 rounded px-2 py-1 bg-black/10 hover:bg-black/20"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
