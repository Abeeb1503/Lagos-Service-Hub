import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Select from '../../components/common/Select.jsx'
import Button from '../../components/common/Button.jsx'
import AdminChart from '../../components/admin/AdminChart.jsx'
import AdminTable from '../../components/admin/AdminTable.jsx'
import { api } from '../../services/api.js'

export default function FinancialReports() {
  const [finance, setFinance] = useState(null)
  const [range, setRange] = useState('month')

  useEffect(() => {
    let mounted = true
    const now = new Date()
    const from =
      range === 'week'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        : range === 'year'
          ? new Date(now.getFullYear(), 0, 1)
          : new Date(now.getFullYear(), now.getMonth(), 1)
    const to = now

    api
      .get(`/api/admin/reports?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`)
      .then((resp) => {
        if (mounted) setFinance(resp)
      })
    return () => {
      mounted = false
    }
  }, [range])

  if (!finance) {
    return <div className="text-center py-10">Loading financials…</div>
  }

  const summary = useMemo(() => {
    const totalRevenue = Number(finance.totalRevenue || 0)
    const totalCommissions = Number(finance.totalCommissions || 0)
    const totalPayouts = Number(finance.totalPayouts || 0)
    const avgJobValue = finance.jobsCompleted ? Math.round(totalRevenue / Math.max(1, finance.jobsCompleted)) : 0
    return { totalRevenue, totalCommissions, totalPayouts, avgJobValue }
  }, [finance])

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'jobId', label: 'Job ID' },
    { key: 'buyer', label: 'Buyer' },
    { key: 'seller', label: 'Seller' },
    { key: 'amount', label: 'Amount', render: (v) => `₦${Number(v).toLocaleString('en-NG')}` },
    { key: 'commission', label: 'Commission', render: (v) => `₦${Number(v).toLocaleString('en-NG')}` },
    { key: 'status', label: 'Status' },
  ]

  function printReport() {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          options={[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'year', label: 'This Year' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
        <Button variant="secondary" onClick={printReport}>Generate PDF Report</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm">Total Revenue</div>
          <div className="text-xl font-semibold">₦{summary.totalRevenue.toLocaleString('en-NG')}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm">Total Commissions</div>
          <div className="text-xl font-semibold">₦{summary.totalCommissions.toLocaleString('en-NG')}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm">Total Payouts</div>
          <div className="text-xl font-semibold">₦{summary.totalPayouts.toLocaleString('en-NG')}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm">Average Job Value</div>
          <div className="text-xl font-semibold">₦{summary.avgJobValue.toLocaleString('en-NG')}</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-4 lg:col-span-2">
          <div className="font-semibold">Category performance</div>
          <AdminChart
            type="pie"
            data={Object.entries(finance.revenueByCategory || {}).map(([category, jobs]) => ({ label: category, value: jobs }))}
          />
        </Card>
      </div>

      <AdminTable columns={columns} rows={[]} />
    </div>
  )
}
