import { useEffect, useState } from 'react'
import Card from '../components/common/Card.jsx'
import Input from '../components/common/Input.jsx'
import TextArea from '../components/common/TextArea.jsx'
import Select from '../components/common/Select.jsx'
import Button from '../components/common/Button.jsx'
import Toast from '../components/common/Toast.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { PROFESSIONS_OPTIONS, LAGOS_AREAS_OPTIONS } from '../utils/constants.js'
import { AnimatePresence } from 'framer-motion'

export default function SellerProfileEdit() {
  const { user } = useAuth()
  const storageKey = `seller_profile_${user?.id || 'guest'}`
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw
        ? JSON.parse(raw)
        : {
            name: user?.name || '',
            email: user?.email || '',
            area: '',
            street: '',
            streetNumber: '',
            category: '',
            bio: '',
            avatar: '',
          }
    } catch {
      return { name: user?.name || '', email: user?.email || '', area: '', street: '', streetNumber: '', category: '', bio: '', avatar: '' }
    }
  })
  const [toast, setToast] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(profile))
  }, [profile, storageKey])

  function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setProfile((p) => ({ ...p, avatar: url }))
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setProfile((p) => ({ ...p, avatar: url }))
  }

  function onSave() {
    localStorage.setItem(storageKey, JSON.stringify(profile))
    setToast({ type: 'success', message: 'Profile saved' })
  }

  return (
    <div className="container-xl space-y-6">
      <Card className="p-6">
        <div className="font-bold text-xl mb-4">Edit Profile</div>
        <div
          className={`border-2 border-dashed rounded p-6 text-center ${dragOver ? 'border-primary bg-muted' : 'border-border'}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <div className="mb-3 font-semibold">Profile Picture</div>
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar preview" className="mx-auto w-32 h-32 object-cover rounded-full border border-border" />
          ) : (
            <div className="text-sm mb-3">Drag & drop or click to upload</div>
          )}
          <input type="file" accept="image/*" onChange={onFile} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
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
          <Select
            label="Profession"
            value={profile.category}
            onChange={(e) => setProfile({ ...profile, category: e.target.value })}
            options={PROFESSIONS_OPTIONS}
            placeholder="Select profession"
            searchable
          />
        </div>
        <TextArea
          className="mt-4"
          label="Bio"
          value={profile.bio}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          rows={4}
          placeholder="Describe your services and value"
        />
        <div className="flex items-center gap-3 mt-6">
          <Button variant="secondary" onClick={() => window.open(`/sellers/${user?.id || ''}`, '_self')}>View Public Profile</Button>
          <Button onClick={onSave}>Save Changes</Button>
        </div>
        <AnimatePresence>{toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}</AnimatePresence>
      </Card>
    </div>
  )
}
