import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import FollowButton from "@/components/social/FollowButton"
import { formatDate } from "@/lib/utils"
import type { Profile, ProfileStats } from "@/lib/types"

interface ProfileHeaderProps {
  profile: Profile
  stats: ProfileStats
  isOwnProfile: boolean
  initialFollowing?: boolean
}

export default function ProfileHeader({
  profile,
  stats,
  isOwnProfile,
  initialFollowing = false,
}: ProfileHeaderProps) {
  const displayName = profile.display_name ?? profile.username
  const initials = displayName.slice(0, 2).toUpperCase()

  const statItems = [
    { label: "Watched", value: stats.watched_count, href: `/users/${profile.username}/diary` },
    { label: "Reviews", value: stats.review_count, href: `/users/${profile.username}/reviews` },
    { label: "Lists", value: stats.list_count, href: `/users/${profile.username}/lists` },
    { label: "Followers", value: stats.followers_count, href: `/users/${profile.username}` },
    { label: "Following", value: stats.following_count, href: `/users/${profile.username}` },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Avatar */}
        <Avatar className="h-20 w-20 shrink-0 ring-2 ring-primary/30 ring-offset-2 ring-offset-card">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">@{profile.username}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {!isOwnProfile && (
                <FollowButton username={profile.username} initialFollowing={initialFollowing} />
              )}
              {isOwnProfile && (
                <Link
                  href="/settings"
                  className="text-sm px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-3 max-w-lg leading-relaxed">{profile.bio}</p>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Member since {formatDate(profile.created_at)}
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 pt-5 border-t border-border">
        {statItems.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex flex-col items-center hover:text-primary transition-colors group"
          >
            <span className="text-xl font-bold text-foreground group-hover:text-primary tabular-nums">
              {stat.value.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
