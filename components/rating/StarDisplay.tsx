import { cn } from "@/lib/utils"

interface StarDisplayProps {
  value: number | null
  size?: "sm" | "md" | "lg"
}

export default function StarDisplay({ value, size = "md" }: StarDisplayProps) {
  if (value == null) return <span className="text-muted-foreground text-sm">—</span>

  const starSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const full = value >= star
        const half = !full && value >= star - 0.5

        return (
          <svg
            key={star}
            className={cn(starSizes[size], "flex-shrink-0")}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {half && (
              <defs>
                <clipPath id={`clip-star-${star}-${value}`}>
                  <rect x="0" y="0" width="12" height="24" />
                </clipPath>
              </defs>
            )}
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={full ? "var(--primary)" : "none"}
              stroke={full || half ? "var(--primary)" : "var(--muted-foreground)"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {half && (
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="var(--primary)"
                clipPath={`url(#clip-star-${star}-${value})`}
              />
            )}
          </svg>
        )
      })}
      <span className={cn("ml-1 font-medium tabular-nums text-muted-foreground", textSizes[size])}>
        {value % 1 === 0 ? `${value}.0` : value}
      </span>
    </div>
  )
}
