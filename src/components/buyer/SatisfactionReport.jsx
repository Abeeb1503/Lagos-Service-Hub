import { useState } from 'react'
import Card from '../common/Card.jsx'
import Button from '../common/Button.jsx'
import TextArea from '../common/TextArea.jsx'
import Toast from '../common/Toast.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function SatisfactionReport({ jobId, onSubmitted }) {
  const [percentage, setPercentage] = useState(50)
  const [level, setLevel] = useState('')
  const [comments, setComments] = useState('')
  const [photos, setPhotos] = useState([])
  const [toast, setToast] = useState(null)

  const okPercent = percentage >= 50
  const okComments = comments.trim().length >= 20
  const disabled = !(okPercent && okComments && level)

  function onFileAdd(files) {
    const arr = Array.from(files)
      .slice(0, 3)
      .map((f) => ({ file: f, name: f.name, url: URL.createObjectURL(f) }))
    setPhotos((p) => [...p, ...arr].slice(0, 3))
  }

  function removePhoto(idx) {
    setPhotos((p) => p.filter((_, i) => i !== idx))
  }

  async function submit() {
    try {
      const fd = new FormData()
      fd.append('percentage', String(percentage))
      fd.append('comments', `Satisfaction: ${level}\n\n${comments}`)
      photos.forEach((p) => fd.append('photos', p.file))

      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/satisfaction`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to submit report')

      setToast({ type: 'success', message: 'Report submitted! Admin will review and release funds to seller.' })
      if (onSubmitted) onSubmitted(data.job)
      setPercentage(50)
      setLevel('')
      setComments('')
      setPhotos([])
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'Failed to submit report' })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div>
          <label className="block mb-1 text-sm">Completion percentage</label>
          <input
            type="range"
            min={0}
            max={100}
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-full"
          />
          <div className={`mt-1 text-sm ${okPercent ? 'text-green-600' : 'text-danger'}`}>{percentage}%</div>
          {!okPercent ? (
            <div className="mt-1 text-sm text-danger">Work must be at least 50% complete before admin can release funds</div>
          ) : null}
        </div>
        <div className="space-y-2">
          <div className="text-sm">Satisfaction level</div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="level" value="Very Satisfied" checked={level === 'Very Satisfied'} onChange={(e) => setLevel(e.target.value)} />
              <span>Very Satisfied</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="level" value="Satisfied" checked={level === 'Satisfied'} onChange={(e) => setLevel(e.target.value)} />
              <span>Satisfied</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="level" value="Needs Improvement" checked={level === 'Needs Improvement'} onChange={(e) => setLevel(e.target.value)} />
              <span>Needs Improvement</span>
            </label>
          </div>
        </div>
        <TextArea
          label="Comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Describe the work progress and your satisfaction"
          rows={4}
        />
        <div>
          <label className="block mb-1 text-sm">Upload photos (optional, up to 3)</label>
          <input type="file" accept="image/*" multiple onChange={(e) => onFileAdd(e.target.files)} />
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                <img src={p.url} alt={p.name} className="w-full h-24 object-cover rounded border border-border" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-card/80 rounded p-1 border border-border"
                  aria-label="Remove photo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button onClick={submit} disabled={disabled}>Submit Report</Button>
        </div>
      </Card>
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  )
}
