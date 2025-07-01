import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'
import type { Database } from './types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  const { data: { user } } = await supabase.auth.getUser()

  // Define paths that don't require authentication
  const publicPaths = ["/", "/login", "/daftar"]

  // If user is not logged in and trying to access a protected path, redirect to login
  if (!user && !publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // If user is logged in, fetch their profile to determine role
  if (user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("Error fetching profile in middleware:", error)
      // Handle error, maybe redirect to an error page or login
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const userRole = profile?.role || "awam" // Default to 'awam' if role is not found

    // Redirect based on role
    if (req.nextUrl.pathname.startsWith("/dashboard-murid") && userRole !== "murid") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    if (req.nextUrl.pathname.startsWith("/dashboard-awam") && userRole !== "awam") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    if (req.nextUrl.pathname.startsWith("/dashboard-admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // If user is logged in and tries to access login/daftar, redirect to their dashboard
    if (publicPaths.includes(req.nextUrl.pathname) && user) {
      if (userRole === "murid") {
        return NextResponse.redirect(new URL("/dashboard-murid", req.url))
      } else if (userRole === "awam") {
        return NextResponse.redirect(new URL("/dashboard-awam", req.url))
      } else if (userRole === "admin") {
        return NextResponse.redirect(new URL("/dashboard-admin", req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * - all other files in the public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\..*).*)',
  ],
}


