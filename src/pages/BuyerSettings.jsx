import { useEffect, useState } from 'react'
import Card from '../components/common/Card.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import Toast from '../components/common/Toast.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { THEMES } from '../utils/constants.js'
import { AnimatePresence } from 'framer-motion'

export default function BuyerSettings() {
  const { user, logout } = useAuth()
  const storageKey = `buyer_settings_${user?.id || 'guest'}`
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw
        ? JSON.parse(raw)
        : {
            email: user?.email || '',
            password: '',
            notifications: true,
            theme: localStorage.getItem('theme') || 'light',
          }
    } catch {
      return { email: user?.email || '', password: '', notifications: true, theme: 'light' }
    }
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings))
  }, [settings, storageKey])

  function onSave() {
    localStorage.setItem(storageKey, JSON.stringify(settings))
    localStorage.setItem('theme', settings.theme)
    setToast({ type: 'success', message: 'Settings saved' })
  }

  return (
    <div className="container-xl space-y-6">
      <Card className="p-6">
        <div className="font-bold text-xl mb-4">Account Settings</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Email" type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
          <Input label="New Password" type="password" value={settings.password} onChange={(e) => setSettings({ ...settings, password: e.target.value })} />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notif-buyer"
              checked={settings.notifications}
              onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="notif-buyer" className="text-sm">Enable notifications</label>
          </div>
          <div>
            <label className="block mb-1 text-sm">Theme preference</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
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
        <div className="flex items-center gap-3 mt-6">
          <Button variant="outline" onClick={logout}>Logout</Button>
          <Button onClick={onSave}>Save Changes</Button>
        </div>
        <AnimatePresence>{toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}</AnimatePresence>
      </Card>
    </div>
  )
}
