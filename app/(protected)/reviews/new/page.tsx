"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import ReviewEditor from "@/components/reviews/ReviewEditor"
import type { Review } from "@/lib/types"

function NewReviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const animeId = parseInt(searchParams.get("animeId") ?? "0")
  const animeTitle = searchParams.get("animeTitle") ?? "Unknown Anime"
  const animeCoverUrl = searchParams.get("animeCoverUrl")

  if (!animeId) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>No anime selected. Go to an anime page and click &ldquo;Write a Review&rdquo;.</p>
      </div>
    )
  }

  const handleSaved = (review: Review) => {
    router.push(`/reviews/${review.id}`)
  }

  return (
    <ReviewEditor
      animeId={animeId}
      animeTitle={animeTitle}
      animeCoverUrl={animeCoverUrl}
      onSaved={handleSaved}
    />
  )
}

export default function NewReviewPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Write a Review</h1>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <NewReviewContent />
      </Suspense>
    </div>
  )
}
