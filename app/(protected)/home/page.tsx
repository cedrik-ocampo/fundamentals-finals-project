import Link from "next/link"
import Image from "next/image"
import { Users, TrendingUp, CalendarClock, ArrowRight } from "lucide-react"
import ActivityItem from "@/components/social/ActivityItem"
import AnimeGrid from "@/components/anime/AnimeGrid"
import AiringCountdown from "@/components/anime/AiringCountdown"
import { Button } from "@/components/ui/button"
import type { Activity, AniListMedia, AniListAiringSchedule } from "@/lib/types"
import { createClient } from "@/lib/supabase/server"
import { getSeasonalAnime, getAiringSchedule } from "@/lib/anilist"
import { currentSeason } from "@/lib/utils"

async function getFeed(): Promise<Activity[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data: followingRows, error: followError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id)

    if (followError) return []

    const followingIds = (followingRows ?? []).map((r) => r.following_id)
    const userIds = [...followingIds, user.id]

    const { data: activities, error: activityError } = await supabase
      .from("activity")
      .select("*, profiles(*)")
      .in("user_id", userIds)
      .order("created_at", { ascending: false })
      .range(0, 19)

    if (activityError) return []

    return activities ?? []
  } catch {
    return []
  }
}

async function getSeasonal(): Promise<AniListMedia[]> {
  try {
    const { season, year } = currentSeason()
    const result = await getSeasonalAnime(season, year)
    return result?.Page?.media ?? []
  } catch {
    return []
  }
}

async function getUpcoming(): Promise<AniListAiringSchedule[]> {
  try {
    const result = await getAiringSchedule()
    return result?.Page?.airingSchedules ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [feed, seasonal, upcoming] = await Promise.all([
    getFeed(),
    getSeasonal(),
    getUpcoming(),
  ])

  const nextAiring = upcoming.slice(0, 5)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

        {/* ── Left: Feed ── */}
        <div className="space-y-6 min-w-0">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary shrink-0" />
            <h1 className="text-2xl font-bold text-foreground">Your Feed</h1>
          </div>

          {feed.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
              <Users className="h-12 w-12 text-muted-foreground/20 mx-auto" />
              <p className="font-semibold text-foreground">No activity yet</p>
              <p className="text-sm text-muted-foreground">
                Follow other users to see their reviews, diary entries, and lists here.
              </p>
              <Button variant="outline" size="sm" asChild className="mt-1">
                <Link href="/search">Explore Anime</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {feed.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}

          {/* ── This Season (below feed) ── */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">This Season</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/search" className="flex items-center gap-1 text-sm">
                  Browse all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <AnimeGrid animes={seasonal.slice(0, 12)} />
          </div>
        </div>

        {/* ── Right: Airing Soon sidebar ── */}
        <aside className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Airing Soon</h2>
          </div>

          <div className="space-y-3">
            {nextAiring.length === 0 ? (
              <p className="text-sm text-muted-foreground">No schedule available.</p>
            ) : (
              nextAiring.map((schedule) => (
                <Link
                  key={schedule.id}
                  href={`/anime/${schedule.media.id}`}
                  className="flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/50 transition-colors group"
                >
                  {schedule.media.coverImage?.large && (
                    <div className="relative w-12 h-16 rounded overflow-hidden shrink-0">
                      <Image
                        src={schedule.media.coverImage.large}
                        alt={schedule.media.title?.romaji ?? ""}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  )}
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {schedule.media.title?.english ?? schedule.media.title?.romaji}
                    </p>
                    <AiringCountdown
                      airingAt={schedule.airingAt}
                      episode={schedule.episode}
                    />
                  </div>
                </Link>
              ))
            )}
          </div>

          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/upcoming">View full schedule</Link>
          </Button>
        </aside>

      </div>
    </div>
  )
}
