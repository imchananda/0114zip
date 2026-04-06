import { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getAdminClient } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

import { cookies } from 'next/headers';

/**
 * Creates a server-side Supabase client using @supabase/ssr
 * This correctly handles Supabase's chunked cookies.
 */
export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignored if called from a Server Component
          }
        },
      },
    }
  );
}

export async function getAuthUserRole(req?: NextRequest): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    const admin = getAdminClient();
    const { data: profile } = await admin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) return null;
    return profile.role;
  } catch {
    return null;
  }
}

/**
 * Verify that the request is from an admin or moderator user.
 */
export async function verifyAdmin(req?: NextRequest): Promise<boolean> {
  try {
    const role = await getAuthUserRole(req);
    // Both admin and moderator have full access to general admin routes
    return role === 'admin' || role === 'moderator';
  } catch {
    return false;
  }
}

/**
 * Get the authenticated user's ID from the request.
 * Returns null if not authenticated.
 */
export async function getAuthUserId(req: NextRequest): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    return user.id;
  } catch {
    return null;
  }
}
