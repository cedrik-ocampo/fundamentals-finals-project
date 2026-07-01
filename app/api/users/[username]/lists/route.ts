import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { data: lists, error } = await supabase
    .from("lists")
    .select("*, list_items(anime_cover_url)")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("user lists GET error:", error)
    return NextResponse.json({ error: "Failed to fetch lists" }, { status: 500 })
  }

  const data = (lists ?? []).map((list) => ({
    ...list,
    item_count: list.list_items?.length ?? 0,
    preview_covers: (list.list_items ?? [])
      .slice(0, 4)
      .map((item: { anime_cover_url: string | null }) => item.anime_cover_url)
      .filter(Boolean),
    list_items: undefined,
  }))

  return NextResponse.json({ data })
}
