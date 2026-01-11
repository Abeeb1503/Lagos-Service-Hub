import { useState } from 'react'
import Card from '../common/Card.jsx'
import Avatar from '../common/Avatar.jsx'
import Badge from '../common/Badge.jsx'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'
import Toast from '../common/Toast.jsx'
import IDViewer from './IDViewer.jsx'
import { api } from '../../services/api.js'

export default function VerificationCard({ item, onChange }) {
  const [openId, setOpenId] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [reason, setReason] = useState('')
  const [toast, setToast] = useState(null)
  const [busy, setBusy] = useState(false)

  function onApprove() {
    setConfirm({ type: 'approve' })
  }
  function onReject() {
    setConfirm({ type: 'reject' })
  }
  function doConfirm() {
    setBusy(true)
    if (confirm?.type === 'approve') {
      api
        .post(`/api/admin/verifications/${item.sellerId || item.id}/approve`, {})
        .then(() => {
          setToast({ type: 'success', message: 'Seller approved' })
          setConfirm(null)
          if (onChange) onChange()
        })
        .catch((e) => setToast({ type: 'error', message: e.message || 'Approval failed' }))
        .finally(() => setBusy(false))
    } else if (confirm?.type === 'reject') {
      if (!reason.trim()) {
        setBusy(false)
        setToast({ type: 'error', message: 'Enter rejection reason' })
        return
      }
      api
        .post(`/api/admin/verifications/${item.sellerId || item.id}/reject`, { reason })
        .then(() => {
          setToast({ type: 'success', message: 'Seller rejected' })
          setConfirm(null)
          setReason('')
          if (onChange) onChange()
        })
        .catch((e) => setToast({ type: 'error', message: e.message || 'Rejection failed' }))
        .finally(() => setBusy(false))
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar src={item.avatar} name={item.name} size={48} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{item.name}</div>
            <Badge variant="info">{item.category}</Badge>
            <span className="text-sm text-text/70">• {item.location}, Lagos</span>
          </div>
          <div className="text-xs text-text/70">Registered: {new Date(item.registeredAt).toLocaleDateString()}</div>
          <div className="text-xs">Phone: {item.phone} • Email: {item.email}</div>
        </div>
        <Badge className="bg-border text-text capitalize">{item.status}</Badge>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {item.idDocs.map((doc, i) => (
          <button key={i} className="border border-border rounded overflow-hidden" onClick={() => setOpenId(doc.url)}>
            <img src={doc.url} alt={doc.name} className="w-full h-32 object-cover" />
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-4 gap-3">
        {item.portfolio.map((img, i) => (
          <img key={i} src={img} alt={`Portfolio ${i + 1}`} className="w-full h-24 object-cover rounded border border-border" />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="success" onClick={onApprove} disabled={busy}>Approve</Button>
        <Button variant="danger" onClick={onReject} disabled={busy}>Reject</Button>
        <Button variant="outline">View Full Profile</Button>
      </div>
      {openId ? (
        <Modal open={!!openId} onClose={() => setOpenId(null)} title="ID Document">
          <IDViewer src={openId} />
        </Modal>
      ) : null}
      {confirm ? (
        <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}>
          <Card className="p-4 space-y-3">
            <div className="font-semibold">Confirm {confirm.type === 'approve' ? 'Approval' : 'Rejection'}</div>
            {confirm.type === 'reject' ? (
              <div>
                <label className="block mb-1 text-sm">Reason</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full bg-card border border-border rounded px-3 py-2" rows={3} />
              </div>
            ) : null}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
              <Button onClick={doConfirm} disabled={busy}>{busy ? 'Processing…' : 'Confirm'}</Button>
            </div>
          </Card>
        </Modal>
      ) : null}
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </Card>
  )
}
