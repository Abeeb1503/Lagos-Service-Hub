import { useEffect, useMemo, useState } from 'react'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function SellerEarnings() {
  const { user } = useAuth()
  const [txs, setTxs] = useState([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  useEffect(() => {
    setTxs([])
  }, [user?.id])

  const filtered = useMemo(() => {
    return txs.filter((t) => {
      const d = new Date(t.date)
      const from = fromDate ? new Date(fromDate) : null
      const to = toDate ? new Date(toDate) : null
      return (!from || d >= from) && (!to || d <= to)
    })
  }, [txs, fromDate, toDate])

  function exportCSV() {
    if (filtered.length === 0) return
    const header = 'Job Title,Amount,Commission,Payout,Date,Status\n'
    const rows = filtered
      .map((t) => `${t.title},${t.amount},${t.commission},${t.payout},${t.date},${t.status}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'earnings.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Earnings</div>
          <Button variant="outline" onClick={exportCSV} disabled={filtered.length === 0}>Export CSV</Button>
        </div>
        <div className="text-sm text-text/70 mt-2">Payouts are recorded when admin releases escrow.</div>
      </Card>

      <Card className="p-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm">From date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-card border border-border rounded px-2 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1 text-sm">To date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-card border border-border rounded px-2 py-2 w-full" />
          </div>
          <div className="text-right">
            <div className="text-sm">Total: ₦{filtered.filter((t) => t.status === 'paid').reduce((a, b) => a + b.payout, 0).toLocaleString('en-NG')}</div>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-2">Job Title</th>
              <th className="text-left px-4 py-2">Amount</th>
              <th className="text-left px-4 py-2">Commission (10%)</th>
              <th className="text-left px-4 py-2">Payout</th>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-2">{t.title}</td>
                <td className="px-4 py-2">₦{t.amount.toLocaleString('en-NG')}</td>
                <td className="px-4 py-2">₦{t.commission.toLocaleString('en-NG')}</td>
                <td className="px-4 py-2">₦{t.payout.toLocaleString('en-NG')}</td>
                <td className="px-4 py-2">{t.date}</td>
                <td className="px-4 py-2">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-4">
        <div className="font-semibold mb-2">Pending payouts</div>
        <div className="space-y-2">
          {filtered.filter((t) => t.status === 'pending').map((t) => (
            <div key={t.id} className="flex items-center justify-between border border-border rounded p-3">
              <div className="text-sm">
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-text/70">Payout: ₦{t.payout.toLocaleString('en-NG')} • Date: {t.date}</div>
              </div>
              <Button variant="outline">View</Button>
            </div>
          ))}
          {filtered.filter((t) => t.status === 'pending').length === 0 ? (
            <div className="text-sm text-text/70">No pending payouts</div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
