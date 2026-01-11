import { PASSWORD_POLICY } from './constants.js'

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase())
}

export function passwordChecks(password) {
  const checks = {
    length: password.length >= PASSWORD_POLICY.minLength,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }
  const passed = Object.values(checks).filter(Boolean).length
  let level = 'weak'
  if (passed >= 4) level = 'medium'
  if (passed === 5 && password.length >= 12) level = 'strong'
  return { checks, level, score: passed }
}

export function validateRegistration(form) {
  const errors = {}
  if (!form.name || form.name.trim().length < 3) errors.name = 'Name must be at least 3 characters'
  if (!form.email || !isEmail(form.email)) errors.email = 'Valid email required'
  const pw = passwordChecks(form.password || '')
  if (pw.level === 'weak') errors.password = 'Password does not meet requirements'
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Password did not match'
  if (!form.role) errors.role = 'Select role'
  if (form.role === 'seller' && !form.category) errors.category = 'Category is required for sellers'
  if (!form.address?.street) errors.street = 'Street is required'
  if (!form.address?.streetNumber) errors.streetNumber = 'Street number is required'
  if (form.address?.city !== 'Lagos') errors.city = 'City must be Lagos'
  if (!form.terms) errors.terms = 'You must accept terms'
  return errors
}

export function validateLogin(form) {
  const errors = {}
  if (!form.email || !isEmail(form.email)) errors.email = 'Valid email required'
  if (!form.password) errors.password = 'Password is required'
  return errors
}
