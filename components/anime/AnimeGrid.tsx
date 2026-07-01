import Link from "next/link"
import { Tv } from "lucide-react"
import AnimeCard from "./AnimeCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { AniListMedia } from "@/lib/types"

interface AnimeGridProps {
  animes: AniListMedia[]
  loading?: boolean
}

function AnimeSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-[2/3] w-full rounded-lg bg-card" />
      <Skeleton className="h-3 w-3/4 rounded bg-card" />
      <Skeleton className="h-3 w-1/2 rounded bg-card" />
    </div>
  )
}

export default function AnimeGrid({ animes, loading = false }: AnimeGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <AnimeSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!animes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <Tv className="h-12 w-12 text-muted-foreground/20" />
        <p className="text-muted-foreground">No anime found.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/search">Browse Anime</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {animes.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  )
}
