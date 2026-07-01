import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface GenreBadgeProps {
  genre: string
  className?: string
}

export default function GenreBadge({ genre, className }: GenreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-primary/10 text-primary border border-primary/20",
        "hover:bg-primary/20 transition-colors",
        className
      )}
    >
      {genre}
    </span>
  )
}
