"use client"

interface VelocityChartProps {
  data: number[] // cards per minute per segment
}

export function VelocityChart({ data }: VelocityChartProps) {
  if (data.length < 2) return null

  const max = Math.max(...data, 1)
  const width = 200
  const height = 50
  const padding = 4

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - v / max) * (height - padding * 2),
  }))

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
    .join(" ")

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`

  return (
    <div>
      <h3 className="text-sm font-semibold text-star-white mb-2">Learning Velocity</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12">
        <defs>
          <linearGradient id="velocity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#velocity-fill)" />
        <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill="#f59e0b" />
        ))}
      </svg>
      <p className="text-[9px] text-star-faint mt-1">Cards per minute over time</p>
    </div>
  )
}
