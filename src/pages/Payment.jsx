import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { api } from '../services/api.js'

export default function Payment() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    setLoading(true)
    let mounted = true
    api
      .get(`/api/jobs/${id}`)
      .then((resp) => {
        if (mounted) setJob(resp.job || null)
      })
      .catch((e) => {
        if (mounted) setError(e.message || 'Failed to load payment')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) {
    return <div className="container-xl py-10 text-center">Loading payment…</div>
  }
  if (!job) {
    return <div className="container-xl py-10 text-center">Job not found</div>
  }

  const deposit = Math.round(Number(job.depositAmount || 0))
  const sellerReceives = Math.round((Number(job.agreedAmount || 0) - Number(job.platformCommission || 0)) || 0)

  async function onProceed() {
    setPaying(true)
    setError(null)
    try {
      const resp = await api.post('/api/payments/initialize', { jobId: job.id })
      window.location.href = resp.authorization_url
    } catch (e) {
      setError(e.message || 'Payment initialization failed')
      setPaying(false)
    }
  }

  return (
    <div className="container-xl space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar name={job.seller?.name || 'Seller'} src={job.seller?.avatar} size={64} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold">Payment for {job.title}</div>
              <Badge variant="info">Deposit</Badge>
            </div>
            <div className="text-sm mt-1">{job.description}</div>
            <div className="flex items-center gap-2 text-sm mt-2">
              <span className="font-medium">{job.seller?.name || 'Seller'}</span>
              <span className="text-text/70">• {job.seller?.sellerProfile?.category || 'General'}</span>
              <span className="text-text/70">• ₦{Number(job.agreedAmount || 0).toLocaleString('en-NG')}</span>
            </div>
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

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onProceed} disabled={paying}>{paying ? 'Redirecting…' : 'Proceed to Payment'}</Button>
          <Link to={`/chat/${job.id}`}>
            <Button variant="secondary">Chat with Seller</Button>
          </Link>
        </div>
      </Card>

      <AnimatePresence>
        {error ? (
          <motion.div initial={{ opacity: 0, y: reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -6 }} className="bg-danger text-white rounded px-3 py-2">
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
