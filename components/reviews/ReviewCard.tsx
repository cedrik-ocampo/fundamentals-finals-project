import Link from "next/link"
import Image from "next/image"
import { AlertTriangle, Heart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StarDisplay from "@/components/rating/StarDisplay"
import { formatDate } from "@/lib/utils"
import type { Review } from "@/lib/types"

interface ReviewCardProps {
  review: Review
  showAnime?: boolean
}

export default function ReviewCard({ review, showAnime = false }: ReviewCardProps) {
  const username = review.profiles?.username ?? "unknown"
  const displayName = review.profiles?.display_name ?? username
  const avatarUrl = review.profiles?.avatar_url
  const initials = displayName.slice(0, 2).toUpperCase()
  const excerpt = review.body.length > 200 ? review.body.slice(0, 200) + "…" : review.body

  return (
    <Link href={`/reviews/${review.id}`} className="block group">
      <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all hover:shadow-md hover:shadow-primary/10">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">{displayName}</span>
              <span className="text-xs text-muted-foreground">@{username}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
            </div>

            {showAnime && (
              <div className="flex items-center gap-2 mt-1">
                {review.anime_cover_url && (
                  <div className="relative h-5 w-3.5 overflow-hidden rounded-sm flex-shrink-0">
                    <Image src={review.anime_cover_url} alt={review.anime_title} fill className="object-cover" />
                  </div>
                )}
                <span className="text-xs font-medium text-primary truncate">{review.anime_title}</span>
              </div>
            )}

            {review.rating != null && (
              <div className="mt-1">
                <StarDisplay value={review.rating} size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* Spoiler warning */}
        {review.contains_spoilers && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded px-2.5 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Contains spoilers</span>
          </div>
        )}

        {/* Body excerpt */}
        <p className={`mt-3 text-sm text-muted-foreground leading-relaxed ${review.contains_spoilers ? "blur-sm group-hover:blur-none transition-all" : ""}`}>
          {excerpt}
        </p>

        {/* Footer */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Heart className="h-3.5 w-3.5" />
          <span>{review.likes_count} {review.likes_count === 1 ? "like" : "likes"}</span>
        </div>
      </div>
    </Link>
  )
}
