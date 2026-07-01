import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { data, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", profile.id)
    .order("date_completed", { ascending: false, nullsFirst: false })

  if (error) {
    console.error("user diary GET error:", error)
    return NextResponse.json({ error: "Failed to fetch diary" }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}
