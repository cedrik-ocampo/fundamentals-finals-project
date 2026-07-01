import { createClient } from "@/lib/supabase/server"
import { insertActivity } from "@/lib/activity"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { username } = await params

  // Look up target user by username
  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .eq("username", username)
    .single()

  if (targetError || !target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (target.id === user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
  }

  // Check existing follow
  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .match({ follower_id: user.id, following_id: target.id })
    .maybeSingle()

  let following: boolean

  if (existing) {
    // Unfollow
    const { error } = await supabase
      .from("follows")
      .delete()
      .match({ follower_id: user.id, following_id: target.id })

    if (error) {
      console.error("unfollow error:", error)
      return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
    }
    following = false
  } else {
    // Follow
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: target.id })

    if (error) {
      console.error("follow error:", error)
      return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
    }
    following = true

    await insertActivity(supabase, {
      user_id: user.id,
      activity_type: "follow",
      reference_id: target.id,
      metadata: {
        target_username: target.username,
        target_display_name: target.display_name ?? target.username,
      },
    })
  }

  return NextResponse.json({ data: { following } })
}
