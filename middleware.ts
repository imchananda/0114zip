import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimitAPI, rateLimitAuth } from '@/lib/ratelimit';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// Routes to apply rate limiting depending on strictness
const API_ROUTES_PREFIX = '/api/';
const AUTH_ROUTES = ['/login', '/register', '/api/auth'];

// In-memory cache for maintenance flag (refresh every 5 min)
// Querying Supabase REST directly avoids an internal HTTP round-trip through Next.js routing
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
let maintenanceCached: { enabled: boolean; message: string } | null = null;
let maintenanceCacheExpiry = 0;

async function getMaintenanceSettings(): Promise<{ enabled: boolean; message: string }> {
  const now = Date.now();
  if (maintenanceCached && now < maintenanceCacheExpiry) return maintenanceCached;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_settings?select=key,value&key=eq.maintenance`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 300 },
      }
    );
    if (res.ok) {
      const rows: { key: string; value: Record<string, any> }[] = await res.json();
      const value = rows?.[0]?.value ?? {};
      maintenanceCached = {
        enabled: value.enabled ?? false,
        message: value.message ?? 'เว็บไซต์กำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง',
      };
      maintenanceCacheExpiry = now + 300_000;
      return maintenanceCached;
    }
  } catch {}
  return { enabled: false, message: '' };
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Only apply rate limiting to specific sensitive routes
  const isApiRoute = path.startsWith(API_ROUTES_PREFIX);
  const isAuthRoute = AUTH_ROUTES.some((route) => path.startsWith(route));
  const isAdminRoute = path.startsWith('/admin');

  // Determine IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';

  if (isAuthRoute) {
    // 1. Strict Limiter for Auth Routes
    const { success, limit, remaining } = await rateLimitAuth.limit(`auth_${ip}`);
    
    if (!success) {
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Too Many Requests', message: 'You have exceeded the allowed limit for authentication attempts. Please try again later.' },
          { status: 429, headers: { 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString() } }
        );
      }
      return new NextResponse(
        `Too Many Requests. You are being rate limited. Please try again later.`,
        { status: 429, headers: { 'Content-Type': 'text/plain' } }
      );
    }
  } else if (isApiRoute) {
    // 2. Moderate Limiter for Standard API Routes
    const { success, limit, remaining } = await rateLimitAPI.limit(`api_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'API rate limit exceeded.' },
        { status: 429, headers: { 'X-RateLimit-Limit': limit.toString(), 'X-RateLimit-Remaining': remaining.toString() } }
      );
    }
  }

  // Skip i18n + maintenance check for /admin and /api
  if (isAdminRoute || isApiRoute || path.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  // ── Maintenance Mode ──────────────────────────────────────────────────────
  // Only check for non-admin, non-api page routes
  if (!isAdminRoute && !isApiRoute) {
    const { enabled, message } = await getMaintenanceSettings();
    if (enabled) {
      // Allow /auth pages so admins can still log in
      const isAuthPage = path.includes('/auth/');
      if (!isAuthPage) {
        return new NextResponse(
          `<!doctype html><html lang="th"><head><meta charset="utf-8"><title>กำลังปรับปรุง</title>
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#141413;color:#faf9f5;}
          .box{text-align:center;padding:2rem;max-width:400px;}h1{font-size:2rem;margin-bottom:1rem;}p{color:#87867f;}</style>
          </head><body><div class="box"><div style="font-size:3rem;margin-bottom:1rem">🔧</div>
          <h1>กำลังปรับปรุง</h1><p>${message}</p></div></body></html>`,
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '3600' } }
        );
      }
    }
  }

  return intlMiddleware(request);
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
     * - api routes (optional bypass in matcher itself, but we handle in code)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*\.js|mascot/|icons/|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)',
    // Match locales explicitly if needed
  ],
};
