import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import StarDisplay from "@/components/rating/StarDisplay"
import LikeButton from "@/components/reviews/LikeButton"
import CommentThread from "@/components/reviews/CommentThread"
import { createClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils"
import type { Review } from "@/lib/types"

interface ReviewPageProps {
  params: Promise<{ id: string }>
}

async function getReview(id: string): Promise<Review | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: review, error } = await supabase
      .from("reviews")
      .select("*, profiles!reviews_user_id_fkey(*)")
      .eq("id", id)
      .single()

    if (error || !review) return null

    let userLiked = false
    if (user) {
      const { data: like } = await supabase
        .from("review_likes")
        .select("review_id")
        .match({ review_id: id, user_id: user.id })
        .maybeSingle()
      userLiked = !!like
    }

    return { ...review, user_liked: userLiked }
  } catch {
    return null
  }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params
  const review = await getReview(id)

  if (!review) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName = review.profiles?.display_name ?? review.profiles?.username ?? "User"
  const username = review.profiles?.username ?? "unknown"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <Link
        href={`/anime/${review.anilist_id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {review.anime_title}
      </Link>

      {/* Review card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Anime header */}
        <div className="flex items-center gap-4 p-6 border-b border-border">
          {review.anime_cover_url && (
            <Link href={`/anime/${review.anilist_id}`}>
              <div className="relative h-20 w-14 overflow-hidden rounded-lg shrink-0">
                <Image src={review.anime_cover_url} alt={review.anime_title} fill className="object-cover" />
              </div>
            </Link>
          )}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Review of</p>
            <Link href={`/anime/${review.anilist_id}`}>
              <h1 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                {review.anime_title}
              </h1>
            </Link>
            {review.rating != null && (
              <div className="mt-1">
                <StarDisplay value={review.rating} size="md" />
              </div>
            )}
          </div>
        </div>

        {/* Reviewer */}
        <div className="flex items-center gap-3 px-6 pt-5">
          <Link href={`/users/${username}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.profiles?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link href={`/users/${username}`} className="font-semibold text-foreground hover:text-primary transition-colors">
              {displayName}
            </Link>
            <p className="text-xs text-muted-foreground">
              @{username} · {formatDate(review.created_at)}
            </p>
          </div>
        </div>

        {/* Spoiler warning */}
        {review.contains_spoilers && (
          <div className="mx-6 mt-4 flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>This review contains spoilers</span>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {review.body}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 pb-5 border-t border-border pt-4">
          <LikeButton
            reviewId={review.id}
            initialCount={review.likes_count}
            initialLiked={review.user_liked ?? false}
          />
        </div>
      </div>

      {/* Comments */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <CommentThread reviewId={review.id} />
      </div>
    </div>
  )
}
