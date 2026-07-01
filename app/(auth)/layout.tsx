import Link from "next/link"
import { Tv } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Tv className="h-8 w-8" />
            <span>AniTrack</span>
          </Link>
          <p className="text-sm text-muted-foreground">Track your anime journey</p>
        </div>

        {/* Auth card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-2xl shadow-primary/5">
          {children}
        </div>
      </div>
    </div>
  )
}
