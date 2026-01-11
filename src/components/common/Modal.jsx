import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Modal Component
 * @param {boolean} open
 * @param {function} onClose
 * @param {string} title
 * @param {React.ReactNode} children
 * @param {React.ReactNode} footer
 */
export default function Modal({ open, onClose, title, children, footer }) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="Close modal backdrop" />
          <motion.div
            initial={{ scale: 0.96, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative bg-card border border-border rounded-lg shadow-xl w-[min(95vw,560px)] p-4 text-text"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button aria-label="Close modal" onClick={onClose} className="hover:opacity-70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-sm">{children}</div>
            {footer ? <div className="mt-4">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
