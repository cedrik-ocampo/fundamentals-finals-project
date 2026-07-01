import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const CommentCreateSchema = z.object({
  body: z.string().min(1).max(2000),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id: reviewId } = await params

  // Verify review exists
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .single()

  if (reviewError || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(*)")
    .eq("review_id", reviewId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("comments GET error:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(
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

  const { id: reviewId } = await params

  // Verify review exists
  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("id")
    .eq("id", reviewId)
    .single()

  if (reviewError || !review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = CommentCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      review_id: reviewId,
      user_id: user.id,
      body: parsed.data.body,
    })
    .select("*, profiles(*)")
    .single()

  if (error) {
    console.error("comments POST error:", error)
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
