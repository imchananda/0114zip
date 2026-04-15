import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_FIELDS = ['name', 'platform', 'tags', 'description', 'is_active'];

// GET /api/admin/hashtags
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('hashtag_sets')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/hashtags
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const safe: Record<string, unknown> = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in body) safe[k] = body[k];
  }
  if (!safe.name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

  // Normalise tags: accept string or array
  if (typeof safe.tags === 'string') {
    safe.tags = (safe.tags as string).split(' ').filter((t: string) => t.trim() !== '');
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase.from('hashtag_sets').insert([safe]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/hashtags
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const safe: Record<string, unknown> = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in updates) safe[k] = updates[k];
  }

  if (typeof safe.tags === 'string') {
    safe.tags = (safe.tags as string).split(' ').filter((t: string) => t.trim() !== '');
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('hashtag_sets')
    .update(safe)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/hashtags?id=xxx
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getAdminClient();
  const { error } = await supabase.from('hashtag_sets').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
