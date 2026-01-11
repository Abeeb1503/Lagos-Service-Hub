import { useState } from 'react'
import Input from '../common/Input.jsx'
import Button from '../common/Button.jsx'
import Card from '../common/Card.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import Toast from '../common/Toast.jsx'

export default function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    if (!email) return setErrors({ email: 'Valid email required' })
    if (!password) return setErrors({ password: 'Password required' })
    setLoading(true)
    const res = await login({ email, password, remember })
    setLoading(false)
    if (res.ok) {
      setToast({ type: 'success', message: 'Login successful! Redirecting…' })
    } else {
      setErrors(res.errors || {})
      setToast({ type: 'error', message: res.errors?.form || 'Invalid credentials' })
    }
  }

  return (
    <Card className="p-6">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={submitted ? errors.email : null}
        />
        <div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={submitted ? errors.password : null}
          />
          <div className="flex items-center justify-between mt-2">
            <a href="#" className="text-sm hover:text-primary">
              Forgot password
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <label htmlFor="remember" className="text-sm">
            Remember me
          </label>
        </div>
        <Button type="submit" className="w-full" disabled={loading || !email || !password} loading={loading}>
          Login
        </Button>
      </form>
      <div className="mt-3 text-sm">
        Don’t have an account?{' '}
        <a href="/register" className="hover:text-primary">
          Register
        </a>
      </div>
      <AnimatePresence>{toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}</AnimatePresence>
    </Card>
  )
}
