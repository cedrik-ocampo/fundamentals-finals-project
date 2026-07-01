import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id: listId, itemId } = await params

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
    .match({ id: itemId, list_id: listId })

  if (error) {
    console.error("list item DELETE error:", error)
    return NextResponse.json({ error: "Failed to remove item from list" }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: "List item not found" }, { status: 404 })
  }

  return NextResponse.json({ data: { success: true } })
}
