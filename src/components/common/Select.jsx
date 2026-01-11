import { useMemo, useState } from 'react'

export default function Select({ label, value, onChange, options = [], placeholder, error, className = '', searchable = false, ...props }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  return (
    <div className={`w-full ${className}`}>
      {label ? <label className="block mb-1 text-sm">{label}</label> : null}
      {searchable ? (
        <div className="mb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="bg-card border border-border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Search options"
          />
        </div>
      ) : null}
      <select
        value={value}
        onChange={onChange}
        className="bg-card border border-border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {filtered.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <div className="mt-1 text-sm text-danger">{error}</div> : null}
    </div>
  )
}
