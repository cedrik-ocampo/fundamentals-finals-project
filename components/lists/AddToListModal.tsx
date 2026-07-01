"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import type { List } from "@/lib/types"
import Image from "next/image"

interface AddToListModalProps {
  animeId: number
  animeTitle: string
  animeCoverUrl?: string | null
  open: boolean
  onClose: () => void
}

export default function AddToListModal({
  animeId,
  animeTitle,
  animeCoverUrl,
  open,
  onClose,
}: AddToListModalProps) {
  const [lists, setLists] = useState<List[]>([])
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch("/api/lists")
      .then((r) => r.json())
      .then(({ data }) => {
        setLists(data ?? [])
        // Ideally we'd also fetch which lists already contain this anime
      })
      .catch(() => toast.error("Failed to load lists"))
      .finally(() => setLoading(false))
  }, [open])

  const toggle = async (listId: string, checked: boolean) => {
    setSaving(listId)
    try {
      if (checked) {
        const res = await fetch(`/api/lists/${listId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anilistId: animeId,
            animeTitle: animeTitle,
            animeCoverUrl: animeCoverUrl,
          }),
        })
        if (!res.ok) throw new Error("Failed to add")
        setCheckedIds((prev) => new Set([...prev, listId]))
        toast.success("Added to list")
      } else {
        const res = await fetch(`/api/lists/${listId}/items?anilistId=${animeId}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error("Failed to remove")
        setCheckedIds((prev) => {
          const next = new Set(prev)
          next.delete(listId)
          return next
        })
        toast.success("Removed from list")
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update list")
    } finally {
      setSaving(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add to List</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 mb-2">
          {animeCoverUrl && (
            <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded">
              <Image src={animeCoverUrl} alt={animeTitle} fill className="object-cover" />
            </div>
          )}
          <p className="font-medium text-sm text-foreground self-center">{animeTitle}</p>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg bg-muted" />
              ))
            : lists.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No lists yet. Create one first.
              </p>
            ) : (
              lists.map((list) => {
                const isChecked = checkedIds.has(list.id)
                return (
                  <label
                    key={list.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-primary/40 cursor-pointer transition-colors bg-background"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => toggle(list.id, e.target.checked)}
                      disabled={saving === list.id}
                      className="accent-primary h-4 w-4"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{list.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {list.item_count ?? 0} items
                      </p>
                    </div>
                  </label>
                )
              })
            )}
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
