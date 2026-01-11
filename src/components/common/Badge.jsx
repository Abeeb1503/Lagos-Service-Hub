/**
 * Badge Component
 * @param {'default'|'success'|'warning'|'danger'|'info'} variant
 * @param {React.ReactNode} children
 * @param {string} className
 */
export default function Badge({ variant = 'default', children, className = '' }) {
  const styles = {
    default: 'bg-accent text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-danger text-white',
    info: 'bg-secondary text-white',
  }[variant]
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs ${styles} ${className}`}>{children}</span>
  )
}
