"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { parse, isValid, isAfter, startOfDay } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import DatePicker from "@/components/ui/date-picker"
import StarRating from "@/components/rating/StarRating"
import type { DiaryEntry } from "@/lib/types"
import Image from "next/image"

interface LogAnimeModalProps {
  animeId: number
  animeTitle: string
  animeCoverUrl?: string | null
  genres?: string[]
  open: boolean
  onClose: () => void
  onSaved?: () => void
  existing?: DiaryEntry | null
}

const TODAY = new Date()

function parseIso(iso: string): Date | null {
  if (!iso) return null
  const d = parse(iso, "yyyy-MM-dd", new Date())
  return isValid(d) ? d : null
}

export default function LogAnimeModal({
  animeId,
  animeTitle,
  animeCoverUrl,
  genres,
  open,
  onClose,
  onSaved,
  existing,
}: LogAnimeModalProps) {
  const [dateStarted, setDateStarted] = useState("")
  const [dateCompleted, setDateCompleted] = useState("")
  const [dateError, setDateError] = useState<string | null>(null)
  const [rating, setRating] = useState<number | null>(null)
  const [rewatch, setRewatch] = useState(false)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (existing) {
        setDateStarted(existing.date_started?.slice(0, 10) ?? "")
        setDateCompleted(existing.date_completed?.slice(0, 10) ?? "")
        setRating(existing.rating)
        setRewatch(existing.rewatch)
        setNotes(existing.notes ?? "")
      } else {
        setDateStarted("")
        setDateCompleted(new Date().toISOString().slice(0, 10))
        setRating(null)
        setRewatch(false)
        setNotes("")
      }
      setDateError(null)
    }
  }, [existing, open])

  // Cross-validate start ≤ completed whenever either changes
  useEffect(() => {
    if (!dateStarted || !dateCompleted) { setDateError(null); return }
    const s = parseIso(dateStarted)
    const c = parseIso(dateCompleted)
    if (s && c && isAfter(startOfDay(s), startOfDay(c))) {
      setDateError("Start date cannot be after the completed date.")
    } else {
      setDateError(null)
    }
  }, [dateStarted, dateCompleted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (dateError) { toast.error(dateError); return }

    setLoading(true)
    const payload = {
      anilistId: animeId,
      animeTitle,
      animeCoverUrl,
      genres,
      dateStarted: dateStarted || null,
      dateCompleted: dateCompleted || null,
      rating,
      rewatch,
      notes: notes || null,
    }

    try {
      const res = existing
        ? await fetch(`/api/diary/${existing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/diary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to save")
      }

      toast.success(existing ? "Diary entry updated!" : "Anime logged to diary!")
      onSaved?.()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {existing ? "Edit Log" : "Log Anime"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 mb-4">
          {animeCoverUrl && (
            <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded">
              <Image src={animeCoverUrl} alt={animeTitle} fill className="object-cover" sizes="56px" />
            </div>
          )}
          <div>
            <p className="font-semibold text-foreground leading-tight">{animeTitle}</p>
            {genres && genres.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{genres.slice(0, 3).join(" · ")}</p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Date Started"
              value={dateStarted}
              onChange={setDateStarted}
              maxDate={TODAY}
              placeholder="dd/mm/yyyy"
            />
            <DatePicker
              label="Date Completed"
              value={dateCompleted}
              onChange={setDateCompleted}
              maxDate={TODAY}
              placeholder="dd/mm/yyyy"
            />
          </div>

          {dateError && (
            <p className="text-xs text-red-500 -mt-2">{dateError}</p>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Rating</label>
            <StarRating value={rating} onChange={setRating} size="md" />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rewatch"
              checked={rewatch}
              onChange={(e) => setRewatch(e.target.checked)}
              className="accent-primary h-4 w-4"
            />
            <label htmlFor="rewatch" className="text-sm text-foreground cursor-pointer">
              Rewatch
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Your thoughts..."
              rows={3}
              maxLength={2000}
              className="bg-background border-border text-foreground resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !!dateError}>
              {loading ? "Saving..." : existing ? "Update" : "Log Anime"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
