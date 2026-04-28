import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, supabase } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

// Cache GET for 5 minutes — settings change infrequently
export const revalidate = 300;

// GET /api/admin/settings — returns { general, features, social, maintenance }
export async function GET(req: NextRequest) {
  // Settings are public-readable
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const settings: Record<string, any> = {};
  for (const row of (data as any[]) ?? []) {
    settings[row.key] = row.value;
  }
  return NextResponse.json(settings);
}

// PUT /api/admin/settings — upsert one key at a time or all keys
// Body: { key: string, value: object } or { general: {}, features: {}, ... }
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const admin = getAdminClient();

  // Support both single-key { key, value } and multi-key { general, features, ... }
  let rows: { key: string; value: any; updated_at: string }[] = [];

  if ('key' in body && 'value' in body) {
    rows = [{ key: body.key, value: body.value, updated_at: new Date().toISOString() }];
  } else {
    rows = Object.entries(body).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));
  }

  const { error } = await admin
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
