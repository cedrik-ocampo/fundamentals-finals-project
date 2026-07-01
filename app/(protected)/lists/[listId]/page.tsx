"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { ArrowLeft, Trash2, Globe, Lock, Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import type { List, ListItem } from "@/lib/types"

interface ListDetailPageProps {
  params: Promise<{ listId: string }>
}

export default function ListDetailPage({ params }: ListDetailPageProps) {
  const { listId } = use(params)
  const router = useRouter()
  const [list, setList] = useState<List | null>(null)
  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/lists/${listId}`)
      .then((r) => r.json())
      .then(({ data }) => {
        setList(data?.list ?? null)
        setItems(data?.items ?? [])
      })
      .catch(() => toast.error("Failed to load list"))
      .finally(() => setLoading(false))
  }, [listId])

  const startEdit = () => {
    setEditName(list?.name ?? "")
    setEditDesc(list?.description ?? "")
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDesc }),
      })
      if (!res.ok) throw new Error()
      setList((l) => l ? { ...l, name: editName, description: editDesc } : l)
      setEditing(false)
      toast.success("List updated")
    } catch {
      toast.error("Failed to update list")
    } finally {
      setSaving(false)
    }
  }

  const removeItem = async (itemId: string, anilistId: number) => {
    try {
      const res = await fetch(`/api/lists/${listId}/items?anilist_id=${anilistId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      toast.success("Removed from list")
    } catch {
      toast.error("Failed to remove item")
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48 bg-card" />
        <Skeleton className="h-4 w-64 bg-card" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full bg-card rounded-lg" />)}
        </div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">List not found.</p>
        <Button variant="link" asChild><Link href="/lists">Back to Lists</Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Link href="/lists" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        My Lists
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        {editing ? (
          <div className="space-y-3">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-lg font-bold bg-background border-border text-foreground"
            />
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description..."
              rows={2}
              className="bg-background border-border text-foreground resize-none text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit} disabled={saving} className="gap-1.5">
                <Save className="h-3.5 w-3.5" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{list.name}</h1>
                {list.is_public ? (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              {list.description && (
                <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5 shrink-0">
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>This list is empty.</p>
          <p className="text-sm mt-1">Add anime from any anime page.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group"
            >
              <span className="text-xs text-muted-foreground w-5 text-center shrink-0">
                {item.position}
              </span>

              <Link href={`/anime/${item.anilist_id}`} className="shrink-0">
                <div className="relative h-14 w-10 overflow-hidden rounded bg-muted">
                  {item.anime_cover_url ? (
                    <Image src={item.anime_cover_url} alt={item.anime_title} fill className="object-cover" />
                  ) : null}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/anime/${item.anilist_id}`}>
                  <p className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate">
                    {item.anime_title}
                  </p>
                </Link>
                {item.notes && (
                  <p className="text-xs text-muted-foreground truncate">{item.notes}</p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => removeItem(item.id, item.anilist_id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
