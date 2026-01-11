export default function Spinner({ size = 24, className = '' }) {
  const s = `${size}px`
  return (
    <div
      className={`inline-block rounded-full border-2 border-primary border-t-transparent animate-spin ${className}`}
      style={{ width: s, height: s }}
      aria-label="Loading"
    />
  )
}

