import Card from '../common/Card.jsx'
import Avatar from '../common/Avatar.jsx'
import Badge from '../common/Badge.jsx'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'
import Toast from '../common/Toast.jsx'
import { useState } from 'react'
import { api } from '../../services/api.js'

export default function EscrowReleaseCard({ item, onChange }) {
  const [confirm, setConfirm] = useState(false)
  const [toast, setToast] = useState(null)
  const [moreInfo, setMoreInfo] = useState(false)
  const [dispute, setDispute] = useState(false)
  const [busy, setBusy] = useState(false)
  const canRelease = (item.report?.percentage || 0) >= 50 && !item.released

  function doRelease() {
    setBusy(true)
    api
      .post(`/api/admin/escrow/${item.jobId}/release`, {})
      .then(() => {
        setToast({ type: 'success', message: 'Funds released' })
        setConfirm(false)
        if (onChange) onChange()
      })
      .catch((e) => setToast({ type: 'error', message: e.message || 'Release failed' }))
      .finally(() => setBusy(false))
  }

  function doFlagDispute() {
    setBusy(true)
    api
      .patch(`/api/jobs/${item.jobId}/status`, { status: 'disputed' })
      .then(() => {
        setToast({ type: 'success', message: 'Job flagged as dispute' })
        setDispute(false)
        if (onChange) onChange()
      })
      .catch((e) => setToast({ type: 'error', message: e.message || 'Failed to flag dispute' }))
      .finally(() => setBusy(false))
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Avatar name={item.buyerName} src={item.buyerAvatar} size={40} />
        <Avatar name={item.sellerName} src={item.sellerAvatar} size={40} />
        <div className="flex-1">
          <div className="font-semibold">{item.title}</div>
          <div className="text-xs text-text/70">Job ID: {item.jobId}</div>
          <div className="flex items-center gap-2 text-sm">
            <span>Agreed: ₦{item.amountTotal.toLocaleString('en-NG')}</span>
            <span>• Escrow: ₦{item.deposit.toLocaleString('en-NG')}</span>
            <span>• Commission: ₦{item.commission.toLocaleString('en-NG')}</span>
            <span>• Payout: ₦{item.payout.toLocaleString('en-NG')}</span>
          </div>
        </div>
        <Badge className="bg-border text-text">{item.status}</Badge>
      </div>
      {item.report ? (
        <div className="text-sm">
          <div>Completion: {item.report.percentage}% • {item.report.level}</div>
          <div className="text-text/70">Comments: {item.report.comments}</div>
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <Button variant="success" disabled={!canRelease} onClick={() => setConfirm(true)}>Release Funds</Button>
        <Button variant="secondary" onClick={() => setMoreInfo(true)}>Request More Info</Button>
        <Button variant="danger" onClick={() => setDispute(true)}>Flag as Dispute</Button>
      </div>
      {confirm ? (
        <Modal open={confirm} onClose={() => setConfirm(false)} title="Confirm Release">
          <Card className="p-4 space-y-3">
            <div className="font-semibold">Confirm Release</div>
            <div className="text-sm">Payout to seller: ₦{item.payout.toLocaleString('en-NG')}</div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button>
              <Button onClick={doRelease} disabled={busy}>{busy ? 'Processing…' : 'Confirm'}</Button>
            </div>
          </Card>
        </Modal>
      ) : null}
      {moreInfo ? (
        <Modal open={moreInfo} onClose={() => setMoreInfo(false)} title="Request More Info">
          <Card className="p-4 space-y-3">
            <div className="font-semibold">Request More Info</div>
            <div className="text-sm">A request will be sent to buyer and seller.</div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setMoreInfo(false)}>Close</Button>
              <Button onClick={() => setMoreInfo(false)}>Send</Button>
            </div>
          </Card>
        </Modal>
      ) : null}
      {dispute ? (
        <Modal open={dispute} onClose={() => setDispute(false)} title="Flag as Dispute">
          <Card className="p-4 space-y-3">
            <div className="font-semibold">Flag as Dispute</div>
            <div className="text-sm">This job will move to disputes for review.</div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setDispute(false)}>Cancel</Button>
              <Button variant="danger" onClick={doFlagDispute} disabled={busy}>{busy ? 'Processing…' : 'Confirm'}</Button>
            </div>
          </Card>
        </Modal>
      ) : null}
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </Card>
  )
}
