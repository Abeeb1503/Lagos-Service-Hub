import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Select from '../../components/common/Select.jsx'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'
import Modal from '../../components/common/Modal.jsx'
import Toast from '../../components/common/Toast.jsx'
import { api } from '../../services/api.js'

export default function DisputeList() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('under')
  const [query, setQuery] = useState('')
  const [action, setAction] = useState(null)
  const [notes, setNotes] = useState('')
  const [percent, setPercent] = useState(50)
  const [toast, setToast] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    api
      .get('/api/admin/disputes')
      .then((resp) => {
        if (mounted) setAll(resp.data || [])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all
      .filter((d) => (filter === 'under' ? d.status === 'disputed' : false))
      .filter((d) => (filter === 'resolved' ? d.status === 'completed' : true))
      .filter((d) => (q ? d.title.toLowerCase().includes(q) : true))
  }, [all, filter, query])

  function openAction(item, type) {
    setAction({ item, type })
  }
  async function refresh() {
    const resp = await api.get('/api/admin/disputes')
    setAll(resp.data || [])
  }

  async function doResolve() {
    if (!notes.trim()) {
      setToast({ type: 'error', message: 'Resolution notes required' })
      return
    }
    setBusy(true)
    try {
      const map =
        action.type === 'Full Refund'
          ? { action: 'full_refund' }
          : action.type === 'Partial Refund'
            ? { action: 'partial_refund', percent }
            : { action: 'release_to_seller' }
      await api.post(`/api/admin/disputes/${action.item.id}/resolve`, { ...map, notes })
      setToast({ type: 'success', message: 'Dispute resolved' })
      setAction(null)
      setNotes('')
      await refresh()
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'Resolution failed' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: 'under', label: 'Under Review' },
            { value: 'resolved', label: 'Resolved' },
          ]}
        />
        <Input placeholder="Search job title" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {loading ? (
        <div className="text-center py-10">Loading disputes…</div>
      ) : items.length === 0 ? (
        <Card className="p-4 text-center">No active disputes</Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((d) => (
            <Card key={d.id} className="p-4 space-y-2">
              <div className="font-semibold">{d.title}</div>
              <div className="text-sm">Buyer: {d.buyer?.name} • Seller: {d.seller?.name}</div>
              <div className="text-sm">Amount: ₦{Number(d.agreedAmount).toLocaleString('en-NG')}</div>
              <div className="text-xs text-text/70">Updated: {new Date(d.updatedAt).toLocaleString()}</div>
              <div className="flex items-center gap-2">
                <Button variant="danger" onClick={() => openAction(d, 'Full Refund')}>Full Refund to Buyer</Button>
                <Button variant="secondary" onClick={() => openAction(d, 'Partial Refund')}>Partial Refund</Button>
                <Button variant="success" onClick={() => openAction(d, 'Release to Seller')}>Release to Seller</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {action ? (
        <Modal open={!!action} onClose={() => setAction(null)} title={action.type}>
          <Card className="p-4 space-y-3">
            <div className="font-semibold">{action.type}</div>
            {action.type === 'Partial Refund' ? (
              <div>
                <label className="block mb-1 text-sm">Refund percentage</label>
                <input type="range" min={0} max={100} value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="w-full" />
                <div className="text-sm">{percent}%</div>
              </div>
            ) : null}
            <div>
              <label className="block mb-1 text-sm">Resolution notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-card border border-border rounded px-3 py-2" rows={4} />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
              <Button onClick={doResolve} disabled={busy}>{busy ? 'Processing…' : 'Confirm'}</Button>
            </div>
          </Card>
        </Modal>
      ) : null}
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  )
}
