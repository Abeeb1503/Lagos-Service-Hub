/**
 * Input Component
 * @param {string} label
 * @param {'text'|'email'|'password'} type
 * @param {string} value
 * @param {function} onChange
 * @param {string} placeholder
 * @param {React.ReactNode} icon
 * @param {string} error - Validation feedback
 * @param {string} className
 */
import { useState } from 'react'

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  error,
  className = '',
  ...props
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && show ? 'text' : type

  return (
    <div className={`w-full ${className}`}>
      {label ? <label className="block mb-1 text-sm">{label}</label> : null}
      <div className="flex items-center gap-2 rounded border bg-card border-border px-3 py-2 focus-within:ring-2 focus-within:ring-primary">
        {icon ? <span className="text-muted">{icon}</span> : null}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none"
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="text-sm text-accent hover:opacity-80"
          >
            {show ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-10-7 1.1-2.748 3.413-4.996 6.3-6.2M9.88 9.88a3 3 0 104.24 4.24" />
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
      {error ? <div className="mt-1 text-sm text-danger">{error}</div> : null}
    </div>
  )
}
