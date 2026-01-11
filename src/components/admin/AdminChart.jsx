export default function AdminChart({ type = 'bar', data = [], width = 600, height = 240, labelKey = 'label', valueKey = 'value' }) {
  const pad = 24
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey] || 0)))
  if (type === 'bar') {
    const barW = (width - pad * 2) / data.length
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        {data.map((d, i) => {
          const v = Number(d[valueKey] || 0)
          const h = ((height - pad * 2) * v) / max
          return (
            <g key={i}>
              <rect x={pad + i * barW} y={height - pad - h} width={barW * 0.7} height={h} className="fill-primary" />
              <text x={pad + i * barW} y={height - pad - h - 6} className="text-[10px] fill-text">{v.toLocaleString('en-NG')}</text>
              <text x={pad + i * barW} y={height - pad + 12} className="text-[10px] fill-text">{String(d[labelKey]).slice(0, 8)}</text>
            </g>
          )
        })}
      </svg>
    )
  }
  if (type === 'line') {
    const step = (width - pad * 2) / (data.length - 1 || 1)
    const points = data.map((d, i) => {
      const v = Number(d[valueKey] || 0)
      const y = height - pad - ((height - pad * 2) * v) / max
      const x = pad + i * step
      return `${x},${y}`
    })
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <polyline points={points.join(' ')} className="fill-none stroke-secondary" strokeWidth="2" />
        {data.map((d, i) => {
          const v = Number(d[valueKey] || 0)
          const y = height - pad - ((height - pad * 2) * v) / max
          const x = pad + i * step
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3" className="fill-secondary" />
              <text x={x + 6} y={y - 6} className="text-[10px] fill-text">{v.toLocaleString('en-NG')}</text>
              <text x={x} y={height - pad + 12} className="text-[10px] fill-text">{String(d[labelKey]).slice(0, 8)}</text>
            </g>
          )
        })}
      </svg>
    )
  }
  if (type === 'pie') {
    const cx = width / 2
    const cy = height / 2
    const r = Math.min(width, height) / 3
    const total = data.reduce((s, d) => s + Number(d[valueKey] || 0), 0) || 1
    let start = 0
    const colors = ['fill-primary', 'fill-secondary', 'fill-accent', 'fill-green-600', 'fill-yellow-500', 'fill-danger']
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {data.map((d, i) => {
          const v = Number(d[valueKey] || 0)
          const angle = (v / total) * Math.PI * 2
          const x1 = cx + r * Math.cos(start)
          const y1 = cy + r * Math.sin(start)
          const x2 = cx + r * Math.cos(start + angle)
          const y2 = cy + r * Math.sin(start + angle)
          const large = angle > Math.PI ? 1 : 0
          const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
          start += angle
          return <path key={i} d={path} className={colors[i % colors.length]} />
        })}
      </svg>
    )
  }
  return null
}
