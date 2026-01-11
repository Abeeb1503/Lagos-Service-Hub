import { useState } from 'react'
import Input from '../common/Input.jsx'
import Button from '../common/Button.jsx'
import Card from '../common/Card.jsx'
import PasswordStrength from './PasswordStrength.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { THEMES, PROFESSIONS_OPTIONS, LAGOS_AREAS_OPTIONS } from '../../utils/constants.js'
import { validateRegistration } from '../../utils/validation.js'
import { motion, AnimatePresence } from 'framer-motion'
import Select from '../common/Select.jsx'
import Toast from '../common/Toast.jsx'

export default function RegisterForm() {
  const { register } = useAuth()
  const [role, setRole] = useState('buyer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [street, setStreet] = useState('')
  const [streetNumber, setStreetNumber] = useState('')
  const [area, setArea] = useState('')
  const [theme, setTheme] = useState('light')
  const [category, setCategory] = useState('')
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  function validateCurrent() {
    const form = {
      role,
      name,
      email,
      password,
      confirmPassword,
      theme,
      address: { city: 'Lagos', area, street, streetNumber },
      terms,
      category: role === 'seller' ? category : undefined,
    }
    const errs = validateRegistration(form)
    setErrors(errs)
    return { form, valid: Object.keys(errs).length === 0 }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    const { form, valid } = validateCurrent()
    if (!valid) {
      if (password !== confirmPassword) {
        setToast({ type: 'error', message: 'Password did not match' })
      }
      return
    }
    setLoading(true)
    const res = await register(form)
    setLoading(false)
    if (res.ok) {
      setToast({ type: 'success', message: 'Registration successful! Redirecting…' })
    } else {
      setToast({ type: 'error', message: 'Registration failed' })
    }
  }

  function onBlurValidate() {
    if (!submitted) return
    validateCurrent()
  }
  function onConfirmBlur() {
    if (password && confirmPassword && password !== confirmPassword) {
      setToast({ type: 'error', message: 'Password did not match' })
    }
    if (submitted) validateCurrent()
  }

  const formForValidity = {
    role,
    name,
    email,
    password,
    confirmPassword,
    theme,
    address: { city: 'Lagos', area, street, streetNumber },
    terms,
    category: role === 'seller' ? category : undefined,
  }
  const disabled = loading || Object.keys(validateRegistration(formForValidity)).length > 0

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <div className="flex gap-2 mb-4">
        <Button variant={role === 'buyer' ? 'primary' : 'outline'} onClick={() => setRole('buyer')}>
          Buyer
        </Button>
        <Button variant={role === 'seller' ? 'primary' : 'outline'} onClick={() => setRole('seller')}>
          Seller
        </Button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={onBlurValidate}
          error={submitted ? errors.name : null}
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={onBlurValidate}
          error={submitted ? errors.email : null}
        />
        {role === 'seller' ? (
          <div>
            <Select
              label="Profession"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={PROFESSIONS_OPTIONS}
              placeholder="Select a profession"
              error={submitted ? errors.category : null}
              searchable
            />
            <div className="text-xs mt-1 text-text/70">These are the only skills available on Lagos Service Hub for now. More professions will be added soon!</div>
          </div>
        ) : null}
        <div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={onBlurValidate}
            error={submitted ? errors.password : null}
          />
          <div className="mt-2">
            <PasswordStrength value={password} />
          </div>
        </div>
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={onConfirmBlur}
          error={submitted ? errors.confirmPassword : null}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm">City</label>
            <select disabled className="bg-muted text-text rounded px-2 py-2 w-full">
              <option>Lagos</option>
            </select>
            {submitted && errors.city ? <div className="mt-1 text-sm text-danger">{errors.city}</div> : null}
          </div>
          <Select
            label="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            options={LAGOS_AREAS_OPTIONS}
            placeholder="Select area"
            searchable
          />
          <Input
            label="Street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            onBlur={onBlurValidate}
            error={submitted ? errors.street : null}
          />
          <Input
            label="Street Number"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            onBlur={onBlurValidate}
            error={submitted ? errors.streetNumber : null}
          />
          <div>
            <label className="block mb-1 text-sm">Theme preference</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-card border border-border rounded px-2 py-2 w-full"
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="terms"
            className="w-4 h-4"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            onBlur={onBlurValidate}
            aria-describedby="terms-desc"
          />
          <label htmlFor="terms" className="text-sm">
            I agree to the Terms & Privacy
          </label>
        </div>
        <Button type="submit" className="w-full" disabled={disabled} loading={loading}>
          {loading ? 'Submitting…' : 'Create account'}
        </Button>
      </form>
      <AnimatePresence>{toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}</AnimatePresence>
    </Card>
  )
}
