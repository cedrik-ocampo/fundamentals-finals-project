import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { commentId } = await params

  const { error, count } = await supabase
    .from("comments")
    .delete({ count: "exact" })
    .match({ id: commentId, user_id: user.id })

  if (error) {
    console.error("comment DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }

  if (count === 0) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 })
  }

  return NextResponse.json({ data: { success: true } })
}
