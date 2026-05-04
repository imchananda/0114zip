import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';
import { syncBrandMediaItems } from '@/lib/brand-sync';

export const dynamic = 'force-dynamic';

const ALLOWED_FIELDS = [
  'event_id', 'platform', 'title', 'post_url', 'thumbnail', 'caption',
  'artist', 'work_title', 'post_date', 'hashtags', 'brand_collab_id',
  'views', 'likes', 'comments', 'shares', 'saves',
  'goal_views', 'goal_likes', 'goal_comments', 'goal_shares', 'goal_saves',
  'is_focus', 'is_visible',
];

// GET /api/admin/media
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('media_posts')
    .select('*')
    .order('post_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/media
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const safe: Record<string, unknown> = { post_date: body.post_date ?? new Date().toISOString() };
  for (const k of ALLOWED_FIELDS) {
    if (k in body) safe[k] = body[k];
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase.from('media_posts').insert([safe]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync linked brand's media_items
  if (data?.brand_collab_id) {
    await syncBrandMediaItems(supabase, data.brand_collab_id as number);
  }

  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/media
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const safe: Record<string, unknown> = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in updates) safe[k] = updates[k];
  }

  const supabase = getAdminClient();

  // Fetch current brand link before update (in case it's being unlinked)
  const { data: before } = await supabase
    .from('media_posts')
    .select('brand_collab_id')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('media_posts')
    .update(safe)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync both old and new brand (handles brand switching)
  const brandsToSync = new Set<number>();
  if (before?.brand_collab_id) brandsToSync.add(before.brand_collab_id as number);
  if (data?.brand_collab_id)   brandsToSync.add(data.brand_collab_id as number);
  for (const bid of brandsToSync) await syncBrandMediaItems(supabase, bid);

  return NextResponse.json(data);
}

// DELETE /api/admin/media?id=xxx
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getAdminClient();

  // Fetch brand link before delete so we can re-sync after
  const { data: before } = await supabase
    .from('media_posts')
    .select('brand_collab_id')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('media_posts').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (before?.brand_collab_id) {
    await syncBrandMediaItems(supabase, before.brand_collab_id as number);
  }

  return NextResponse.json({ success: true });
}
