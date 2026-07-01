"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface RatingDistributionChartProps {
  data: { rating: number; count: number }[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
        <p className="text-muted-foreground">Rating {label}</p>
        <p className="font-medium text-foreground">{payload[0].value} entries</p>
      </div>
    )
  }
  return null
}

// Fill all possible rating slots 0.5–5.0
function fillRatings(data: { rating: number; count: number }[]): { rating: number; count: number }[] {
  const map = new Map(data.map((d) => [d.rating, d.count]))
  const all = []
  for (let r = 0.5; r <= 5.0; r = Math.round((r + 0.5) * 10) / 10) {
    all.push({ rating: r, count: map.get(r) ?? 0 })
  }
  return all
}

export default function RatingDistributionChart({ data }: RatingDistributionChartProps) {
  const filled = fillRatings(data)
  const max = Math.max(...filled.map((d) => d.count), 1)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={filled} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="rating"
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}`}
        />
        <YAxis
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--border)", opacity: 0.4 }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {filled.map((entry, i) => {
            const intensity = entry.count / max
            return (
              <Cell
                key={i}
                fill={intensity > 0.7 ? "var(--primary)" : intensity > 0.3 ? "var(--accent)" : "var(--chart-4)"}
              />
            )
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
