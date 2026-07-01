"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import StarRating from "@/components/rating/StarRating"
import type { Review } from "@/lib/types"

interface ReviewEditorProps {
  animeId: number
  animeTitle: string
  animeCoverUrl?: string | null
  existing?: Review | null
  onSaved?: (review: Review) => void
}

export default function ReviewEditor({
  animeId,
  animeTitle,
  animeCoverUrl,
  existing,
  onSaved,
}: ReviewEditorProps) {
  const [body, setBody] = useState(existing?.body ?? "")
  const [rating, setRating] = useState<number | null>(existing?.rating ?? null)
  const [containsSpoilers, setContainsSpoilers] = useState(existing?.contains_spoilers ?? false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (existing) {
      setBody(existing.body)
      setRating(existing.rating)
      setContainsSpoilers(existing.contains_spoilers)
    }
  }, [existing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) {
      toast.error("Review body is required")
      return
    }

    setLoading(true)
    const payload = {
      anilistId: animeId,
      animeTitle: animeTitle,
      animeCoverUrl: animeCoverUrl,
      body: body.trim(),
      rating,
      containsSpoilers: containsSpoilers,
    }

    try {
      const res = existing
        ? await fetch(`/api/reviews/${existing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save review")
      }

      const { data } = await res.json()
      toast.success(existing ? "Review updated!" : "Review published!")
      onSaved?.(data)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Anime info */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
        {animeCoverUrl && (
          <div className="relative h-20 w-14 overflow-hidden rounded shrink-0">
            <Image src={animeCoverUrl} alt={animeTitle} fill className="object-cover" />
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">Writing a review for</p>
          <h2 className="font-bold text-lg text-foreground">{animeTitle}</h2>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Your Rating</label>
        <StarRating value={rating} onChange={setRating} size="md" />
      </div>

      {/* Body */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Review</label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts about this anime..."
          rows={8}
          className="bg-card border-border text-foreground resize-none text-sm leading-relaxed"
        />
        <p className="text-xs text-muted-foreground text-right">{body.length} characters</p>
      </div>

      {/* Spoiler toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="spoilers"
          checked={containsSpoilers}
          onChange={(e) => setContainsSpoilers(e.target.checked)}
          className="accent-primary h-4 w-4"
        />
        <label htmlFor="spoilers" className="text-sm text-foreground cursor-pointer">
          This review contains spoilers
        </label>
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Publishing..." : existing ? "Update Review" : "Publish Review"}
      </Button>
    </form>
  )
}
