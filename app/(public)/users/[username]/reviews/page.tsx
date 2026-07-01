import { notFound } from "next/navigation"
import { MessageSquare } from "lucide-react"
import ReviewCard from "@/components/reviews/ReviewCard"
import type { Review } from "@/lib/types"
import { createClient } from "@/lib/supabase/server"

interface ReviewsPageProps {
  params: Promise<{ username: string }>
}

async function getUserReviews(username: string): Promise<Review[] | null> {
  try {
    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single()

    if (profileError || !profile) return null

    const { data, error } = await supabase
      .from("reviews")
      .select("*, profiles!reviews_user_id_fkey(id, username, display_name, avatar_url)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })

    if (error) return null

    return data ?? []
  } catch {
    return null
  }
}

export default async function UserReviewsPage({ params }: ReviewsPageProps) {
  const { username } = await params
  const reviews = await getUserReviews(username)

  if (!reviews) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          <span className="text-muted-foreground font-normal">@{username}&apos;s</span> Reviews
        </h1>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No reviews yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} showAnime />
          ))}
        </div>
      )}
    </div>
  )
}
