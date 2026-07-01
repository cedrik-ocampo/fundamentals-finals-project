"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface AiringCountdownProps {
  airingAt: number
  episode: number
}

function formatCountdown(secondsLeft: number): string {
  if (secondsLeft <= 0) return "Airing now"
  const days = Math.floor(secondsLeft / 86400)
  const hours = Math.floor((secondsLeft % 86400) / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`)
  return parts.join(" ")
}

export default function AiringCountdown({ airingAt, episode }: AiringCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    return Math.max(0, airingAt - Math.floor(Date.now() / 1000))
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, airingAt - Math.floor(Date.now() / 1000))
      setSecondsLeft(remaining)
    }, 60_000)
    return () => clearInterval(interval)
  }, [airingAt])

  if (secondsLeft <= 0) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
        <Clock className="h-3.5 w-3.5" />
        <span>EP {episode} — Airing now</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-accent text-sm font-medium">
      <Clock className="h-3.5 w-3.5" />
      <span>
        EP {episode} in <span className="text-primary">{formatCountdown(secondsLeft)}</span>
      </span>
    </div>
  )
}
