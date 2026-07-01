"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  reviewId: string
  initialCount: number
  initialLiked: boolean
}

export default function LikeButton({ reviewId, initialCount, initialLiked }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [popping, setPopping] = useState(false)

  const toggle = async () => {
    if (loading) return
    setLoading(true)

    // Optimistic update
    const newLiked = !liked
    setLiked(newLiked)
    setCount((c) => (newLiked ? c + 1 : c - 1))

    if (newLiked) {
      setPopping(true)
      setTimeout(() => setPopping(false), 350)
    }

    try {
      const res = await fetch(`/api/reviews/${reviewId}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (res.status === 401) {
        // Revert
        setLiked(!newLiked)
        setCount((c) => (newLiked ? c - 1 : c + 1))
        toast.error("Sign in to like reviews")
        return
      }

      if (!res.ok) throw new Error("Failed")
    } catch {
      // Revert
      setLiked(!newLiked)
      setCount((c) => (newLiked ? c - 1 : c + 1))
      toast.error("Failed to update like")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        liked
          ? "text-red-500 hover:text-red-400"
          : "text-muted-foreground hover:text-red-500"
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          liked && "fill-current",
          popping && "animate-heart-pop",
        )}
      />
      <span className="text-sm">{count}</span>
    </Button>
  )
}
