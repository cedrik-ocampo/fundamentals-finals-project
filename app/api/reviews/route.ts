import { createClient } from "@/lib/supabase/server"
import { insertActivity } from "@/lib/activity"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const GetQuerySchema = z.object({
  anilistId: z.coerce.number().int().positive("anilistId is required"),
  page: z.coerce.number().int().positive().default(1),
})

const ReviewCreateSchema = z.object({
  anilistId: z.number().int().positive(),
  animeTitle: z.string().min(1).max(500),
  animeCoverUrl: z.string().url().refine((u) => new URL(u).hostname === "s4.anilist.co", "Invalid cover URL host").nullable().optional(),
  rating: z.number().min(0.5).max(5).multipleOf(0.5).nullable().optional(),
  body: z.string().min(1).max(10000),
  containsSpoilers: z.boolean().default(false),
})

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)

  const parsed = GetQuerySchema.safeParse({
    anilistId: searchParams.get("anilistId") ?? undefined,
    page: searchParams.get("page") ?? 1,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { anilistId, page } = parsed.data
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Check if caller is authenticated (for user_liked)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*, profiles!reviews_user_id_fkey(*)")
    .eq("anilist_id", anilistId)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("reviews GET error:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }

  // Attach user_liked if authenticated
  let enriched = reviews
  if (user && reviews.length > 0) {
    const reviewIds = reviews.map((r) => r.id)
    const { data: likes } = await supabase
      .from("review_likes")
      .select("review_id")
      .eq("user_id", user.id)
      .in("review_id", reviewIds)

    const likedSet = new Set((likes ?? []).map((l) => l.review_id))
    enriched = reviews.map((r) => ({ ...r, user_liked: likedSet.has(r.id) }))
  }

  return NextResponse.json({ data: enriched })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = ReviewCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { anilistId, animeTitle, animeCoverUrl, rating, body: reviewBody, containsSpoilers } =
    parsed.data

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      anilist_id: anilistId,
      anime_title: animeTitle,
      anime_cover_url: animeCoverUrl ?? null,
      rating: rating ?? null,
      body: reviewBody,
      contains_spoilers: containsSpoilers,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You have already reviewed this anime" },
        { status: 409 }
      )
    }
    console.error("reviews POST error:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }

  await insertActivity(supabase, {
    user_id: user.id,
    activity_type: "review",
    reference_id: data.id,
    anilist_id: anilistId,
    anime_title: animeTitle,
    anime_cover_url: animeCoverUrl ?? undefined,
    metadata: { rating, contains_spoilers: containsSpoilers },
  })

  return NextResponse.json({ data }, { status: 201 })
}

