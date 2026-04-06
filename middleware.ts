import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimitAPI, rateLimitAuth } from '@/lib/ratelimit';

// Routes to apply rate limiting depending on strictness
const API_ROUTES_PREFIX = '/api/';
const AUTH_ROUTES = ['/login', '/register', '/api/auth'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only apply rate limiting to specific sensitive routes
  const isApiRoute = path.startsWith(API_ROUTES_PREFIX);
  const isAuthRoute = AUTH_ROUTES.some((route) => path.startsWith(route));

  // Determine IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  if (isAuthRoute) {
    // 1. Strict Limiter for Auth Routes
    const { success, limit, remaining, reset } = await rateLimitAuth.limit(`auth_${ip}`);
    
    if (!success) {
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Too Many Requests', message: 'You have exceeded the allowed limit for authentication attempts. Please try again later.' },
          { status: 429, headers: { 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString() } }
        );
      }
      // If it's a page (like /login or /register), we could redirect to a friendly 429 error page
      // but for simplicity, we rewrite or return a plain response for now.
      return new NextResponse(
        `Too Many Requests. You are being rate limited. Please try again later.`,
        { status: 429, headers: { 'Content-Type': 'text/plain' } }
      );
    }
  } else if (isApiRoute) {
    // 2. Moderate Limiter for Standard API Routes
    const { success, limit, remaining, reset } = await rateLimitAPI.limit(`api_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'API rate limit exceeded.' },
        { status: 429, headers: { 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }
  }

  return NextResponse.next();
}

/**
 * Configure standard Next.js Matcher to target pages/apis efficiently
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - mascot (our static images like mascot/)
     */
    '/((?!_next/static|_next/image|favicon.ico|mascot/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
