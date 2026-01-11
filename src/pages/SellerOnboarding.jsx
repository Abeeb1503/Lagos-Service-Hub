import { useEffect, useMemo, useState } from 'react'
import Card from '../components/common/Card.jsx'
import Input from '../components/common/Input.jsx'
import Select from '../components/common/Select.jsx'
import TextArea from '../components/common/TextArea.jsx'
import Button from '../components/common/Button.jsx'
import Badge from '../components/common/Badge.jsx'
import Modal from '../components/common/Modal.jsx'
import Toast from '../components/common/Toast.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { motion } from 'framer-motion'
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx'
import { api } from '../services/api.js'
import { LAGOS_AREAS_OPTIONS, PROFESSIONS_OPTIONS } from '../utils/lagos.js'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function SellerOnboarding() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [openModal, setOpenModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    email: user?.email || '',
    address: { city: 'Lagos', area: '', street: '', streetNumber: '' },
    category: '',
    idDocs: [],
    portfolio: [],
    summary: '',
    terms: false,
  })

  const progress = useMemo(() => Math.round((step / 6) * 100), [step])

  function next() {
    if (!validateStep(step)) return
    setStep((s) => Math.min(6, s + 1))
  }
  function prev() {
    setStep((s) => Math.max(1, s - 1))
  }
  function validateStep(s) {
    if (s === 1) return form.name?.trim().length >= 3 && /^\+?\d{10,14}$/.test(form.phone || '') && /\S+@\S+\.\S+/.test(form.email || '')
    if (s === 2) return form.address.city === 'Lagos' && form.address.area && form.address.street && form.address.streetNumber
    if (s === 3) return !!form.category
    if (s === 4) return form.idDocs.length >= 1
    if (s === 5) return form.portfolio.length >= 4
    if (s === 6) return (form.summary?.split(' ').filter(Boolean).length >= 20) && form.terms
    return true
  }

  function onFileAdd(files, field) {
    const arr = Array.from(files)
      .slice(0, 6)
      .map((f) => ({ file: f, name: f.name, url: URL.createObjectURL(f) }))
    setForm((f) => ({ ...f, [field]: [...(f[field] || []), ...arr] }))
  }

  function removeImage(field, idx) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }))
  }

  async function submit() {
    if (!validateStep(6)) return
    setSubmitting(true)
    try {
      await api.patch('/api/users/me', { address: { city: 'Lagos', state: 'Lagos', area: form.address.area } })
      await api.post('/api/sellers', { category: form.category, summary: form.summary })

      if (form.idDocs[0]?.file) {
        const fd = new FormData()
        fd.append('idDocument', form.idDocs[0].file)
        const res = await fetch(`${API_BASE}/api/sellers/id-document`, { method: 'POST', credentials: 'include', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'ID upload failed')
      }

      if (form.portfolio.length >= 4) {
        const fd = new FormData()
        form.portfolio.slice(0, 10).forEach((p) => fd.append('images', p.file))
        const res = await fetch(`${API_BASE}/api/sellers/portfolio`, { method: 'POST', credentials: 'include', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || 'Portfolio upload failed')
      }

      setToast({ type: 'success', message: "Profile submitted! We'll verify your ID within 24 hours" })
      setStep(1)
      setForm((f) => ({ ...f, idDocs: [], portfolio: [] }))
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'Submission failed' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedRoute roles={['seller']}>
      <div className="container-xl space-y-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Seller Onboarding</div>
            <div className="text-sm">{`Step ${step} of 6`}</div>
          </div>
          <div className="mt-2 h-2 bg-muted rounded overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        </Card>

        {step === 1 && (
          <Card className="p-6 space-y-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Card>
        )}
        {step === 2 && (
          <Card className="p-6 space-y-4">
            <div>
              <label className="block mb-1 text-sm">City</label>
              <select disabled className="bg-muted text-text rounded px-2 py-2 w-full">
                <option>Lagos</option>
              </select>
            </div>
            <Select
              label="Area"
              value={form.address.area || ''}
              onChange={(e) => setForm({ ...form, address: { ...form.address, area: e.target.value } })}
              options={LAGOS_AREAS_OPTIONS}
              placeholder="Select area"
              searchable
            />
            <Input label="Street Name" value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} />
            <Input label="Street Number" value={form.address.streetNumber} onChange={(e) => setForm({ ...form, address: { ...form.address, streetNumber: e.target.value } })} />
          </Card>
        )}
        {step === 3 && (
          <Card className="p-6 space-y-4">
            <Select
              label="Profession"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={PROFESSIONS_OPTIONS}
              placeholder="Select profession"
              searchable
            />
            <div className="text-xs mt-1 text-text/70">These are the only skills available on Lagos Service Hub for now. More professions will be added soon!</div>
          </Card>
        )}
        {step === 4 && (
          <Card className="p-6 space-y-4">
            <div>
              <label className="block mb-1 text-sm">ID Upload (Driver’s License/NIN/Passport)</label>
              <div className="border border-border rounded p-4 text-center">
                <input type="file" accept="image/*" onChange={(e) => onFileAdd(e.target.files, 'idDocs')} />
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mt-3">
                {form.idDocs.map((doc, i) => (
                  <div key={i} className="border border-border rounded p-2 flex items-center justify-between">
                    <span className="text-sm">{doc.name}</span>
                    <Button variant="outline" onClick={() => removeImage('idDocs', i)}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
        {step === 5 && (
          <Card className="p-6 space-y-4">
            <div>
              <label className="block mb-1 text-sm">Portfolio (upload at least 4 images)</label>
              <div className="border border-border rounded p-4 text-center">
                <input type="file" accept="image/*" multiple onChange={(e) => onFileAdd(e.target.files, 'portfolio')} />
              </div>
              <div className="grid sm:grid-cols-4 gap-3 mt-3">
                {form.portfolio.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img.url} alt={`Portfolio ${i + 1}`} className="w-full h-32 object-cover rounded border border-border" />
                    <button
                      onClick={() => removeImage('portfolio', i)}
                      className="absolute top-1 right-1 bg-card/80 rounded p-1 border border-border"
                      aria-label="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
        {step === 6 && (
          <Card className="p-6 space-y-4">
            <TextArea
              label="20-word Summary"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Describe your services and value in 20 words"
              rows={4}
            />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="terms" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />
              <label htmlFor="terms" className="text-sm">I agree to the platform terms</label>
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={prev} disabled={step === 1}>Previous</Button>
          {step < 6 ? (
            <Button onClick={next} disabled={!validateStep(step)}>Next</Button>
          ) : (
            <Button onClick={submit} disabled={!validateStep(6)}>Submit</Button>
          )}
        </div>
        {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
      </div>
    </ProtectedRoute>
  )
}
