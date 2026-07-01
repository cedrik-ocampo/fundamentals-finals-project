import Image from "next/image"
import Link from "next/link"
import { Star, Tv, Clock, Calendar, BookOpen, List, PenSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import GenreBadge from "@/components/anime/GenreBadge"
import AiringCountdown from "@/components/anime/AiringCountdown"
import ReviewCard from "@/components/reviews/ReviewCard"
import LogAnimeButton from "./LogAnimeButton"
import AddToListButton from "./AddToListButton"
import { createClient } from "@/lib/supabase/server"
import { getAnimeDetail } from "@/lib/anilist"
import type { AniListMedia, Review } from "@/lib/types"

interface AnimePageProps {
  params: Promise<{ id: string }>
}

async function getAnime(id: string): Promise<AniListMedia | null> {
  try {
    const result = await getAnimeDetail(Number(id))
    return result?.Media ?? null
  } catch {
    return null
  }
}

async function getReviews(anilistId: string): Promise<Review[]> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*, profiles!reviews_user_id_fkey(*)")
      .eq("anilist_id", Number(anilistId))
      .order("created_at", { ascending: false })
      .range(0, 19)

    if (error || !reviews) return []

    if (user && reviews.length > 0) {
      const reviewIds = reviews.map((r) => r.id)
      const { data: likes } = await supabase
        .from("review_likes")
        .select("review_id")
        .eq("user_id", user.id)
        .in("review_id", reviewIds)

      const likedSet = new Set((likes ?? []).map((l) => l.review_id))
      return reviews.map((r) => ({ ...r, user_liked: likedSet.has(r.id) }))
    }

    return reviews
  } catch {
    return []
  }
}

export default async function AnimePage({ params }: AnimePageProps) {
  const { id } = await params
  const [anime, reviews] = await Promise.all([getAnime(id), getReviews(id)])

  if (!anime) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <Tv className="h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold text-foreground">Anime not found</h1>
        <Button asChild variant="outline">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const title = anime.title.english ?? anime.title.romaji ?? anime.title.native ?? "Unknown"
  const cover = anime.coverImage.extraLarge ?? anime.coverImage.large ?? anime.coverImage.medium
  const studios = anime.studios?.nodes.map((s) => s.name).join(", ")

  return (
    <div>
      {/* Mobile sticky CTA bar */}
      {user && (
        <div className="fixed bottom-0 inset-x-0 md:hidden z-40 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 flex gap-2">
          <LogAnimeButton
            animeId={anime.id}
            animeTitle={title}
            animeCoverUrl={cover ?? null}
            genres={anime.genres}
          />
          <AddToListButton
            animeId={anime.id}
            animeTitle={title}
            animeCoverUrl={cover ?? null}
          />
          <Button variant="outline" size="sm" asChild className="gap-1.5 shrink-0">
            <Link href={`/reviews/new?animeId=${anime.id}&animeTitle=${encodeURIComponent(title)}`}>
              <PenSquare className="h-4 w-4" />
              Review
            </Link>
          </Button>
        </div>
      )}

      {/* Banner */}
      {anime.bannerImage && (
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <Image src={anime.bannerImage} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Cover */}
          <div className="shrink-0">
            <div className="relative h-72 w-48 sm:h-80 sm:w-52 overflow-hidden rounded-xl border border-border shadow-2xl shadow-primary/10">
              {cover ? (
                <Image src={cover} alt={title} fill className="object-cover" priority />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <Tv className="h-12 w-12" />
                </div>
              )}
            </div>

            {/* Action buttons */}
            {user ? (
              <div className="mt-4 space-y-2 w-48 sm:w-52">
                <LogAnimeButton
                  animeId={anime.id}
                  animeTitle={title}
                  animeCoverUrl={cover ?? null}
                  genres={anime.genres}
                />
                <AddToListButton
                  animeId={anime.id}
                  animeTitle={title}
                  animeCoverUrl={cover ?? null}
                />
                <Button variant="outline" asChild className="w-full gap-2">
                  <Link href={`/reviews/new?animeId=${anime.id}&animeTitle=${encodeURIComponent(title)}`}>
                    <PenSquare className="h-4 w-4" />
                    Write a Review
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-2 w-48 sm:w-52">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login">Log In to Track</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">{title}</h1>
              {anime.title.romaji && anime.title.romaji !== title && (
                <p className="text-muted-foreground mt-1">{anime.title.romaji}</p>
              )}
              {anime.title.native && (
                <p className="text-muted-foreground text-sm">{anime.title.native}</p>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {anime.averageScore != null && (
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-semibold text-foreground">{(anime.averageScore / 10).toFixed(1)}</span>
                  <span className="text-muted-foreground">/ 10</span>
                </div>
              )}
              {anime.format && (
                <div className="flex items-center gap-1.5">
                  <Tv className="h-4 w-4" />
                  <span>{anime.format}</span>
                </div>
              )}
              {anime.episodes != null && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{anime.episodes} episodes</span>
                </div>
              )}
              {anime.seasonYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{anime.season} {anime.seasonYear}</span>
                </div>
              )}
            </div>

            {studios && (
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Studio:</span> {studios}
              </p>
            )}

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {anime.genres.map((genre) => (
                  <GenreBadge key={genre} genre={genre} />
                ))}
              </div>
            )}

            {/* Next airing */}
            {anime.nextAiringEpisode && (
              <AiringCountdown
                episode={anime.nextAiringEpisode.episode}
                airingAt={anime.nextAiringEpisode.airingAt}
              />
            )}

            {/* Description */}
            {anime.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {anime.description.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim()}
              </p>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
            {user && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href={`/reviews/new?animeId=${anime.id}&animeTitle=${encodeURIComponent(title)}`}>
                  <PenSquare className="h-4 w-4" />
                  Write a Review
                </Link>
              </Button>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} showAnime={false} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <PenSquare className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-muted-foreground">No reviews yet.</p>
              {user && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/reviews/new?animeId=${anime.id}&animeTitle=${encodeURIComponent(title)}`}>
                    Be the first to review
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
