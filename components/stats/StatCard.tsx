import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  className?: string
}

export default function StatCard({ label, value, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-xl border border-border bg-card flex flex-col gap-2",
        className
      )}
    >
      {icon && (
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      )}
      <div>
        <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}
