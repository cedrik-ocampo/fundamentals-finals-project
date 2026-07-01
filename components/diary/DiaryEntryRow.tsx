import Image from "next/image"
import Link from "next/link"
import { Pencil, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import StarDisplay from "@/components/rating/StarDisplay"
import { formatDate } from "@/lib/utils"
import type { DiaryEntry } from "@/lib/types"

interface DiaryEntryRowProps {
  entry: DiaryEntry
  onEdit?: (entry: DiaryEntry) => void
  onDelete?: (id: string) => void
}

export default function DiaryEntryRow({ entry, onEdit, onDelete }: DiaryEntryRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors group">
      {/* Cover thumbnail */}
      <Link href={`/anime/${entry.anilist_id}`} className="shrink-0">
        <div className="relative h-[60px] w-10 overflow-hidden rounded bg-muted">
          {entry.anime_cover_url ? (
            <Image
              src={entry.anime_cover_url}
              alt={entry.anime_title}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[8px]">
              N/A
            </div>
          )}
        </div>
      </Link>

      {/* Title + rating */}
      <div className="flex-1 min-w-0">
        <Link href={`/anime/${entry.anilist_id}`}>
          <p className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate">
            {entry.anime_title}
          </p>
        </Link>
        {entry.rating != null && (
          <div className="mt-0.5">
            <StarDisplay value={entry.rating} size="sm" />
          </div>
        )}
      </div>

      {/* Date completed */}
      <div className="hidden sm:block shrink-0 text-xs text-muted-foreground w-24 text-right">
        {entry.date_completed ? formatDate(entry.date_completed) : "—"}
      </div>

      {/* Rewatch badge */}
      {entry.rewatch && (
        <div className="hidden sm:flex shrink-0 items-center gap-1 text-xs text-accent">
          <RefreshCw className="h-3 w-3" />
          <span>Rewatch</span>
        </div>
      )}

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(entry)}
              aria-label="Edit entry"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(entry.id)}
              aria-label="Delete entry"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
