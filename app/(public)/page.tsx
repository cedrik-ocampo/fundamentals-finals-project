import Link from "next/link"
import { Sparkles, TrendingUp, Calendar, BookOpen, PenSquare, BarChart2, Users } from "lucide-react"
import AnimeGrid from "@/components/anime/AnimeGrid"
import { Button } from "@/components/ui/button"
import type { AniListMedia } from "@/lib/types"
import { getSeasonalAnime as fetchSeasonalAnime } from "@/lib/anilist"
import { currentSeason } from "@/lib/utils"

async function getSeasonalAnime(): Promise<AniListMedia[]> {
  try {
    const { season, year } = currentSeason()
    const result = await fetchSeasonalAnime(season, year)
    return result?.Page?.media ?? []
  } catch {
    return []
  }
}

export default async function LandingPage() {
  const seasonalAnime = await getSeasonalAnime()

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by AniList
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            <span className="text-foreground">Your Anime </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Letterboxd.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Rate, review, and obsess. Log every episode, build lists, and follow friends who share your taste.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link href="/search">Browse Anime</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature showcase */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-primary mb-8">
            Everything you need to track your watch history
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                Icon: BookOpen,
                title: "Diary",
                desc: "Log every anime with half-star ratings and watch dates.",
              },
              {
                Icon: PenSquare,
                title: "Reviews",
                desc: "Write reviews, like others', and discuss in comments.",
              },
              {
                Icon: Users,
                title: "Social Feed",
                desc: "Follow friends and see their activity in real time.",
              },
              {
                Icon: BarChart2,
                title: "Stats",
                desc: "Genre breakdowns and rating distributions over time.",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-primary/20 bg-card p-5 space-y-3 hover:border-primary/40 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current season */}
      <section className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">This Season</h2>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/upcoming">View Upcoming →</Link>
            </Button>
          </div>

          {seasonalAnime.length > 0 ? (
            <AnimeGrid animes={seasonalAnime.slice(0, 18)} />
          ) : (
            <AnimeGrid animes={[]} loading />
          )}
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-3xl text-center space-y-6 p-10 rounded-2xl border border-primary/20 bg-card">
          <Calendar className="h-10 w-10 text-primary mx-auto" />
          <h2 className="text-3xl font-bold text-foreground">Never Lose Track Again</h2>
          <p className="text-muted-foreground">
            Keep a diary of everything you watch. Rate, review, and build lists that reflect your taste.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
