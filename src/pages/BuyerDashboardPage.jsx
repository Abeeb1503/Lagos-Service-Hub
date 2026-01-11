import { useEffect, useMemo, useState } from 'react'
import Greeting from '../components/common/Greeting.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import JobCard from '../components/job/JobCard.jsx'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api.js'

export default function BuyerDashboardPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    let mounted = true
    api
      .get('/api/jobs')
      .then((resp) => {
        if (mounted) setJobs(resp.data || [])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [user])

  const stats = useMemo(() => {
    const activeStatuses = ['proposed', 'funded', 'in_progress', 'partial_completed']
    const active = jobs.filter((j) => activeStatuses.includes(j.status)).length
    const completed = jobs.filter((j) => j.status === 'completed').length
    const spent = jobs
      .filter((j) => j.status === 'completed' || j.status === 'funded' || j.status === 'partial_completed')
      .reduce((sum, j) => sum + Number(j.agreedAmount || 0), 0)
    return { active, completed, spent }
  }, [jobs])

  const filtered = useMemo(() => {
    if (tab === 'active') return jobs.filter((j) => ['proposed', 'funded', 'in_progress', 'partial_completed'].includes(j.status))
    if (tab === 'completed') return jobs.filter((j) => j.status === 'completed')
    return jobs
  }, [jobs, tab])

  return (
    <div className="space-y-6">
      <Greeting name={user?.name || 'Buyer'} />
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary" />
            <div>
              <div className="text-sm">Active Jobs</div>
              <div className="text-xl font-semibold">{stats.active}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-secondary" />
            <div>
              <div className="text-sm">Completed Jobs</div>
              <div className="text-xl font-semibold">{stats.completed}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-accent" />
            <div>
              <div className="text-sm">Total Spent</div>
              <div className="text-xl font-semibold">₦{stats.spent.toLocaleString('en-NG')}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={tab === 'active' ? 'primary' : 'outline'} onClick={() => setTab('active')}>Active Jobs</Button>
        <Button variant={tab === 'completed' ? 'primary' : 'outline'} onClick={() => setTab('completed')}>Completed Jobs</Button>
        <Button variant={tab === 'all' ? 'primary' : 'outline'} onClick={() => setTab('all')}>All Jobs</Button>
      </div>

      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-3/5 bg-muted rounded" />
                  <div className="h-4 w-2/5 bg-muted rounded" />
                  <div className="h-24 bg-muted rounded" />
                </div>
              </Card>
            ))}
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 space-y-3">
            <div className="text-sm">No jobs yet. Browse sellers to get started!</div>
            <Link to="/browse">
              <Button>Browse sellers</Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
