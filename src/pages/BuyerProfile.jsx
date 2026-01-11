import { useEffect, useState } from 'react'
import Card from '../components/common/Card.jsx'
import Input from '../components/common/Input.jsx'
import Select from '../components/common/Select.jsx'
import Button from '../components/common/Button.jsx'
import Toast from '../components/common/Toast.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { LAGOS_AREAS_OPTIONS } from '../utils/constants.js'
import { AnimatePresence } from 'framer-motion'

export default function BuyerProfile() {
  const { user } = useAuth()
  const storageKey = `buyer_profile_${user?.id || 'guest'}`
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw
        ? JSON.parse(raw)
        : {
            name: user?.name || '',
            email: user?.email || '',
            area: user?.address?.area || '',
            street: user?.address?.street || '',
            streetNumber: user?.address?.streetNumber || '',
          }
    } catch {
      return { name: user?.name || '', email: user?.email || '', area: '', street: '', streetNumber: '' }
    }
  })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(profile))
  }, [profile, storageKey])

  function onSave() {
    localStorage.setItem(storageKey, JSON.stringify(profile))
    setToast({ type: 'success', message: 'Profile saved' })
  }

  return (
    <div className="container-xl space-y-6">
      <Card className="p-6">
        <div className="font-bold text-xl mb-4">Buyer Profile</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <div>
            <label className="block mb-1 text-sm">City</label>
            <select disabled className="bg-muted text-text rounded px-2 py-2 w-full">
              <option>Lagos</option>
            </select>
          </div>
          <Select
            label="Area"
            value={profile.area}
            onChange={(e) => setProfile({ ...profile, area: e.target.value })}
            options={LAGOS_AREAS_OPTIONS}
            placeholder="Select area"
            searchable
          />
          <Input label="Street Name" value={profile.street} onChange={(e) => setProfile({ ...profile, street: e.target.value })} />
          <Input label="Street Number" value={profile.streetNumber} onChange={(e) => setProfile({ ...profile, streetNumber: e.target.value })} />
        </div>
        <div className="flex items-center gap-3 mt-6">
          <Button onClick={onSave}>Save Changes</Button>
        </div>
        <AnimatePresence>{toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}</AnimatePresence>
      </Card>
    </div>
  )
}
