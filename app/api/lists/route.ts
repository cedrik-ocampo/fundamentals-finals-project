import { createClient } from "@/lib/supabase/server"
import { insertActivity } from "@/lib/activity"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ListCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  isPublic: z.boolean().default(true),
  listType: z.enum(["watchlist", "favorites", "custom"]).default("custom"),
})

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("lists")
    .select(
      `
      *,
      list_items(count)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("lists GET error:", error)
    return NextResponse.json({ error: "Failed to fetch lists" }, { status: 500 })
  }

  // Normalise count from Supabase aggregation shape
  const lists = data.map((list) => ({
    ...list,
    item_count: Array.isArray(list.list_items)
      ? (list.list_items[0] as { count: number } | undefined)?.count ?? 0
      : 0,
    list_items: undefined,
  }))

  return NextResponse.json({ data: lists })
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

  const parsed = ListCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { name, description, isPublic, listType } = parsed.data

  const { data, error } = await supabase
    .from("lists")
    .insert({
      user_id: user.id,
      name,
      description: description ?? null,
      is_public: isPublic,
      list_type: listType,
    })
    .select()
    .single()

  if (error) {
    console.error("lists POST error:", error)
    return NextResponse.json({ error: "Failed to create list" }, { status: 500 })
  }

  await insertActivity(supabase, {
    user_id: user.id,
    activity_type: "list_created",
    reference_id: data.id,
    metadata: { list_name: name },
  })

  return NextResponse.json({ data }, { status: 201 })
}

