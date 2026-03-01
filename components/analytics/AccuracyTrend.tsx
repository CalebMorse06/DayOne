"use client"

interface AccuracyTrendProps {
  data: number[] // running accuracy percentages
}

export function AccuracyTrend({ data }: AccuracyTrendProps) {
  if (data.length < 2) return null

  const width = 200
  const height = 50
  const padding = 4

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - v / 100) * (height - padding * 2),
    value: v,
  }))

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
    .join(" ")

  const lastValue = data[data.length - 1]
  const color = lastValue >= 70 ? "#34d399" : lastValue >= 40 ? "#f59e0b" : "#fb7185"

  const areaD = `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`

  return (
    <div>
      <h3 className="text-sm font-semibold text-star-white mb-2">Accuracy Trend</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12">
        <defs>
          <linearGradient id="accuracy-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* 70% threshold line */}
        <line
          x1={padding}
          y1={padding + (1 - 0.7) * (height - padding * 2)}
          x2={width - padding}
          y2={padding + (1 - 0.7) * (height - padding * 2)}
          stroke="#475569"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />
        <path d={areaD} fill="url(#accuracy-fill)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} />
        ))}
      </svg>
      <div className="flex items-center justify-between mt-1">
        <p className="text-[9px] text-star-faint">Quiz accuracy over time</p>
        <p className="text-[9px] font-mono font-bold" style={{ color }}>
          {lastValue}%
        </p>
      </div>
    </div>
  )
}
