import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import JobStatus from '../components/job/JobStatus.jsx'
import SatisfactionReport from '../components/buyer/SatisfactionReport.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api.js'

export default function JobDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setLoading(true)
    let mounted = true
    api
      .get(`/api/jobs/${id}`)
      .then((resp) => {
        if (mounted) setJob(resp.job || null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return <div className="container-xl py-10 text-center">Loading job details…</div>
  }
  if (!job) {
    return <div className="container-xl py-10 text-center">Job not found</div>
  }

  const deposit = Math.round(Number(job.depositAmount || 0))
  const commission = Math.round(Number(job.platformCommission || 0))
  const sellerReceives = Math.round((Number(job.agreedAmount || 0) - Number(job.platformCommission || 0)) || 0)

  function onPayDeposit() {
    navigate(`/payment/${job.id}`)
  }

  return (
    <div className="container-xl space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar name={job.seller?.name || 'Seller'} src={job.seller?.avatar} size={64} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold">{job.title}</div>
              {job.status === 'proposed' ? <Badge className="bg-border text-text">Proposed</Badge> : null}
              {job.status === 'funded' ? <Badge variant="info">Funded</Badge> : null}
              {job.status === 'in_progress' ? <Badge variant="warning">In Progress</Badge> : null}
              {job.status === 'partial_completed' ? <Badge className="bg-primary text-white">Partial Completed</Badge> : null}
              {job.status === 'completed' ? <Badge variant="success">Completed</Badge> : null}
            </div>
            <div className="text-sm mt-1">{job.description}</div>
            <div className="flex items-center gap-2 text-sm mt-2">
              <span className="font-medium">{job.seller?.name || 'Seller'}</span>
              <span className="text-text/70">• {job.seller?.sellerProfile?.category || 'General'}</span>
              <span className="text-text/70">• ₦{Number(job.agreedAmount || 0).toLocaleString('en-NG')}</span>
            </div>
            <div className="text-xs text-text/70 mt-1">Created: {new Date(job.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <div className="font-semibold">Amount Breakdown</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm">Total</div>
            <div className="text-lg font-semibold">₦{Number(job.agreedAmount || 0).toLocaleString('en-NG')}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm">Your deposit (70%)</div>
            <div className="text-lg font-semibold">₦{deposit.toLocaleString('en-NG')}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm">Platform holds</div>
            <div className="text-lg font-semibold">₦{deposit.toLocaleString('en-NG')}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm">Seller receives after completion (10% commission)</div>
            <div className="text-lg font-semibold">₦{sellerReceives.toLocaleString('en-NG')}</div>
          </Card>
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <div className="font-semibold">Job Status</div>
        <JobStatus status={job.status} paymentReleased={false} />
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          {job.status === 'proposed' ? <Button onClick={onPayDeposit}>Pay Deposit (₦{deposit.toLocaleString('en-NG')})</Button> : null}
          {job.status === 'funded' ? (
            <>
              <Link to={`/payment/${job.id}`}>
                <Button>Payment</Button>
              </Link>
              <Link to={`/chat/${job.id}`}>
                <Button variant="secondary">Chat with Seller</Button>
              </Link>
            </>
          ) : null}
          {job.status === 'in_progress' ? <Button onClick={() => setShowReport(true)}>Submit Satisfaction Report</Button> : null}
          {job.status === 'partial_completed' ? <Button variant="outline" disabled>Waiting for admin approval</Button> : null}
          {job.status === 'completed' ? <Button variant="secondary" onClick={() => setToast({ type: 'success', message: 'Thank you for your review' })}>Rate & Review</Button> : null}
        </div>
      </Card>

      <AnimatePresence>
        {showReport ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
              <SatisfactionReport
                jobId={job.id}
                onSubmitted={() => {
                  api.get(`/api/jobs/${job.id}`).then((resp) => setJob(resp.job))
                  setShowReport(false)
                }}
              />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card className="p-6">
        <div className="font-semibold mb-3">Satisfaction Reports</div>
        {job.satisfactionReports?.length ? (
          <div className="space-y-3">
            {job.satisfactionReports.map((r) => (
              <div key={r.id} className="border border-border rounded p-3">
                <div className="text-sm">Completion: {r.percentage}% • {r.level}</div>
                <div className="text-xs text-text/70">{new Date(r.date).toLocaleString()}</div>
                <div className="mt-1 text-sm">{r.comments}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-text/70">No reports yet</div>
        )}
      </Card>

      {toast ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className={`rounded px-3 py-2 ${toast.type === 'success' ? 'bg-primary text-white' : 'bg-danger text-white'}`}
        >
          {toast.message}
        </motion.div>
      ) : null}
    </div>
  )
}
