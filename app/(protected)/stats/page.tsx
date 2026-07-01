import { BarChart2, Tv, Star, MessageSquare } from "lucide-react"
import StatCard from "@/components/stats/StatCard"
import GenreBreakdownChart from "@/components/stats/GenreBreakdownChart"
import RatingDistributionChart from "@/components/stats/RatingDistributionChart"
import { createClient } from "@/lib/supabase/server"

interface StatsData {
  watched_count: number
  review_count: number
  list_count: number
  mean_rating: number | null
  total_hours: number
  genres: { genre: string; count: number }[]
  ratings: { rating: number; count: number }[]
}

async function getStats(): Promise<StatsData | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const [
      { data: entries, error },
      { count: reviewCount },
      { count: listCount },
    ] = await Promise.all([
      supabase
        .from("diary_entries")
        .select("rating, genres")
        .eq("user_id", user.id),
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("lists")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ])

    if (error) return null

    const watched_count = entries?.length ?? 0

    const ratedEntries = (entries ?? []).filter((e) => e.rating !== null)
    const mean_rating =
      ratedEntries.length > 0
        ? Math.round(
            (ratedEntries.reduce((sum, e) => sum + (e.rating as number), 0) /
              ratedEntries.length) *
              10
          ) / 10
        : null

    const genreMap = new Map<string, number>()
    for (const entry of entries ?? []) {
      if (Array.isArray(entry.genres)) {
        for (const genre of entry.genres as string[]) {
          genreMap.set(genre, (genreMap.get(genre) ?? 0) + 1)
        }
      }
    }
    const genres = Array.from(genreMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)

    const ratingMap = new Map<number, number>()
    for (const entry of ratedEntries) {
      const r = entry.rating as number
      ratingMap.set(r, (ratingMap.get(r) ?? 0) + 1)
    }
    const ratings = Array.from(ratingMap.entries())
      .map(([rating, count]) => ({ rating, count }))
      .sort((a, b) => a.rating - b.rating)

    return {
      watched_count,
      review_count: reviewCount ?? 0,
      list_count: listCount ?? 0,
      mean_rating,
      total_hours: 0,
      genres,
      ratings,
    }
  } catch {
    return null
  }
}

export default async function StatsPage() {
  const stats = await getStats()

  if (!stats) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <BarChart2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Stats</h1>
        </div>
        <div className="text-center py-20 text-muted-foreground">
          <p>Could not load stats. Try again later.</p>
        </div>
      </div>
    )
  }

  const meanDisplay = stats.mean_rating != null
    ? (stats.mean_rating % 1 === 0 ? `${stats.mean_rating}.0` : `${stats.mean_rating}`)
    : "—"

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <BarChart2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">My Stats</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Anime Watched"
          value={stats.watched_count}
          icon={<Tv className="h-5 w-5" />}
        />
        <StatCard
          label="Hours Watched"
          value={stats.total_hours ?? 0}
          icon={<BarChart2 className="h-5 w-5" />}
        />
        <StatCard
          label="Mean Rating"
          value={meanDisplay}
          icon={<Star className="h-5 w-5" />}
        />
        <StatCard
          label="Reviews"
          value={stats.review_count}
          icon={<MessageSquare className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Genre Breakdown</h2>
          <GenreBreakdownChart data={stats.genres ?? []} />
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Rating Distribution</h2>
          <RatingDistributionChart data={stats.ratings ?? []} />
        </div>
      </div>
    </div>
  )
}
