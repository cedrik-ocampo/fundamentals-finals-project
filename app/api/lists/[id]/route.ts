import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ListUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  isPublic: z.boolean().optional(),
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

  // Fetch list
  const { data: list, error: listError } = await supabase
    .from("lists")
    .select("*, profiles(*)")
    .eq("id", id)
    .single()

  if (listError || !list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 })
  }

  // Enforce visibility: must be public or owned by caller
  if (!list.is_public && list.user_id !== user?.id) {
    return NextResponse.json({ error: "List not found" }, { status: 404 })
  }

  // Fetch items
  const { data: items, error: itemsError } = await supabase
    .from("list_items")
    .select("*")
    .eq("list_id", id)
    .order("position", { ascending: true })

  if (itemsError) {
    console.error("list items GET error:", itemsError)
    return NextResponse.json({ error: "Failed to fetch list items" }, { status: 500 })
  }

  return NextResponse.json({ data: { ...list, items } })
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

  const parsed = ListUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description
  if (parsed.data.isPublic !== undefined) updateData.is_public = parsed.data.isPublic

  const { data, error } = await supabase
    .from("lists")
    .update(updateData)
    .match({ id, user_id: user.id })
    .select()
    .single()

  if (error || !data) {
    if (!data) {
      return NextResponse.json({ error: "List not found" }, { status: 404 })
    }
    console.error("list PUT error:", error)
    return NextResponse.json({ error: "Failed to update list" }, { status: 500 })
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
    .from("lists")
    .delete({ count: "exact" })
    .match({ id, user_id: user.id })

  if (error) {
    console.error("list DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete list" }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: "List not found" }, { status: 404 })
  }

  return NextResponse.json({ data: { success: true } })
}
