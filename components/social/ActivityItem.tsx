import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StarDisplay from "@/components/rating/StarDisplay"
import { formatDate } from "@/lib/utils"
import type { Activity } from "@/lib/types"

interface ActivityItemProps {
  activity: Activity
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const profile = activity.profiles
  const username = profile?.username ?? "unknown"
  const displayName = profile?.display_name ?? username
  const avatarUrl = profile?.avatar_url
  const initials = displayName.slice(0, 2).toUpperCase()

  const meta = activity.metadata as Record<string, unknown> | null

  const renderContent = () => {
    switch (activity.activity_type) {
      case "diary_entry":
        return (
          <div className="flex items-center gap-3">
            {activity.anime_cover_url && (
              <Link href={`/anime/${activity.anilist_id}`}>
                <div className="relative h-14 w-10 overflow-hidden rounded bg-muted shrink-0">
                  <Image src={activity.anime_cover_url} alt={activity.anime_title ?? ""} fill className="object-cover" />
                </div>
              </Link>
            )}
            <div className="min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{displayName}</span>{" "}
                logged{" "}
                <Link href={`/anime/${activity.anilist_id}`} className="text-primary hover:underline font-medium">
                  {activity.anime_title}
                </Link>
              </p>
              {meta?.rating != null && (
                <div className="mt-1">
                  <StarDisplay value={meta.rating as number} size="sm" />
                </div>
              )}
            </div>
          </div>
        )

      case "review":
        return (
          <div className="flex items-center gap-3">
            {activity.anime_cover_url && (
              <div className="relative h-14 w-10 overflow-hidden rounded bg-muted shrink-0">
                <Image src={activity.anime_cover_url} alt={activity.anime_title ?? ""} fill className="object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{displayName}</span>{" "}
                reviewed{" "}
                <Link href={`/anime/${activity.anilist_id}`} className="text-primary hover:underline font-medium">
                  {activity.anime_title}
                </Link>
              </p>
              {typeof meta?.excerpt === "string" && meta.excerpt && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {meta.excerpt}
                </p>
              )}
              {activity.reference_id && (
                <Link href={`/reviews/${activity.reference_id}`} className="text-xs text-accent hover:underline mt-0.5 block">
                  Read review →
                </Link>
              )}
            </div>
          </div>
        )

      case "list_created":
        return (
          <p className="text-sm text-foreground">
            <span className="font-semibold">{displayName}</span>{" "}
            created a new list{" "}
            {activity.reference_id && (
              <Link href={`/lists/${activity.reference_id}`} className="text-primary hover:underline font-medium">
                {(meta?.list_name as string) ?? "a list"}
              </Link>
            )}
          </p>
        )

      case "list_item_added":
        return (
          <p className="text-sm text-foreground">
            <span className="font-semibold">{displayName}</span>{" "}
            added{" "}
            <Link href={`/anime/${activity.anilist_id}`} className="text-primary hover:underline font-medium">
              {activity.anime_title}
            </Link>{" "}
            to{" "}
            {activity.reference_id && (
              <Link href={`/lists/${activity.reference_id}`} className="text-accent hover:underline font-medium">
                {(meta?.list_name as string) ?? "a list"}
              </Link>
            )}
          </p>
        )

      case "follow":
        return (
          <p className="text-sm text-foreground">
            <span className="font-semibold">{displayName}</span>{" "}
            followed{" "}
            <Link href={`/users/${meta?.target_username as string}`} className="text-primary hover:underline font-medium">
              {(meta?.target_display_name as string) ?? (meta?.target_username as string) ?? "someone"}
            </Link>
          </p>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:-translate-y-px hover:shadow-sm hover:shadow-primary/5 transition-[border-color,transform,box-shadow] duration-200">
      <Link href={`/users/${username}`} className="shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-sm">{initials}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        {renderContent()}
        <p className="text-xs text-muted-foreground mt-1.5">{formatDate(activity.created_at)}</p>
      </div>
    </div>
  )
}
