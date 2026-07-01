import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const DiaryUpdateSchema = z.object({
  animeTitle: z.string().min(1).max(500).optional(),
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
  rewatch: z.boolean().optional(),
  notes: z.string().max(2000).nullable().optional(),
})

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

  const parsed = DiaryUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.animeTitle !== undefined) updateData.anime_title = parsed.data.animeTitle
  if (parsed.data.animeCoverUrl !== undefined) updateData.anime_cover_url = parsed.data.animeCoverUrl
  if (parsed.data.genres !== undefined) updateData.genres = parsed.data.genres
  if (parsed.data.dateStarted !== undefined) updateData.date_started = parsed.data.dateStarted
  if (parsed.data.dateCompleted !== undefined) updateData.date_completed = parsed.data.dateCompleted
  if (parsed.data.rating !== undefined) updateData.rating = parsed.data.rating
  if (parsed.data.rewatch !== undefined) updateData.rewatch = parsed.data.rewatch
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes

  const { data, error } = await supabase
    .from("diary_entries")
    .update(updateData)
    .match({ id, user_id: user.id })
    .select()
    .single()

  if (error || !data) {
    if (!data) {
      return NextResponse.json({ error: "Diary entry not found" }, { status: 404 })
    }
    console.error("diary PUT error:", error)
    return NextResponse.json({ error: "Failed to update diary entry" }, { status: 500 })
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
    .from("diary_entries")
    .delete({ count: "exact" })
    .match({ id, user_id: user.id })

  if (error) {
    console.error("diary DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete diary entry" }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: "Diary entry not found" }, { status: 404 })
  }

  return NextResponse.json({ data: { success: true } })
}
