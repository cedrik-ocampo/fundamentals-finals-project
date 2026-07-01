import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch all diary entries for the current user
  const { data: entries, error } = await supabase
    .from("diary_entries")
    .select("rating, genres, date_completed, created_at")
    .eq("user_id", user.id)

  if (error) {
    console.error("stats GET error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }

  if (!entries || entries.length === 0) {
    return NextResponse.json({
      data: {
        totalWatched: 0,
        totalHours: 0,
        averageRating: null,
        genreBreakdown: [],
        ratingDistribution: [],
        monthlyActivity: [],
      },
    })
  }

  // Total watched
  const totalWatched = entries.length

  // Total hours — we don't have episode duration in diary_entries directly,
  // so we use a rough estimate of 24 min/episode when episodes are unavailable.
  // For now, totalHours is returned as 0 unless the caller enriches from AniList.
  const totalHours = 0

  // Average rating (exclude nulls)
  const ratedEntries = entries.filter((e) => e.rating !== null)
  const averageRating =
    ratedEntries.length > 0
      ? Math.round(
          (ratedEntries.reduce((sum, e) => sum + (e.rating as number), 0) /
            ratedEntries.length) *
            10
        ) / 10
      : null

  // Genre breakdown
  const genreMap = new Map<string, number>()
  for (const entry of entries) {
    if (Array.isArray(entry.genres)) {
      for (const genre of entry.genres as string[]) {
        genreMap.set(genre, (genreMap.get(genre) ?? 0) + 1)
      }
    }
  }
  const genreBreakdown = Array.from(genreMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)

  // Rating distribution (0.5 increments from 0.5 to 5)
  const ratingMap = new Map<number, number>()
  for (const entry of ratedEntries) {
    const r = entry.rating as number
    ratingMap.set(r, (ratingMap.get(r) ?? 0) + 1)
  }
  const ratingDistribution = Array.from(ratingMap.entries())
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => a.rating - b.rating)

  // Monthly activity (last 12 months)
  const monthlyMap = new Map<string, number>()
  const now = new Date()
  // Initialise the last 12 months with 0
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthlyMap.set(key, 0)
  }

  for (const entry of entries) {
    const dateStr = entry.date_completed ?? entry.created_at
    if (dateStr) {
      const d = new Date(dateStr)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1)
      }
    }
  }

  const monthlyActivity = Array.from(monthlyMap.entries()).map(([month, count]) => ({
    month,
    count,
  }))

  return NextResponse.json({
    data: {
      totalWatched,
      totalHours,
      averageRating,
      genreBreakdown,
      ratingDistribution,
      monthlyActivity,
    },
  })
}
