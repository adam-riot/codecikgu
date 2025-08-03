// Security middleware for admin routes and API protection
import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from './adminAuth'
import { supabase } from './supabase'

// Rate limiting implementation
class RateLimiter {
  private static requests = new Map<string, number[]>()
  private static readonly WINDOW_MS = 60000 // 1 minute
  private static readonly MAX_REQUESTS = 100 // requests per window

  static isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.WINDOW_MS
    
    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || []
    
    // Filter requests within the current window
    const recentRequests = requests.filter(time => time > windowStart)
    
    // Check if rate limit exceeded
    if (recentRequests.length >= this.MAX_REQUESTS) {
      return true
    }
    
    // Add current request
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    
    return false
  }

  static getRemainingRequests(identifier: string): number {
    const now = Date.now()
    const windowStart = now - this.WINDOW_MS
    const requests = this.requests.get(identifier) || []
    const recentRequests = requests.filter(time => time > windowStart)
    return Math.max(0, this.MAX_REQUESTS - recentRequests.length)
  }

  // Clean up old entries periodically
  static cleanup() {
    const now = Date.now()
    const windowStart = now - this.WINDOW_MS
    
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > windowStart)
      if (recentRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, recentRequests)
      }
    }
  }
}

// Clean up rate limiter every 5 minutes
setInterval(() => RateLimiter.cleanup(), 5 * 60 * 1000)

// CSRF token validation
export function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token')
  const sessionToken = request.cookies.get('csrf-token')?.value
  
  if (!token || !sessionToken) {
    return false
  }
  
  return token === sessionToken
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 1000) // Limit length
}

// Admin middleware with enhanced security
export async function adminMiddleware(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  
  // Rate limiting
  if (RateLimiter.isRateLimited(`admin-${clientIP}`)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' }, 
      { status: 429 }
    )
  }
  
  // CSRF protection for state-changing requests
  if (request.method !== 'GET' && !validateCSRFToken(request)) {
    return NextResponse.json(
      { error: 'CSRF token validation failed' }, 
      { status: 403 }
    )
  }
  
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

    // Add comprehensive security headers
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    response.headers.set('Content-Security-Policy', 
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; object-src 'none';"
    )
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', 
      RateLimiter.getRemainingRequests(`admin-${clientIP}`).toString()
    )
    
    return response
  } catch (error) {
    console.error('Admin middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// API rate limiting middleware
export function apiRateLimitMiddleware(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const endpoint = request.nextUrl.pathname
  
  if (RateLimiter.isRateLimited(`api-${clientIP}-${endpoint}`)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' }, 
      { status: 429 }
    )
  }
  
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Remaining', 
    RateLimiter.getRemainingRequests(`api-${clientIP}-${endpoint}`).toString()
  )
  
  return response
}

// Input validation middleware
export function validateInputMiddleware(request: NextRequest) {
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' }, 
        { status: 400 }
      )
    }
  }
  
  return NextResponse.next()
}

// Security headers middleware
export function securityHeadersMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Basic security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // HSTS for HTTPS
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; object-src 'none';"
  )
  
  return response
}

// Authentication middleware
export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Role-based access middleware
export async function roleMiddleware(request: NextRequest, allowedRoles: string[]) {
  const token = request.cookies.get('sb-access-token')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get user role from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Role middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// Export middleware chain for easy use
export const securityMiddlewareChain = [
  securityHeadersMiddleware,
  validateInputMiddleware,
  apiRateLimitMiddleware
]
