import { createClient } from "@/lib/supabase/server"
import ListsClient from "./ListsClient"
import type { List as ListType } from "@/lib/types"

async function getLists(): Promise<ListType[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

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

  if (error || !data) return []

  return data.map((list) => ({
    ...list,
    item_count: Array.isArray(list.list_items)
      ? (list.list_items[0] as { count: number } | undefined)?.count ?? 0
      : 0,
    list_items: undefined,
  })) as unknown as ListType[]
}

export default async function ListsPage() {
  const lists = await getLists()

  return <ListsClient initialLists={lists} />
}
