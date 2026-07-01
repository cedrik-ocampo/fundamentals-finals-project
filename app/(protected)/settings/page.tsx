"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Settings, Save, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { Profile } from "@/lib/types"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data)
        setDisplayName(data.display_name ?? "")
        setBio(data.bio ?? "")
        setAvatarUrl(data.avatar_url ?? "")
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error
      toast.success("Profile updated!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-32 bg-card" />
        <Skeleton className="h-48 w-full rounded-2xl bg-card" />
      </div>
    )
  }

  const initials = (displayName || profile?.username || "?").slice(0, 2).toUpperCase()

  return (
    <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Profile
        </h2>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{displayName || profile?.username}</p>
            <p className="text-xs text-muted-foreground">@{profile?.username}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={profile?.username ?? "Your name"}
              maxLength={50}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Avatar URL</label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="bg-background border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground">Enter a URL to an image for your avatar.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a bit about yourself..."
              rows={3}
              maxLength={300}
              className="bg-background border-border text-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
          </div>

          <Button type="submit" disabled={saving} className="w-full sm:w-auto gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  )
}
