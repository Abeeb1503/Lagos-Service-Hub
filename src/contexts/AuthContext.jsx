import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DASHBOARD_ROUTE_BY_ROLE } from '../utils/constants.js'
import { validateLogin, validateRegistration } from '../utils/validation.js'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'

const AuthContext = createContext({
  user: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function boot() {
      try {
        const me = await api.get('/api/auth/me')
        if (mounted) setUser(me.user)
      } catch (e) {
        try {
          await api.post('/api/auth/refresh')
          const me = await api.get('/api/auth/me')
          if (mounted) setUser(me.user)
        } catch {
          if (mounted) setUser(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    boot()
    return () => {
      mounted = false
    }
  }, [])

  async function register(form) {
    const errors = validateRegistration(form)
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors }
    }
    try {
      const resp = await api.post('/api/auth/register', {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        address: {
          city: 'Lagos',
          state: 'Lagos',
          area: form.address?.area || '',
        },
      })
      await api.post('/api/auth/login', { email: form.email.trim().toLowerCase(), password: form.password })
      const me = await api.get('/api/auth/me')
      setUser(me.user)
      navigate(DASHBOARD_ROUTE_BY_ROLE[me.user.role])
      return { ok: true, user: me.user }
    } catch (e) {
      if (e.code === 'CONFLICT') return { ok: false, errors: { email: 'Email already registered' } }
      return { ok: false, errors: { form: e.message || 'Registration failed' } }
    }
  }

  async function login({ email, password, remember = true }) {
    const errors = validateLogin({ email, password })
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors }
    }
    try {
      await api.post('/api/auth/login', { email: String(email).toLowerCase(), password })
      const me = await api.get('/api/auth/me')
      setUser(me.user)
      navigate(DASHBOARD_ROUTE_BY_ROLE[me.user.role])
      return { ok: true, user: me.user }
    } catch (e) {
      return { ok: false, errors: { form: 'Invalid credentials' } }
    }
  }

  async function logout() {
    setUser(null)
    navigate('/')
  }

  const value = useMemo(() => ({ user, loading, register, login, logout }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

