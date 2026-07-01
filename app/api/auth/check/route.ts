import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const CheckSchema = z.object({
  username: z.string().min(1).max(30).optional(),
  email: z.string().email().optional(),
})

// GET /api/auth/check?username=foo  → { available: boolean }
// GET /api/auth/check?email=foo@bar → { available: boolean }
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parsed = CheckSchema.safeParse({
    username: searchParams.get("username") ?? undefined,
    email: searchParams.get("email") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 })
  }

  const { username, email } = parsed.data

  if (!username && !email) {
    return NextResponse.json({ error: "Provide username or email" }, { status: 400 })
  }

  const supabase = await createClient()

  if (username) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .maybeSingle()
    return NextResponse.json({ available: !data })
  }

  if (email) {
    // Check profiles table via the email stored on auth users —
    // we can't query auth.users directly with anon key, so we attempt
    // a sign-in with a dummy password. If the error is "Invalid login
    // credentials" the email exists; "Email not confirmed" also means it exists.
    // The safest public-safe approach: check if a profile's username was derived
    // from this email prefix. Because we auto-generate usernames from email prefixes
    // this is not reliable — instead we'll try signInWithOtp dry-run via
    // a lightweight RPC that we expose, or just attempt signUp and catch the error.
    //
    // Simplest safe approach: use Supabase's resetPasswordForEmail which returns
    // success regardless (security by design). Instead, we expose a server-side
    // admin check via service role only server-side.
    //
    // We use the admin API with the service role key (server-only):
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      // Fallback: can't check email without service role
      return NextResponse.json({ available: true })
    }

    const { createClient: createAdminClient } = await import("@supabase/supabase-js")
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: users } = await admin.auth.admin.listUsers()
    const exists = users?.users?.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )
    return NextResponse.json({ available: !exists })
  }
}
