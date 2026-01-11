/**
 * Card Component
 * @param {React.ReactNode} children
 * @param {string} className
 */
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded shadow-sm hover:shadow-md transition-all hover:-translate-y-[2px] ${className}`}>
      {children}
    </div>
  )
}
