import { useMemo, useState } from 'react'
import Card from '../common/Card.jsx'
import Input from '../common/Input.jsx'
import Select from '../common/Select.jsx'
import Button from '../common/Button.jsx'

export default function AdminTable({ columns = [], rows = [] }) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState(columns[0]?.key || '')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let r = rows.filter((row) => (q ? Object.values(row).some((v) => String(v).toLowerCase().includes(q)) : true))
    if (sortKey) {
      r = r.slice().sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (av === bv) return 0
        if (sortDir === 'asc') return av > bv ? 1 : -1
        return av < bv ? 1 : -1
      })
    }
    return r
  }, [rows, query, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const start = (page - 1) * pageSize
  const pageItems = filtered.slice(start, start + pageSize)

  function exportCSV() {
    const header = columns.map((c) => c.label).join(',')
    const data = filtered
      .map((row) => columns.map((c) => `"${String(row[c.key]).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const csv = [header, data].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          options={columns.map((c) => ({ value: c.key, label: `Sort by ${c.label}` }))}
        />
        <Select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value)}
          options={[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
          ]}
        />
        <Button variant="secondary" onClick={exportCSV}>Export CSV</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((c) => (
                <th key={c.key} className="text-left py-2 px-3">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row, i) => (
              <tr key={i} className="border-b border-border">
                {columns.map((c) => (
                  <td key={c.key} className="py-2 px-3">{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <div>Page {page} of {totalPages}</div>
        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
      </div>
    </Card>
  )
}
