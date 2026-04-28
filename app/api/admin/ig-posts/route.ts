import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_ARTISTS = ['namtan', 'film', 'luna'] as const;
const NUMERIC_FIELDS  = ['likes', 'comments', 'saves', 'reach', 'impressions'] as const;

// GET /api/admin/ig-posts?artist=namtan&limit=20
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const artist = searchParams.get('artist');
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);

  const supabase = getAdminClient();
  let query = supabase
    .from('ig_posts')
    .select('*')
    .order('post_date', { ascending: false })
    .order('artist')
    .limit(limit);

  if (artist && ALLOWED_ARTISTS.includes(artist as typeof ALLOWED_ARTISTS[number])) {
    query = query.eq('artist', artist);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/ig-posts
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { artist, post_date, likes, comments, saves, reach, impressions, emv, post_url, note } = body;

  if (!artist || !post_date) {
    return NextResponse.json({ error: 'Missing required fields: artist, post_date' }, { status: 400 });
  }
  if (!ALLOWED_ARTISTS.includes(artist)) {
    return NextResponse.json({ error: `artist must be one of: ${ALLOWED_ARTISTS.join(', ')}` }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('ig_posts')
    .insert({
      artist,
      post_date,
      post_url:    post_url    ?? null,
      likes:       parseInt(likes ?? 0, 10),
      comments:    parseInt(comments ?? 0, 10),
      saves:       parseInt(saves ?? 0, 10),
      reach:       parseInt(reach ?? 0, 10),
      impressions: parseInt(impressions ?? 0, 10),
      emv:         parseFloat(emv ?? 0),
      note:        note ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/ig-posts
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const safe: Record<string, unknown> = {};
  const allowedFields = ['artist', 'post_date', 'post_url', 'likes', 'comments', 'saves', 'reach', 'impressions', 'emv', 'note'];
  for (const k of allowedFields) {
    if (k in rest) {
      if (NUMERIC_FIELDS.includes(k as typeof NUMERIC_FIELDS[number])) {
        safe[k] = parseInt(rest[k], 10);
      } else if (k === 'emv') {
        safe[k] = parseFloat(rest[k]);
      } else {
        safe[k] = rest[k];
      }
    }
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('ig_posts')
    .update(safe)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/ig-posts?id=123
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getAdminClient();
  const { error } = await supabase.from('ig_posts').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
