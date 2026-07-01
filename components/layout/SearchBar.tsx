"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Loader2, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AniListMedia } from "@/lib/types"

interface AnimeResult {
  kind: "anime"
  id: number
  title: string
  cover: string | null
  format: string | null
  year: number | null
}

interface UserResult {
  kind: "user"
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

type Result = AnimeResult | UserResult

function toAnimeResult(m: AniListMedia): AnimeResult {
  return {
    kind: "anime",
    id: m.id,
    title: m.title?.english ?? m.title?.romaji ?? "Unknown",
    cover: m.coverImage?.large ?? null,
    format: m.format ?? null,
    year: m.seasonYear ?? null,
  }
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      setLoading(false)
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const [animeRes, usersRes] = await Promise.all([
          fetch(`/api/anime/search?q=${encodeURIComponent(q)}&page=1`, { signal: controller.signal }),
          fetch(`/api/users/search?q=${encodeURIComponent(q)}`, { signal: controller.signal }),
        ])

        const combined: Result[] = []

        if (usersRes.ok) {
          const { data: users } = await usersRes.json()
          for (const u of (users ?? []).slice(0, 3)) {
            combined.push({ kind: "user", ...u })
          }
        }

        if (animeRes.ok) {
          const json = await animeRes.json()
          const media: AniListMedia[] = json.data?.Page?.media ?? []
          for (const m of media.slice(0, 6)) {
            combined.push(toAnimeResult(m))
          }
        }

        setResults(combined)
        setOpen(combined.length > 0)
        setCursor(-1)
      } catch {
        // aborted or network error — ignore
      } finally {
        setLoading(false)
      }
    }, 280)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  const navigate = useCallback(
    (result: Result) => {
      setOpen(false)
      setQuery("")
      if (result.kind === "anime") {
        router.push(`/anime/${result.id}`)
      } else {
        router.push(`/users/${result.username}`)
      }
    },
    [router]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (cursor >= 0 && results[cursor]) {
        navigate(results[cursor])
      } else if (query.trim()) {
        setOpen(false)
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setOpen(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const userResults = results.filter((r): r is UserResult => r.kind === "user")
  const animeResults = results.filter((r): r is AnimeResult => r.kind === "anime")

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {loading ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search anime or users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setOpen(true)}
            autoComplete="off"
            className="pl-9 bg-card border-border focus:border-primary"
          />
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1.5 w-full z-50 rounded-xl border border-border bg-card shadow-2xl shadow-black/40 overflow-hidden">
          {/* Users section */}
          {userResults.length > 0 && (
            <>
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Users
                </span>
              </div>
              <ul>
                {userResults.map((user) => {
                  const globalIdx = results.indexOf(user)
                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); navigate(user) }}
                        onMouseEnter={() => setCursor(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                          cursor === globalIdx ? "bg-primary/15" : "hover:bg-muted/40"
                        }`}
                      >
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={user.avatar_url ?? undefined} />
                          <AvatarFallback className="bg-secondary text-xs">
                            {(user.display_name ?? user.username).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {user.display_name ?? user.username}
                          </p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {/* Anime section */}
          {animeResults.length > 0 && (
            <>
              {userResults.length > 0 && <div className="border-t border-border/50 mx-3" />}
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Anime
                </span>
              </div>
              <ul>
                {animeResults.map((anime) => {
                  const globalIdx = results.indexOf(anime)
                  return (
                    <li key={anime.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); navigate(anime) }}
                        onMouseEnter={() => setCursor(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          cursor === globalIdx ? "bg-primary/15" : "hover:bg-muted/40"
                        }`}
                      >
                        <div className="relative w-8 h-11 rounded overflow-hidden shrink-0 bg-muted">
                          {anime.cover && (
                            <Image
                              src={anime.cover}
                              alt={anime.title}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{anime.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {[anime.format, anime.year].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          <div className="border-t border-border px-3 py-2 bg-muted/20">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                setOpen(false)
                router.push(`/search?q=${encodeURIComponent(query.trim())}`)
              }}
              className="w-full text-xs text-muted-foreground hover:text-primary transition-colors text-left flex items-center gap-1.5"
            >
              <Search className="h-3 w-3" />
              See all results for <span className="text-foreground font-medium">"{query}"</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
