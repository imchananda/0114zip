import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
type SupabaseClient = ReturnType<typeof createClient<Database>>;
type CookieStore = {
  get: (name: string) => { value: string } | undefined;
  set?: (name: string, value: string, options?: object) => void;
  getAll?: () => { name: string; value: string }[];
};

// ── Public client (server-side read) ── lazy singleton to avoid build-time init errors
let _supabase: SupabaseClient | null = null;
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!_supabase) {
      _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    }
    return Reflect.get(_supabase, prop, receiver);
  },
});

// ── Browser client (client-side auth + reads) ──
let _browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowser() {
  if (typeof window === 'undefined') {
    // SSR needs a fresh instance
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  if (!_browserClient) {
    _browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _browserClient;
}

// ── Server client (server-side route handlers with cookie support) ──
export function createSupabaseServer(
  cookieStore: CookieStore
) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        if (typeof cookieStore.getAll === 'function') return cookieStore.getAll();
        return [];
      },
      setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
        try {
          const setCookie = cookieStore.set;
          if (typeof setCookie !== 'function') return;
          cookiesToSet.forEach(({ name, value, options }) =>
            setCookie(name, value, options)
          );
        } catch {}
      },
    },
  });
}

// ── Admin client (server-only, bypasses RLS) ──
export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.warn('[Supabase] SERVICE_ROLE_KEY not configured, using anon key');
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  return createClient(supabaseUrl, serviceKey);
}
