import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — required for Server Components to pick up latest auth state
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isProtectedRoute = url.pathname.startsWith("/home") ||
    url.pathname.startsWith("/diary") ||
    url.pathname.startsWith("/lists") ||
    url.pathname.startsWith("/reviews/new") ||
    url.pathname.startsWith("/stats") ||
    url.pathname.startsWith("/settings")

  const isAuthRoute = url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup")

  if (!user && isProtectedRoute) {
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    url.pathname = "/home"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
