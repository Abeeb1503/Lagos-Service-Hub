import Card from '../common/Card.jsx'
import Badge from '../common/Badge.jsx'

export default function AdminStats({ stats }) {
  const items = [
    { label: 'Pending Verifications', value: stats.pendingVerifications, color: 'bg-danger' },
    { label: 'Escrow Awaiting Release', value: stats.escrowAwaiting, color: 'bg-primary' },
    { label: 'Active Disputes', value: stats.activeDisputes, color: 'bg-danger' },
    { label: 'Revenue This Month', value: `₦${Number(stats.revenueThisMonth || 0).toLocaleString('en-NG')}`, color: 'bg-secondary' },
    { label: 'Total Commissions', value: `₦${Number(stats.commissionsEarned || 0).toLocaleString('en-NG')}`, color: 'bg-secondary' },
    { label: 'Active Sellers', value: stats.activeSellers, color: 'bg-accent' },
    { label: 'Active Buyers', value: stats.activeBuyers, color: 'bg-accent' },
    { label: 'Jobs Completed', value: stats.totalJobsCompleted, color: 'bg-green-600' },
  ]
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((it, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded ${it.color}`} />
            <div>
              <div className="text-sm">{it.label}</div>
              <div className="text-xl font-semibold">{it.value}</div>
            </div>
            {(it.label === 'Pending Verifications' && Number(stats.pendingVerifications) > 0) || (it.label === 'Active Disputes' && Number(stats.activeDisputes) > 0) ? (
              <Badge variant="danger">Attention</Badge>
            ) : null}
            {it.label === 'Escrow Awaiting Release' && Number(stats.escrowAwaiting) > 0 ? <Badge className="bg-primary text-white">Pending</Badge> : null}
          </div>
        </Card>
      ))}
    </div>
  )
}
