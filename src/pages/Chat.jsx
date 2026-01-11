import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import Avatar from '../components/common/Avatar.jsx'
import TextArea from '../components/common/TextArea.jsx'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { api } from '../services/api.js'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Chat() {
  const { jobId } = useParams()
  const reduce = useReducedMotion()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    let mounted = true
    Promise.all([api.get(`/api/jobs/${jobId}`), api.get(`/api/chats/jobs/${jobId}/messages?page=1&limit=50`)])
      .then(([j, m]) => {
        if (!mounted) return
        setJob(j.job || null)
        const items = (m.data || []).slice().reverse()
        setMessages(items)
      })
      .catch((e) => {
        if (mounted) setError(e.message || 'Failed to load chat')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [jobId])

  const otherUserId = useMemo(() => {
    if (!job || !user) return null
    if (user.id === job.buyerId) return job.sellerId
    if (user.id === job.sellerId) return job.buyerId
    return null
  }, [job, user])

  useEffect(() => {
    if (!job || !user) return
    let cancelled = false

    const poll = async () => {
      try {
        const m = await api.get(`/api/chats/jobs/${job.id}/messages?page=1&limit=50`)
        if (cancelled) return
        const items = (m.data || []).slice().reverse()
        setMessages(items)
      } catch (e) {
        if (cancelled) return
      }
    }

    poll()
    const intervalId = setInterval(poll, 5000)
    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [job, user])

  async function sendMessage() {
    const text = input.trim()
    if (!text || !otherUserId) return
    setInput('')
    try {
      const res = await api.post('/api/chats/messages', { jobId: job.id, toUserId: otherUserId, text, attachments: [] })
      if (res?.message) setMessages((prev) => [...prev, res.message])
    } catch (e) {
      setError(e.message || 'Failed to send message')
    }
  }

  if (loading) {
    return <div className="container-xl py-10 text-center">Loading chat…</div>
  }
  if (!job) {
    return <div className="container-xl py-10 text-center">{error || 'Chat not found'}</div>
  }

  return (
    <div className="container-xl space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={job.seller?.name || 'Seller'} src={job.seller?.avatar} size={40} />
            <div>
              <div className="font-semibold">{job.title}</div>
              <div className="text-xs text-text/70">{job.seller?.sellerProfile?.category || 'General'}</div>
            </div>
          </div>
          <Link to={`/sellers/${job.sellerId}`}>
            <Button variant="outline">View Profile</Button>
          </Link>
        </div>
      </Card>

      <Card className="p-6">
        <div className="h-80 overflow-y-auto space-y-2 border border-border rounded p-3 bg-muted/30">
          <AnimatePresence>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                className={`max-w-[70%] rounded px-3 py-2 ${m.fromUserId === user?.id ? 'bg-primary text-white ml-auto' : 'bg-border text-text'}`}
              >
                <div className="text-sm">{m.messageText}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <TextArea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message…" className="flex-1" rows={2} />
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </Card>
    </div>
  )
}
