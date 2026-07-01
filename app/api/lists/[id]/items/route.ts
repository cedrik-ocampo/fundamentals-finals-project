import { createClient } from "@/lib/supabase/server"
import { insertActivity } from "@/lib/activity"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export async function DELETE(
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

  const { id: listId } = await params
  const { searchParams } = new URL(request.url)
  const anilistIdParam = searchParams.get("anilistId")

  if (!anilistIdParam) {
    return NextResponse.json({ error: "anilistId query param is required" }, { status: 400 })
  }

  const anilistId = parseInt(anilistIdParam, 10)
  if (isNaN(anilistId)) {
    return NextResponse.json({ error: "Invalid anilistId" }, { status: 400 })
  }

  // Verify list ownership
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("id")
    .match({ id: listId, user_id: user.id })
    .single()

  if (listError || !list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 })
  }

  const { error, count } = await supabase
    .from("list_items")
    .delete({ count: "exact" })
    .match({ list_id: listId, anilist_id: anilistId })

  if (error) {
    console.error("list item DELETE by anilistId error:", error)
    return NextResponse.json({ error: "Failed to remove item from list" }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: "List item not found" }, { status: 404 })
  }

  return NextResponse.json({ data: { success: true } })
}

const ItemCreateSchema = z.object({
  anilistId: z.number().int().positive(),
  animeTitle: z.string().min(1).max(500),
  animeCoverUrl: z.string().url().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
})

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

  const { id: listId } = await params

  // Verify list ownership
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("id, user_id, name")
    .match({ id: listId, user_id: user.id })
    .single()

  if (listError || !list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = ItemCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { anilistId, animeTitle, animeCoverUrl, notes } = parsed.data

  // Determine next position
  const { data: posData } = await supabase
    .from("list_items")
    .select("position")
    .eq("list_id", listId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextPosition = (posData?.position ?? 0) + 1

  const { data, error } = await supabase
    .from("list_items")
    .insert({
      list_id: listId,
      anilist_id: anilistId,
      anime_title: animeTitle,
      anime_cover_url: animeCoverUrl ?? null,
      position: nextPosition,
      notes: notes ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This anime is already in the list" },
        { status: 409 }
      )
    }
    console.error("list items POST error:", error)
    return NextResponse.json({ error: "Failed to add item to list" }, { status: 500 })
  }

  await insertActivity(supabase, {
    user_id: user.id,
    activity_type: "list_item_added",
    reference_id: listId,
    anilist_id: anilistId,
    anime_title: animeTitle,
    anime_cover_url: animeCoverUrl ?? undefined,
    metadata: { list_name: list.name },
  })

  return NextResponse.json({ data }, { status: 201 })
}
