"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Eye, EyeOff, UserPlus, Check, X,
  AtSign, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Password rules ───────────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { id: "length",  label: "At least 8 characters",          test: (p: string) => p.length >= 8 },
  { id: "upper",   label: "One uppercase letter (A–Z)",      test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower",   label: "One lowercase letter (a–z)",      test: (p: string) => /[a-z]/.test(p) },
  { id: "number",  label: "One number (0–9)",                test: (p: string) => /\d/.test(p) },
  { id: "special", label: "One special character (!@#$…)",   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password: string): number {
  return PASSWORD_RULES.filter((r) => r.test(password)).length
}

const STRENGTH_LABELS = ["", "Weak", "Weak", "Fair", "Strong", "Very Strong"]
const STRENGTH_COLORS = [
  "bg-border",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-emerald-500",
  "bg-emerald-400",
]

// ─── Username rules ───────────────────────────────────────────────────────────

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

function validateUsername(u: string): string | null {
  if (u.length < 3) return "At least 3 characters"
  if (u.length > 20) return "At most 20 characters"
  if (!USERNAME_RE.test(u)) return "Letters, numbers and underscores only"
  return null
}

// ─── Email format ─────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Component ───────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailTaken, setEmailTaken] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)

  const [username, setUsername] = useState("")
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)

  const [password, setPassword] = useState("")
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)

  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emailTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Debounced username availability check ──────────────────────────────────
  useEffect(() => {
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    if (!username || validateUsername(username)) {
      setUsernameAvailable(null)
      return
    }
    setUsernameChecking(true)
    usernameTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check?username=${encodeURIComponent(username)}`)
        const { available } = await res.json()
        setUsernameAvailable(available)
      } catch {
        setUsernameAvailable(null)
      } finally {
        setUsernameChecking(false)
      }
    }, 500)
    return () => { if (usernameTimer.current) clearTimeout(usernameTimer.current) }
  }, [username])

  // ── Debounced email check ──────────────────────────────────────────────────
  useEffect(() => {
    if (emailTimer.current) clearTimeout(emailTimer.current)
    if (!email || !EMAIL_RE.test(email)) {
      setEmailTaken(false)
      return
    }
    setEmailChecking(true)
    emailTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check?email=${encodeURIComponent(email)}`)
        const { available } = await res.json()
        setEmailTaken(!available)
      } catch {
        setEmailTaken(false)
      } finally {
        setEmailChecking(false)
      }
    }, 600)
    return () => { if (emailTimer.current) clearTimeout(emailTimer.current) }
  }, [email])

  const strength = getStrength(password)
  const allRulesMet = strength === PASSWORD_RULES.length
  const emailValid = EMAIL_RE.test(email) && !emailTaken
  const usernameValid = !validateUsername(username) && usernameAvailable === true
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const canSubmit = emailValid && usernameValid && allRulesMet && passwordsMatch && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordTouched(true)
    setEmailTouched(true)
    setUsernameTouched(true)

    if (!emailValid) { toast.error("Enter a valid, available email"); return }
    if (!usernameValid) { toast.error("Choose a valid, available username"); return }
    if (!allRulesMet) { toast.error("Password does not meet all requirements"); return }
    if (!passwordsMatch) { toast.error("Passwords do not match"); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/home`,
        data: { preferred_username: username.toLowerCase() },
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        setEmailTaken(true)
        toast.error("An account with this email already exists.")
      } else {
        toast.error(error.message)
      }
      setLoading(false)
      return
    }

    toast.success("Account created! Welcome to AniTrack.")
    router.push("/home")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-foreground">Create an account</h2>
        <p className="text-sm text-muted-foreground">Join AniTrack and start tracking</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* ── Email ── */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailTaken(false) }}
              onBlur={() => setEmailTouched(true)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className={cn(
                "bg-background border-border text-foreground pr-9",
                emailTouched && email && !EMAIL_RE.test(email) && "border-red-500",
                emailTouched && emailTaken && "border-red-500",
                emailTouched && emailValid && "border-emerald-500",
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {emailChecking ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : emailTouched && email ? (
                emailValid
                  ? <Check className="h-4 w-4 text-emerald-500" />
                  : <X className="h-4 w-4 text-red-500" />
              ) : null}
            </span>
          </div>
          {emailTouched && email && !EMAIL_RE.test(email) && (
            <p className="text-xs text-red-500">Enter a valid email address.</p>
          )}
          {emailTouched && emailTaken && EMAIL_RE.test(email) && (
            <p className="text-xs text-red-500">An account with this email already exists.</p>
          )}
        </div>

        {/* ── Username ── */}
        <div className="space-y-1.5">
          <label htmlFor="username" className="text-sm font-medium text-foreground">
            Username
          </label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value.toLowerCase()); setUsernameAvailable(null) }}
              onBlur={() => setUsernameTouched(true)}
              placeholder="your_username"
              required
              autoComplete="username"
              className={cn(
                "bg-background border-border text-foreground pl-9 pr-9",
                usernameTouched && username && validateUsername(username) && "border-red-500",
                usernameTouched && username && !validateUsername(username) && usernameAvailable === false && "border-red-500",
                usernameTouched && usernameValid && "border-emerald-500",
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameChecking ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : usernameTouched && username ? (
                usernameValid
                  ? <Check className="h-4 w-4 text-emerald-500" />
                  : validateUsername(username) === null && usernameAvailable === false
                  ? <X className="h-4 w-4 text-red-500" />
                  : null
              ) : null}
            </span>
          </div>
          {usernameTouched && username && validateUsername(username) && (
            <p className="text-xs text-red-500">{validateUsername(username)}</p>
          )}
          {usernameTouched && username && !validateUsername(username) && usernameAvailable === false && (
            <p className="text-xs text-red-500">Username is already taken.</p>
          )}
          {usernameTouched && usernameValid && (
            <p className="text-xs text-emerald-500">Username is available!</p>
          )}
        </div>

        {/* ── Password ── */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true) }}
              placeholder="Create a strong password"
              required
              autoComplete="new-password"
              className="bg-background border-border text-foreground pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength bar */}
          {passwordTouched && password && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      i <= strength ? STRENGTH_COLORS[strength] : "bg-border"
                    )}
                  />
                ))}
              </div>
              <p className={cn(
                "text-xs font-medium",
                strength <= 2 ? "text-red-500" : strength <= 3 ? "text-yellow-500" : "text-emerald-500"
              )}>
                {STRENGTH_LABELS[strength]}
              </p>

              {/* Rule checklist */}
              <ul className="space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(password)
                  return (
                    <li key={rule.id} className="flex items-center gap-1.5">
                      {ok
                        ? <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                        : <X className="h-3 w-3 text-red-400 shrink-0" />}
                      <span className={cn("text-xs", ok ? "text-emerald-500" : "text-muted-foreground")}>
                        {rule.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        {/* ── Confirm password ── */}
        <div className="space-y-1.5">
          <label htmlFor="confirm" className="text-sm font-medium text-foreground">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
              className={cn(
                "bg-background border-border text-foreground pr-9",
                confirmPassword && !passwordsMatch && "border-red-500",
                confirmPassword && passwordsMatch && "border-emerald-500",
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {confirmPassword && (
                passwordsMatch
                  ? <Check className="h-4 w-4 text-emerald-500" />
                  : <X className="h-4 w-4 text-red-500" />
              )}
            </span>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-red-500">Passwords do not match.</p>
          )}
        </div>

        <Button type="submit" disabled={!canSubmit} className="w-full gap-2 mt-2">
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
            : <><UserPlus className="h-4 w-4" /> Create Account</>}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
