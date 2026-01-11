import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Input from '../../components/common/Input.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import Modal from '../../components/common/Modal.jsx'
import Toast from '../../components/common/Toast.jsx'
import { api } from '../../services/api.js'

export default function VerificationQueue() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState([])
  const [bulk, setBulk] = useState(null)
  const [reason, setReason] = useState('')
  const [toast, setToast] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    api
      .get('/api/admin/verifications')
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
      .filter((v) => (filter ? v.verificationStatus === filter : true))
      .filter((v) => (q ? v.name.toLowerCase().includes(q) : true))
  }, [all, filter, query])

  function toggleSelect(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function refresh() {
    const resp = await api.get('/api/admin/verifications')
    setAll(resp.data || [])
  }

  function startBulk(type) {
    setBulk({ type })
  }

  async function confirmBulk() {
    if (!bulk) return
    if (bulk.type === 'reject' && !reason.trim()) {
      setToast({ type: 'error', message: 'Enter rejection reason' })
      return
    }
    setBusy(true)
    try {
      const ids = bulk.single ? [bulk.single] : selected
      for (const id of ids) {
        if (bulk.type === 'approve') {
          await api.post(`/api/admin/verifications/${id}/approve`, {})
        } else if (bulk.type === 'reject') {
          await api.post(`/api/admin/verifications/${id}/reject`, { reason })
        }
      }
      setToast({ type: 'success', message: bulk.type === 'approve' ? 'Selected sellers approved' : 'Selected sellers rejected' })
      await refresh()
    } catch (e) {
      setToast({ type: 'error', message: e.message || 'Action failed' })
    } finally {
      setBusy(false)
    }
    setBulk(null)
    setReason('')
    setSelected([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: '', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
        />
        <Input placeholder="Search seller name" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button variant="success" disabled={selected.length === 0} onClick={() => startBulk('approve')}>Approve Selected</Button>
        <Button variant="danger" disabled={selected.length === 0} onClick={() => startBulk('reject')}>Reject Selected</Button>
      </div>
      {loading ? (
        <div className="text-center py-10">Loading verifications…</div>
      ) : items.length === 0 ? (
        <Card className="p-4 text-center">No pending verifications</Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <div key={it.sellerId}>
              <div className="flex items-center justify-between mb-2">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={selected.includes(it.sellerId)} onChange={() => toggleSelect(it.sellerId)} />
                  <span className="text-sm">Select</span>
                </label>
              </div>
              <Card className="p-4 space-y-3">
                <div className="font-semibold">{it.name}</div>
                <div className="text-sm text-text/70">{it.email}</div>
                <div className="text-sm">Category: {it.category}</div>
                <div className="text-xs text-text/70">Status: {it.verificationStatus}</div>
                <div className="flex items-center gap-2">
                  <Button variant="success" onClick={() => setBulk({ type: 'approve', single: it.sellerId })}>Approve</Button>
                  <Button variant="danger" onClick={() => setBulk({ type: 'reject', single: it.sellerId })}>Reject</Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
      {bulk ? (
        <Modal open={!!bulk} onClose={() => setBulk(null)} title={bulk.type === 'approve' ? 'Confirm Bulk Approval' : 'Confirm Bulk Rejection'}>
          <Card className="p-4 space-y-3">
            <div className="font-semibold">
              {bulk.type === 'approve' ? 'Confirm Bulk Approval' : 'Confirm Bulk Rejection'}
            </div>
            <div className="text-sm">Total selected: {selected.length}</div>
            {bulk.type === 'reject' ? (
              <div>
                <label className="block mb-1 text-sm">Rejection reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-card border border-border rounded px-3 py-2"
                  rows={3}
                />
              </div>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setBulk(null)}>Cancel</Button>
              <Button onClick={confirmBulk} disabled={busy}>{busy ? 'Processing…' : 'Confirm'}</Button>
            </div>
          </Card>
        </Modal>
      ) : null}
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  )
}
