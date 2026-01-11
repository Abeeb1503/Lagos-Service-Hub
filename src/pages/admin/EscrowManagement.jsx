import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/common/Card.jsx'
import Select from '../../components/common/Select.jsx'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'
import { api } from '../../services/api.js'

export default function EscrowManagement() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ready')
  const [sort, setSort] = useState('date')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    api
      .get('/api/admin/escrow')
      .then((resp) => {
        if (mounted) setAll(resp.data || [])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    let arr = all
      .filter((e) => (filter === 'ready' ? ((e.satisfactionReports || []).slice(-1)[0]?.percentage || 0) >= 50 : true))
      .filter((e) => (filter === 'disputed' ? e.status === 'disputed' : true))
      .filter((e) => (filter === 'released' ? e.status === 'completed' : true))
      .filter((e) => (q ? e.title.toLowerCase().includes(q) : true))
    if (sort === 'date') {
      arr = arr.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    } else if (sort === 'amount') {
      arr = arr.slice().sort((a, b) => b.agreedAmount - a.agreedAmount)
    } else if (sort === 'waiting') {
      arr = arr.slice().sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
    }
    return arr
  }, [all, filter, sort, query])

  async function refresh() {
    const resp = await api.get('/api/admin/escrow')
    setAll(resp.data || [])
  }

  async function release(jobId) {
    await api.post(`/api/admin/escrow/${jobId}/release`, {})
    await refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'ready', label: 'Ready for Release' },
            { value: 'disputed', label: 'Disputed' },
            { value: 'released', label: 'Released' },
          ]}
        />
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          options={[
            { value: 'date', label: 'Date' },
            { value: 'amount', label: 'Amount' },
            { value: 'waiting', label: 'Waiting Time' },
          ]}
        />
        <Input placeholder="Search job title" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {loading ? (
        <div className="text-center py-10">Loading escrow queue…</div>
      ) : items.length === 0 ? (
        <Card className="p-4 text-center">No items match filter</Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <Card key={it.id} className="p-4 space-y-2">
              <div className="font-semibold">{it.title}</div>
              <div className="text-sm text-text/70">₦{Number(it.agreedAmount || 0).toLocaleString('en-NG')}</div>
              <div className="text-xs text-text/70">Status: {it.status}</div>
              <div className="flex items-center justify-end">
                <Button variant="success" onClick={() => release(it.id)} disabled={it.status !== 'partial_completed'}>
                  Release Escrow
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
