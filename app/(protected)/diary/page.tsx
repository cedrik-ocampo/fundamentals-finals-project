"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { BookOpen, SortAsc, SortDesc } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DiaryEntryRow from "@/components/diary/DiaryEntryRow"
import LogAnimeModal from "@/components/diary/LogAnimeModal"
import { Skeleton } from "@/components/ui/skeleton"
import type { DiaryEntry } from "@/lib/types"

type SortKey = "date_completed" | "date_started" | "rating" | "created_at"
type SortOrder = "asc" | "desc"

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editEntry, setEditEntry] = useState<DiaryEntry | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("date_completed")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/diary")
      const { data } = await res.json()
      setEntries(data ?? [])
    } catch {
      toast.error("Failed to load diary")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/diary/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setEntries((prev) => prev.filter((e) => e.id !== id))
      toast.success("Entry deleted")
    } catch {
      toast.error("Failed to delete entry")
    }
  }

  const sorted = [...entries].sort((a, b) => {
    const av = a[sortKey] ?? ""
    const bv = b[sortKey] ?? ""
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortOrder === "asc" ? cmp : -cmp
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Diary</h1>
          {!loading && (
            <span className="text-sm text-muted-foreground">({entries.length} entries)</span>
          )}
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-40 bg-card border-border text-foreground text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="date_completed">Date Completed</SelectItem>
              <SelectItem value="date_started">Date Started</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="created_at">Date Logged</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            className="bg-card border-border"
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg bg-card" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <BookOpen className="h-16 w-16 text-muted-foreground/20 mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">No entries yet</h2>
          <p className="text-sm text-muted-foreground">
            Log anime from any anime page to start your diary.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((entry) => (
            <DiaryEntryRow
              key={entry.id}
              entry={entry}
              onEdit={(e) => setEditEntry(e)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {editEntry && (
        <LogAnimeModal
          animeId={editEntry.anilist_id}
          animeTitle={editEntry.anime_title}
          animeCoverUrl={editEntry.anime_cover_url}
          genres={editEntry.genres ?? undefined}
          open={!!editEntry}
          onClose={() => setEditEntry(null)}
          onSaved={() => {
            setEditEntry(null)
            fetchEntries()
          }}
          existing={editEntry}
        />
      )}
    </div>
  )
}
