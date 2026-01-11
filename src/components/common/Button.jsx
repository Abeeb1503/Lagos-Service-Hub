/**
 * Button Component
 * @param {'primary'|'secondary'|'danger'|'outline'|'subtle'} variant
 * @param {boolean} loading - Show loading spinner and disable interaction
 * @param {boolean} disabled - Disable button
 * @param {string} className - Additional classes
 */
export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled = false,
  ...props
}) {
  const styles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    outline: 'btn-outline',
    subtle: 'btn-subtle',
  }[variant]

  return (
    <button
      disabled={disabled || loading}
      className={`btn-base inline-flex items-center justify-center gap-2 rounded px-4 py-2 ${styles} ${
        disabled || loading ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      ) : null}
      <span>{children}</span>
    </button>
  )
}
