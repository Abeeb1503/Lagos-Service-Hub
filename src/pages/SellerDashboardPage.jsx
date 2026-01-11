import { useEffect, useState } from 'react'
import Greeting from '../components/common/Greeting.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import Badge from '../components/common/Badge.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

export default function SellerDashboardPage() {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('seller_sidebar') === 'collapsed')
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    localStorage.setItem('seller_sidebar', collapsed ? 'collapsed' : 'expanded')
  }, [collapsed])

  useEffect(() => {
    if (!user) return
    let mounted = true
    api.get('/api/jobs').then((resp) => {
      if (mounted) setJobs(resp.data || [])
    })
    return () => {
      mounted = false
    }
  }, [user?.id])

  const stats = {
    totalEarnings: 0,
    activeJobs: jobs.filter((j) => ['funded', 'in_progress', 'partial_completed'].includes(j.status)).length,
    completedJobs: jobs.filter((j) => j.status === 'completed').length,
    rating: user?.sellerProfile?.rating || 0,
  }

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      <aside>
        <Button variant="outline" className="mb-3" onClick={() => setCollapsed((c) => !c)}>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          {collapsed ? 'Expand' : 'Collapse'}
        </Button>
        <AnimatePresence>
          {!collapsed ? (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <Card className="p-3 space-y-2">
                <Link to="/seller" className="block px-2 py-1 rounded hover:bg-muted"><span>🏠</span> Dashboard</Link>
                <Link to="/seller" className="block px-2 py-1 rounded hover:bg-muted"><span>💼</span> My Jobs</Link>
                <Link to="/seller/earnings" className="block px-2 py-1 rounded hover:bg-muted"><span>💰</span> Earnings</Link>
                <Link to="/seller/profile" className="block px-2 py-1 rounded hover:bg-muted"><span>🖼️</span> Portfolio</Link>
                <Link to="/seller/settings" className="block px-2 py-1 rounded hover:bg-muted"><span>⚙️</span> Profile Settings</Link>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </aside>
      <main className="space-y-6">
        {localStorage.getItem('seller_verification_status') === 'pending' ? (
          <Card className="p-4">
            <div className="text-sm">Your ID is being verified</div>
          </Card>
        ) : null}

        <Card className="p-4">
          <Greeting name={user?.name || 'Seller'} />
        </Card>
        <div className="grid sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-xs">Total Earnings</div>
            <div className="text-lg font-semibold">₦{stats.totalEarnings.toLocaleString('en-NG')}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-xs">Active Jobs</div>
            <div className="text-lg font-semibold">{stats.activeJobs}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-xs">Completed Jobs</div>
            <div className="text-lg font-semibold">{stats.completedJobs}</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-xs">Rating</div>
            <div className="text-lg font-semibold">{stats.rating}⭐</div>
          </Card>
        </div>

        <Card className="p-4">
          <div className="font-semibold mb-3">My Jobs</div>
          <div className="space-y-3">
            {jobs.slice(0, 5).map((j) => (
              <div key={j.id} className="flex items-center justify-between border border-border rounded p-3">
                <div className="text-sm">
                  <div className="font-medium">{j.title}</div>
                  <div className="text-xs text-text/70">Status: {j.status} • Amount: ₦{Number(j.agreedAmount || 0).toLocaleString('en-NG')}</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/jobs/${j.id}`}>
                    <Button variant="secondary">Open</Button>
                  </Link>
                </div>
              </div>
            ))}
            {jobs.length === 0 ? <div className="text-sm text-text/70">No jobs yet</div> : null}
          </div>
        </Card>

        <Card className="p-4">
          <div className="font-semibold mb-3">Earnings</div>
          <div className="text-sm text-text/70">Payout reporting is available in the Admin reports view.</div>
        </Card>
      </main>
    </div>
  )
}
