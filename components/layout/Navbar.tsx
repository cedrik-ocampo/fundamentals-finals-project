"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Tv, User, LogOut, BookOpen, List, BarChart2, Settings, Home } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SearchBar from "@/components/layout/SearchBar"
import type { Profile } from "@/lib/types"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const NAV_LINKS = [
  { href: "/home",  label: "Home",  Icon: Home },
  { href: "/diary", label: "Diary", Icon: BookOpen },
  { href: "/lists", label: "Lists", Icon: List },
  { href: "/stats", label: "Stats", Icon: BarChart2 },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const { data } = await res.json()
          setProfile(data)
        }
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
      } else {
        fetch("/api/profile")
          .then((r) => r.ok ? r.json() : null)
          .then((json) => { if (json) setProfile(json.data) })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : profile?.username?.slice(0, 2).toUpperCase() ?? "?"

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link
            href={user ? "/home" : "/"}
            className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors shrink-0"
          >
            <Tv className="h-6 w-6" />
            <span>AniTrack</span>
          </Link>

          {/* Search */}
          <SearchBar />

          {/* Primary nav — desktop only, logged-in */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 shrink-0">
              {NAV_LINKS.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "text-foreground bg-secondary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.display_name ?? ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <div className="px-2 py-1.5 text-sm font-medium text-foreground">
                    {profile?.display_name ?? profile?.username ?? "User"}
                  </div>
                  <div className="px-2 pb-1.5 text-xs text-muted-foreground">
                    @{profile?.username ?? "..."}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/home" className="flex items-center gap-2 cursor-pointer">
                      <Home className="h-4 w-4" />
                      Home Feed
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/diary" className="flex items-center gap-2 cursor-pointer">
                      <BookOpen className="h-4 w-4" />
                      Diary
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/lists" className="flex items-center gap-2 cursor-pointer">
                      <List className="h-4 w-4" />
                      Lists
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/stats" className="flex items-center gap-2 cursor-pointer">
                      <BarChart2 className="h-4 w-4" />
                      Stats
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {profile?.username && (
                    <DropdownMenuItem asChild>
                      <Link href={`/users/${profile.username}`} className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
