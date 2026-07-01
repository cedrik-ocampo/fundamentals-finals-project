"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number | null
  onChange: (v: number) => void
  size?: "sm" | "md"
}

const HALF_STARS = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]

export default function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [selected, setSelected] = useState<number | null>(null)

  const handleSelect = (v: number) => {
    onChange(v)
    setSelected(v)
    setTimeout(() => setSelected(null), 250)
  }

  const display = hovered ?? value ?? 0
  const starSize = size === "sm" ? "h-4 w-4" : "h-6 w-6"

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(null)}
      role="group"
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const full = display >= star
        const half = !full && display >= star - 0.5

        return (
          <div key={star} className="relative flex">
            {/* Half-star left click zone */}
            <button
              type="button"
              aria-label={`${star - 0.5} stars`}
              className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
              onMouseEnter={() => setHovered(star - 0.5)}
              onClick={() => handleSelect(star - 0.5)}
            />
            {/* Full-star right click zone */}
            <button
              type="button"
              aria-label={`${star} stars`}
              className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
              onMouseEnter={() => setHovered(star)}
              onClick={() => handleSelect(star)}
            />

            {/* Star visual */}
            <svg
              className={cn(
                starSize,
                "transition-colors duration-100",
                selected !== null && Math.ceil(selected) === star && "animate-star-select",
              )}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`half-${star}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%" stopColor={half || full ? "var(--primary)" : "transparent"} />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              {/* Empty star background */}
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={full ? "var(--primary)" : "none"}
                stroke={full || half ? "var(--primary)" : "var(--muted-foreground)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Half fill overlay */}
              {half && (
                <clipPath id={`clip-half-${star}`}>
                  <rect x="0" y="0" width="12" height="24" />
                </clipPath>
              )}
              {half && (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="var(--primary)"
                  clipPath={`url(#clip-half-${star})`}
                />
              )}
            </svg>
          </div>
        )
      })}

      {display > 0 && (
        <span className={cn("ml-1.5 font-medium tabular-nums text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          {display % 1 === 0 ? `${display}.0` : display}
        </span>
      )}
    </div>
  )
}
