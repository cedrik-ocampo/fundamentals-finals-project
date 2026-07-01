"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Trash2, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import type { Comment } from "@/lib/types"

interface CommentThreadProps {
  reviewId: string
}

export default function CommentThread({ reviewId }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((json) => { if (json) setCurrentUserId(json.data?.id ?? null) })
    fetchComments()
  }, [reviewId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`)
      const { data } = await res.json()
      setComments(data ?? [])
    } catch {
      toast.error("Failed to load comments")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    if (!currentUserId) {
      toast.error("Sign in to comment")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      })
      if (!res.ok) throw new Error("Failed to post comment")
      const { data } = await res.json()
      setComments((prev) => [...prev, data])
      setBody("")
      toast.success("Comment posted!")
    } catch {
      toast.error("Failed to post comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments/${commentId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success("Comment deleted")
    } catch {
      toast.error("Failed to delete comment")
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">
        Comments {!loading && <span className="text-muted-foreground font-normal">({comments.length})</span>}
      </h3>

      {/* Comment list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg bg-card" />
          ))
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => {
            const name = comment.profiles?.display_name ?? comment.profiles?.username ?? "User"
            const initials = name.slice(0, 2).toUpperCase()
            const isOwn = comment.user_id === currentUserId

            return (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={comment.profiles?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs bg-primary/20 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{comment.body}</p>
                </div>
                {isOwn && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Compose */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="bg-card border-border text-foreground resize-none text-sm flex-1"
          />
          <Button type="submit" size="icon" disabled={submitting || !body.trim()} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  )
}
