import { useState } from 'react'
import Card from '../common/Card.jsx'
import Input from '../common/Input.jsx'
import TextArea from '../common/TextArea.jsx'
import Select from '../common/Select.jsx'
import Button from '../common/Button.jsx'
import Toast from '../common/Toast.jsx'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { api } from '../../services/api.js'
import { LAGOS_AREAS_OPTIONS } from '../../utils/lagos.js'

export default function JobRequest({ seller, onSent }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [location, setLocation] = useState('')
  const [requirements, setRequirements] = useState('')
  const [toast, setToast] = useState(null)

  const valid =
    title.trim().length >= 3 &&
    description.trim().length >= 50 &&
    Number(budget) > 0 &&
    !!startDate &&
    !!location

  async function submit() {
    if (!valid || !user) {
      setToast({ type: 'error', message: 'Please complete all required fields' })
      return
    }
    try {
      const body = {
        sellerId: seller.id,
        title,
        description: `${description}\n\nPreferred start date: ${startDate}\nLocation: ${location}\nRequirements: ${requirements || 'None'}`,
        agreedAmount: Number(budget),
      }
      const resp = await api.post('/api/jobs', body)
      setToast({ type: 'success', message: 'Request sent! The seller will respond soon.' })
      if (onSent) onSent(resp.job)
      setTitle('')
      setDescription('')
      setBudget('')
      setStartDate('')
      setLocation('')
      setRequirements('')
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'Failed to send request' })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div className="font-semibold">Request a Job from {seller.name}</div>
        <Input label="Job title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TextArea
          label="Detailed description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the work needed"
          rows={5}
        />
        <Input label="Estimated budget (₦)" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
        <div>
          <label className="block mb-1 text-sm">Preferred start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-card border border-border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Select
          label="Location within Lagos"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          options={LAGOS_AREAS_OPTIONS}
          placeholder="Select location"
        />
        <TextArea
          label="Special requirements (optional)"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={3}
        />
        <div className="flex items-center justify-end">
          <Button onClick={submit} disabled={!valid}>Send Request to Seller</Button>
        </div>
      </Card>
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  )
}
