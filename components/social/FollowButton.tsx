"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { UserPlus, UserMinus } from "lucide-react"

interface FollowButtonProps {
  username: string
  initialFollowing: boolean
}

export default function FollowButton({ username, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const newFollowing = !following
    setFollowing(newFollowing)

    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (res.status === 401) {
        setFollowing(!newFollowing)
        toast.error("Sign in to follow users")
        return
      }

      if (!res.ok) throw new Error("Failed")

      toast.success(newFollowing ? `Following ${username}` : `Unfollowed ${username}`)
    } catch {
      setFollowing(!newFollowing)
      toast.error("Failed to update follow status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      variant={following ? "outline" : "default"}
      size="sm"
      className="gap-1.5"
    >
      <span key={following ? "minus" : "plus"} className="animate-icon-in flex items-center gap-1.5">
        {following ? (
          <>
            <UserMinus className="h-4 w-4" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Follow
          </>
        )}
      </span>
    </Button>
  )
}
