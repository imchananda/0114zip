import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Public client (server-side read) ──
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Browser client (client-side auth + reads) ──
export function createSupabaseBrowser() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// ── Admin client (server-only, bypasses RLS) ──
export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.warn('[Supabase] SERVICE_ROLE_KEY not configured, using anon key');
    return supabase;
  }
  return createClient(supabaseUrl, serviceKey);
}
