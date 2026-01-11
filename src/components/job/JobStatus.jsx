import { useMemo } from 'react'

const STEPS = [
  { key: 1, label: 'Job Created ✓' },
  { key: 2, label: 'Payment Made ✓' },
  { key: 3, label: 'Work In Progress ⏳' },
  { key: 4, label: 'Work Completed ⏳' },
  { key: 5, label: 'Payment Released ⏳' },
]

function statusToStep(status, released) {
  if (status === 'Proposed' || status === 'proposed') return 1
  if (status === 'Funded' || status === 'funded') return 2
  if (status === 'In Progress' || status === 'in_progress') return 3
  if (status === 'Partial Completed' || status === 'partial_completed') return 4
  if (status === 'Completed' || status === 'completed') return released ? 5 : 4
  if (status === 'Disputed' || status === 'disputed') return 3
  return 1
}

export default function JobStatus({ status, paymentReleased = false }) {
  const current = useMemo(() => statusToStep(status, paymentReleased), [status, paymentReleased])
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {STEPS.map((s, i) => {
        const completed = s.key < current
        const isCurrent = s.key === current
        const color = completed ? 'bg-green-600 text-white' : isCurrent ? 'bg-secondary text-white' : 'bg-border text-text'
        return (
          <div key={s.key} className="flex items-center">
            <div className={`rounded px-2 py-1 text-xs ${color}`}>{s.label}</div>
            {i < STEPS.length - 1 ? <div className="w-6 h-[2px] bg-border mx-2" /> : null}
          </div>
        )
      })}
    </div>
  )
}
