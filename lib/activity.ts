import type { SupabaseClient } from "@supabase/supabase-js"

interface ActivityPayload {
  user_id: string
  activity_type: "diary_entry" | "review" | "list_created" | "list_item_added" | "follow"
  reference_id?: string
  anilist_id?: number
  anime_title?: string
  anime_cover_url?: string
  metadata?: Record<string, unknown>
}

export async function insertActivity(
  supabase: SupabaseClient,
  payload: ActivityPayload
): Promise<void> {
  const { error } = await supabase.from("activity").insert(payload)
  if (error) {
    // Non-fatal — don't break the primary operation
    console.error("Failed to insert activity:", error.message)
  }
}
