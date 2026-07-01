import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: reviewId } = await params

  // Check if review exists
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id, likes_count")
    .eq("id", reviewId)
    .single()

  if (reviewError || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  // Check existing like
  const { data: existingLike } = await supabase
    .from("review_likes")
    .select("review_id")
    .match({ review_id: reviewId, user_id: user.id })
    .maybeSingle()

  let liked: boolean

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from("review_likes")
      .delete()
      .match({ review_id: reviewId, user_id: user.id })

    if (error) {
      console.error("unlike error:", error)
      return NextResponse.json({ error: "Failed to unlike review" }, { status: 500 })
    }
    liked = false
  } else {
    // Like
    const { error } = await supabase
      .from("review_likes")
      .insert({ review_id: reviewId, user_id: user.id })

    if (error) {
      console.error("like error:", error)
      return NextResponse.json({ error: "Failed to like review" }, { status: 500 })
    }
    liked = true
  }

  // Fetch updated count (trigger keeps it in sync)
  const { data: updated } = await supabase
    .from("reviews")
    .select("likes_count")
    .eq("id", reviewId)
    .single()

  return NextResponse.json({ data: { liked, count: updated?.likes_count ?? 0 } })
}
