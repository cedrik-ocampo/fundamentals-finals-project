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

interface GenreBreakdownChartProps {
  data: { genre: string; count: number }[]
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
        <p className="font-medium text-foreground">{payload[0].value} anime</p>
      </div>
    )
  }
  return null
}

export default function GenreBreakdownChart({ data }: GenreBreakdownChartProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 12)

  if (!sorted.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No genre data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 36)}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 0, right: 20, left: 8, bottom: 0 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="genre"
          tick={{ fill: "var(--foreground)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "var(--border)", opacity: 0.4 }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {sorted.map((_, i) => (
            <Cell
              key={i}
              fill="var(--primary)"
              fillOpacity={Math.max(0.35, 1 - i * 0.055)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
