/**
 * Avatar Component
 * @param {string} src - Image source
 * @param {string} name - Fallback initials derived from name
 * @param {number} size - Size in pixels
 * @param {string} className
 */
export default function Avatar({ src, name = '', size = 40, className = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')
  const style = { width: `${size}px`, height: `${size}px` }
  return src ? (
    <img
      src={src}
      alt={name || 'Avatar'}
      style={style}
      className={`rounded-full object-cover border border-border ${className}`}
    />
  ) : (
    <div
      style={style}
      className={`rounded-full bg-muted text-text font-medium flex items-center justify-center border border-border ${className}`}
      aria-label={name || 'Avatar'}
    >
      {initials || 'LS'}
    </div>
  )
}

