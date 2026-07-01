"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    setPasswordError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const msg = error.message.toLowerCase()

      if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
        // Check whether the email is registered to give a specific message
        try {
          const res = await fetch(`/api/auth/check?email=${encodeURIComponent(email)}`)
          const { available } = await res.json()
          if (available) {
            setEmailError("No account found with this email address.")
          } else {
            setPasswordError("Incorrect password. Please try again.")
          }
        } catch {
          // fallback if check fails
          setPasswordError("Incorrect email or password.")
        }
      } else if (msg.includes("email not confirmed")) {
        setEmailError("Please verify your email before signing in.")
      } else if (msg.includes("too many")) {
        toast.error("Too many login attempts. Please wait a moment and try again.")
      } else {
        toast.error(error.message)
      }

      setLoading(false)
      return
    }

    toast.success("Welcome back!")
    router.push("/home")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Sign in to your AniTrack account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(null) }}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className={cn(
              "bg-background border-border text-foreground",
              emailError && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {emailError && (
            <p className="text-xs text-destructive">{emailError}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(null) }}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={cn(
                "bg-background border-border text-foreground pr-10",
                passwordError && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-destructive">{passwordError}</p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full gap-2">
          <LogIn className="h-4 w-4" />
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  )
}
