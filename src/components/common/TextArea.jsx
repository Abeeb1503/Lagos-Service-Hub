/**
 * TextArea Component
 * @param {string} label
 * @param {string} value
 * @param {function} onChange
 * @param {string} placeholder
 * @param {string} error
 * @param {string} className
 * @param {number} rows
 */
export default function TextArea({
  label,
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
  className = '',
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label ? <label className="block mb-1 text-sm">{label}</label> : null}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="bg-card border border-border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
        {...props}
      />
      {error ? <div className="mt-1 text-sm text-danger">{error}</div> : null}
    </div>
  )
}

