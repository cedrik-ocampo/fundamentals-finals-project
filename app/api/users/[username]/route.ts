import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const supabase = await createClient()
  const { username } = await params

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser()

  const [
    { count: diaryCount },
    { count: reviewCount },
    { count: listCount },
    { count: followersCount },
    { count: followingCount },
    { data: recentActivity },
    { data: recentDiary },
    { data: followRow },
  ] = await Promise.all([
    supabase
      .from("diary_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("lists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    supabase
      .from("activity")
      .select("*, profiles(*)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5),
    viewer
      ? supabase
          .from("follows")
          .select("follower_id")
          .match({ follower_id: viewer.id, following_id: profile.id })
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const stats = {
    watched_count: diaryCount ?? 0,
    review_count: reviewCount ?? 0,
    list_count: listCount ?? 0,
    followers_count: followersCount ?? 0,
    following_count: followingCount ?? 0,
  }

  return NextResponse.json({
    data: {
      profile,
      stats,
      recentActivity: recentActivity ?? [],
      recentDiary: recentDiary ?? [],
      isFollowing: !!followRow,
    },
  })
}
