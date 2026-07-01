import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ReviewUpdateSchema = z.object({
  rating: z.number().min(0.5).max(5).multipleOf(0.5).nullable().optional(),
  body: z.string().min(1).max(10000).optional(),
  containsSpoilers: z.boolean().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: review, error } = await supabase
    .from("reviews")
    .select("*, profiles!reviews_user_id_fkey(*)")
    .eq("id", id)
    .single()

  if (error || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  // Attach user_liked if authenticated
  let userLiked = false
  if (user) {
    const { data: like } = await supabase
      .from("review_likes")
      .select("review_id")
      .match({ review_id: id, user_id: user.id })
      .maybeSingle()
    userLiked = !!like
  }

  return NextResponse.json({ data: { ...review, user_liked: userLiked } })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = ReviewUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.rating !== undefined) updateData.rating = parsed.data.rating
  if (parsed.data.body !== undefined) updateData.body = parsed.data.body
  if (parsed.data.containsSpoilers !== undefined)
    updateData.contains_spoilers = parsed.data.containsSpoilers

  const { data, error } = await supabase
    .from("reviews")
    .update(updateData)
    .match({ id, user_id: user.id })
    .select()
    .single()

  if (error || !data) {
    if (!data) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }
    console.error("review PUT error:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
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

  const { id } = await params

  const { error, count } = await supabase
    .from("reviews")
    .delete({ count: "exact" })
    .match({ id, user_id: user.id })

  if (error) {
    console.error("review DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  return NextResponse.json({ data: { success: true } })
}
