import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createSupabaseServer(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the intended page after successful login
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Auth exchange failed
    console.error('[OAuth callback] exchangeCodeForSession error:', error.message);
  }

  // Something went wrong — redirect to login with an error flag
  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
}
