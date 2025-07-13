// Security middleware for admin routes
import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from './adminAuth'
import { supabase } from './supabase'

export async function adminMiddleware(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify admin status using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const adminUser = await AdminService.getAdminUser(user.id)
    if (!adminUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Add security headers
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    return response
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Rate limiting for API endpoints
export class RateLimiter {
  private static requests = new Map<string, number[]>()
  
  static isAllowed(ip: string, limit = 100, windowMs = 60000): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(ip) || []
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs)
    
    if (validRequests.length >= limit) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(ip, validRequests)
    return true
  }
}
