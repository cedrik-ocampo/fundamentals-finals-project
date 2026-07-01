import Link from "next/link"
import { Search, User } from "lucide-react"
import AnimeGrid from "@/components/anime/AnimeGrid"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AniListMedia, Profile } from "@/lib/types"
import { searchAnime as fetchSearchAnime } from "@/lib/anilist"
import { createClient } from "@/lib/supabase/server"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

async function searchAnime(q: string): Promise<AniListMedia[]> {
  try {
    const result = await fetchSearchAnime(q)
    return result?.Page?.media ?? []
  } catch {
    return []
  }
}

async function searchUsers(q: string): Promise<Pick<Profile, "id" | "username" | "display_name" | "avatar_url">[]> {
  if (q.trim().length < 2) return []
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
      .limit(6)
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams

  const [animeResults, userResults] = q
    ? await Promise.all([searchAnime(q), searchUsers(q)])
    : [[], []]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Search className="h-7 w-7 text-primary" />
          Search
        </h1>
        <form method="get" className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search anime or users..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
            autoFocus
          />
        </form>
      </div>

      {!q ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Search className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">Search for anime or find users.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Users */}
          {userResults.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Users
                <span className="text-sm font-normal text-muted-foreground">
                  — {userResults.length} result{userResults.length !== 1 ? "s" : ""}
                </span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {userResults.map((user) => (
                  <Link
                    key={user.id}
                    href={`/users/${user.username}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-secondary/40 transition-colors"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-secondary text-sm">
                        {(user.display_name ?? user.username).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.display_name ?? user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Anime */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Anime
              <span className="text-sm font-normal text-muted-foreground ml-2">
                — {animeResults.length} result{animeResults.length !== 1 ? "s" : ""} for{" "}
                <span className="text-foreground">&ldquo;{q}&rdquo;</span>
              </span>
            </h2>
            <AnimeGrid animes={animeResults} />
          </section>
        </div>
      )}
    </div>
  )
}
