import { notFound } from "next/navigation"
import { List } from "lucide-react"
import ListCard from "@/components/lists/ListCard"
import type { List as ListType } from "@/lib/types"
import { createClient } from "@/lib/supabase/server"

interface ListsPageProps {
  params: Promise<{ username: string }>
}

async function getUserLists(username: string): Promise<ListType[] | null> {
  try {
    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single()

    if (profileError || !profile) return null

    const { data: lists, error } = await supabase
      .from("lists")
      .select("*, list_items(anime_cover_url)")
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .order("created_at", { ascending: false })

    if (error) return null

    return (lists ?? []).map((list) => ({
      ...list,
      item_count: list.list_items?.length ?? 0,
      preview_covers: (list.list_items ?? [])
        .slice(0, 4)
        .map((item: { anime_cover_url: string | null }) => item.anime_cover_url)
        .filter(Boolean),
      list_items: undefined,
    })) as unknown as ListType[]
  } catch {
    return null
  }
}

export default async function UserListsPage({ params }: ListsPageProps) {
  const { username } = await params
  const lists = await getUserLists(username)

  if (!lists) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <List className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          <span className="text-muted-foreground font-normal">@{username}&apos;s</span> Lists
        </h1>
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <List className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No lists yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  )
}
