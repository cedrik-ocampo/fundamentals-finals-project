import { createClient } from "@/lib/supabase/server"
import { insertActivity } from "@/lib/activity"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const DiaryCreateSchema = z.object({
  anilistId: z.number().int().positive(),
  animeTitle: z.string().min(1).max(500),
  animeCoverUrl: z.string().url().refine((u) => new URL(u).hostname === "s4.anilist.co", "Invalid cover URL host").nullable().optional(),
  genres: z.array(z.string()).nullable().optional(),
  dateStarted: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  dateCompleted: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  rating: z.number().min(0.5).max(5).multipleOf(0.5).nullable().optional(),
  rewatch: z.boolean().default(false),
  notes: z.string().max(2000).nullable().optional(),
})

const GetQuerySchema = z.object({
  sort: z
    .enum(["date_completed", "rating", "created_at"])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
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

  const parsed = GetQuerySchema.safeParse({
    sort: searchParams.get("sort") ?? "created_at",
    order: searchParams.get("order") ?? "desc",
    year: searchParams.get("year") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { sort, order, year } = parsed.data

  let query = supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id)
    .order(sort, { ascending: order === "asc", nullsFirst: false })

  if (year) {
    query = query
      .gte("date_completed", `${year}-01-01`)
      .lte("date_completed", `${year}-12-31`)
  }

  const { data, error } = await query

  if (error) {
    console.error("diary GET error:", error)
    return NextResponse.json({ error: "Failed to fetch diary entries" }, { status: 500 })
  }

  return NextResponse.json({ data })
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

  const parsed = DiaryCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const {
    anilistId,
    animeTitle,
    animeCoverUrl,
    genres,
    dateStarted,
    dateCompleted,
    rating,
    rewatch,
    notes,
  } = parsed.data

  const { data, error } = await supabase
    .from("diary_entries")
    .insert({
      user_id: user.id,
      anilist_id: anilistId,
      anime_title: animeTitle,
      anime_cover_url: animeCoverUrl ?? null,
      genres: genres ?? null,
      date_started: dateStarted ?? null,
      date_completed: dateCompleted ?? null,
      rating: rating ?? null,
      rewatch,
      notes: notes ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error("diary POST error:", error)
    return NextResponse.json({ error: "Failed to create diary entry" }, { status: 500 })
  }

  await insertActivity(supabase, {
    user_id: user.id,
    activity_type: "diary_entry",
    reference_id: data.id,
    anilist_id: anilistId,
    anime_title: animeTitle,
    anime_cover_url: animeCoverUrl ?? undefined,
    metadata: { rating, rewatch },
  })

  return NextResponse.json({ data }, { status: 201 })
}

