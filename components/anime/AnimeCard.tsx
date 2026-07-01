import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { AniListMedia, AniListTitle, AniListCoverImage } from "@/lib/types"

interface AnimeCardProps {
  anime:
    | AniListMedia
    | {
        id: number
        title: AniListTitle
        coverImage: AniListCoverImage
        averageScore?: number | null
        format?: string | null
        genres?: string[]
        status?: string | null
      }
  showScore?: boolean
}

function getTitle(title: AniListTitle): string {
  return title.english ?? title.romaji ?? title.native ?? "Unknown Title"
}


export default function AnimeCard({ anime, showScore = true }: AnimeCardProps) {
  const title = getTitle(anime.title)
  const cover = anime.coverImage.extraLarge ?? anime.coverImage.large ?? anime.coverImage.medium

  return (
    <Link href={`/anime/${anime.id}`} className="group block">
      <div
        className="relative overflow-hidden rounded-lg bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
        style={{ transition: "border-color var(--duration-standard) var(--ease-out-expo), box-shadow var(--duration-standard) var(--ease-out-expo), transform var(--duration-standard) var(--ease-out-expo)" }}
      >
        {/* Cover image — 2:3 aspect ratio */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {cover ? (
            <Image
              src={cover}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover group-hover:scale-105"
              style={{ transition: "transform var(--duration-enter) var(--ease-out-expo)" }}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
              No cover
            </div>
          )}

          {/* Score overlay */}
          {showScore && anime.averageScore != null && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 px-1.5 py-0.5">
              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-semibold text-foreground">
                {(anime.averageScore / 10).toFixed(1)}
              </span>
            </div>
          )}

          {/* Format badge */}
          {anime.format && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-4">
              <span className="text-[10px] font-medium text-white/70 uppercase tracking-wide">
                {anime.format}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="p-2">
          <p className="text-xs font-medium leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </p>
        </div>
      </div>
    </Link>
  )
}
