import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabase';

/**
 * Sanitize a redirect path to prevent Open Redirect attacks.
 * Only allows relative paths starting with a single `/`.
 */
function sanitizeRedirectPath(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return '/';
  }
  return raw;
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirectPath(searchParams.get('next'));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createSupabaseServer(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('[OAuth callback] exchangeCodeForSession error:', error.message);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
}
