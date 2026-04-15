import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';
import { syncBrandMediaItems } from '@/lib/brand-sync';

export const dynamic = 'force-dynamic';

const ALLOWED = ['title', 'description', 'hashtags', 'start_date', 'end_date', 'is_active',
  'actors', 'event_type', 'venue', 'link', 'brand_collab_id'];

// Sync brand_collab_id to the linked content_items (schedule) row
async function syncBrandToSchedule(
  supabaseClient: ReturnType<typeof getAdminClient>,
  eventData: Record<string, unknown>
) {
  const contentItemId = eventData.content_item_id as string | null;
  if (!contentItemId) return;
  await supabaseClient
    .from('content_items')
    .update({ brand_collab_id: (eventData.brand_collab_id as number | null) ?? null })
    .eq('id', contentItemId);
}

// GET /api/admin/media-events — returns all events with nested posts
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('media_events')
    .select('*, media_posts(*)')
    .order('start_date', { ascending: false, nullsFirst: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/media-events
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const safe: Record<string, unknown> = {};
  for (const k of ALLOWED) if (k in body) safe[k] = body[k];

  const supabase = getAdminClient();
  const { data, error } = await supabase.from('media_events').insert([safe]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await syncBrandToSchedule(supabase, data);
  if (data.brand_collab_id) await syncBrandMediaItems(supabase, data.brand_collab_id as number);
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/media-events
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const safe: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of ALLOWED) if (k in updates) safe[k] = updates[k];

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('media_events')
    .update(safe)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await syncBrandToSchedule(supabase, data);
  if (data.brand_collab_id) await syncBrandMediaItems(supabase, data.brand_collab_id as number);
  return NextResponse.json(data);
}

// DELETE /api/admin/media-events?id=...
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getAdminClient();
  // Fetch brand_collab_id before deleting so we can re-sync after
  const { data: before } = await supabase
    .from('media_events')
    .select('brand_collab_id')
    .eq('id', id)
    .single();
  const { error } = await supabase.from('media_events').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (before?.brand_collab_id) await syncBrandMediaItems(supabase, before.brand_collab_id as number);
  return NextResponse.json({ ok: true });
}
