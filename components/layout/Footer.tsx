import Link from "next/link"
import { Tv } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tv className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">AniTrack</span>
            <span>© 2024</span>
            <span>·</span>
            <span>Powered by</span>
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              AniList
            </a>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/upcoming" className="hover:text-foreground transition-colors">
              Upcoming
            </Link>
            <Link href="/search" className="hover:text-foreground transition-colors">
              Search
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
