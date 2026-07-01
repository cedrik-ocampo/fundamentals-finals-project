import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const QuerySchema = z.object({
  cursor: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)

  const parsed = QuerySchema.safeParse({
    cursor: searchParams.get("cursor") ?? 0,
    limit: searchParams.get("limit") ?? 20,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { cursor, limit } = parsed.data

  // Get list of users the current user follows
  const { data: followingRows, error: followError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)

  if (followError) {
    console.error("feed follows error:", followError)
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 })
  }

  const followingIds = (followingRows ?? []).map((r) => r.following_id)

  // Include own activity in feed
  const userIds = [...followingIds, user.id]

  if (userIds.length === 0) {
    return NextResponse.json({ data: [], nextCursor: null })
  }

  const { data: activities, error: activityError } = await supabase
    .from("activity")
    .select("*, profiles(*)")
    .in("user_id", userIds)
    .order("created_at", { ascending: false })
    .range(cursor, cursor + limit - 1)

  if (activityError) {
    console.error("feed activity error:", activityError)
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 })
  }

  const nextCursor =
    activities.length === limit ? cursor + limit : null

  return NextResponse.json({ data: activities, nextCursor })
}

