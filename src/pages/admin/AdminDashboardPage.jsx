import { useEffect, useState } from 'react'
import Greeting from '../../components/common/Greeting.jsx'
import Button from '../../components/common/Button.jsx'
import Card from '../../components/common/Card.jsx'
import AdminStats from '../../components/admin/AdminStats.jsx'
import { Link } from 'react-router-dom'
import { api } from '../../services/api.js'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      const to = now
      const [verifications, escrow, disputes, reports] = await Promise.all([
        api.get('/api/admin/verifications'),
        api.get('/api/admin/escrow'),
        api.get('/api/admin/disputes'),
        api.get(`/api/admin/reports?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`),
      ])
      if (!mounted) return
      setStats({
        pendingVerifications: (verifications.data || []).length,
        escrowAwaiting: (escrow.data || []).length,
        activeDisputes: (disputes.data || []).length,
        revenueThisMonth: reports.totalRevenue,
        commissionsEarned: reports.totalCommissions,
        activeSellers: 0,
        activeBuyers: 0,
        totalJobsCompleted: reports.jobsCompleted,
      })
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  if (!stats) {
    return <div className="container-xl py-10 text-center">Loading admin overview…</div>
  }

  return (
    <div className="space-y-6">
      <Greeting name="Admin" />
      <AdminStats stats={stats} />

      <div className="flex flex-wrap items-center gap-2">
        <Link to="/admin/verifications">
          <Button variant={stats.pendingVerifications > 0 ? 'danger' : 'outline'}>Review Verifications</Button>
        </Link>
        <Link to="/admin/escrow">
          <Button variant={stats.escrowAwaiting > 0 ? 'primary' : 'outline'}>Release Escrow</Button>
        </Link>
        <Link to="/admin/disputes">
          <Button variant="outline">View Disputes</Button>
        </Link>
        <Link to="/admin/reports">
          <Button variant="secondary">Generate Report</Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="font-semibold mb-3">Recent Activity</div>
        <div className="text-sm">No recent activity</div>
      </Card>
    </div>
  )
}
