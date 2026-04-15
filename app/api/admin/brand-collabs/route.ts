import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_CATEGORIES  = ['Beauty', 'Fashion', 'Food', 'Tech', 'Lifestyle', 'Entertainment', 'Other'];
const ALLOWED_COLLAB_TYPES = ['ambassador', 'endorsement', 'one_time', 'event'];
const ALLOWED_ARTISTS     = ['namtan', 'film', 'luna'];

// GET /api/admin/brand-collabs?artist=namtan
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const artist = req.nextUrl.searchParams.get('artist');

  const supabase = getAdminClient();
  let query = supabase
    .from('brand_collaborations')
    .select('*')
    .order('start_date', { ascending: false })
    .order('brand_name');

  if (artist && ALLOWED_ARTISTS.includes(artist)) {
    query = query.contains('artists', [artist]);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/brand-collabs
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { artists, brand_name, brand_logo, category, collab_type, start_date, end_date, visible, description, media_items } = body;

  if (!brand_name || !Array.isArray(artists) || artists.length === 0) {
    return NextResponse.json({ error: 'Missing required fields: brand_name, artists' }, { status: 400 });
  }

  const invalidArtists = artists.filter((a: string) => !ALLOWED_ARTISTS.includes(a));
  if (invalidArtists.length > 0) {
    return NextResponse.json({ error: `Invalid artists: ${invalidArtists.join(', ')}` }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('brand_collaborations')
    .insert({
      artists,
      brand_name,
      brand_logo:   brand_logo   ?? null,
      category:     category     ?? null,
      collab_type:  collab_type  ?? null,
      start_date:   start_date   ?? null,
      end_date:     end_date     ?? null,
      visible:      visible      !== false,
      description:  description  ?? null,
      media_items:  Array.isArray(media_items) ? media_items : [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/brand-collabs
export async function PUT(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const safe: Record<string, unknown> = {};
  const allowed = ['artists', 'brand_name', 'brand_logo', 'category', 'collab_type',
                   'start_date', 'end_date', 'visible', 'description', 'media_items'];
  for (const k of allowed) {
    if (k in rest) safe[k] = rest[k];
  }

  if (safe.artists && Array.isArray(safe.artists)) {
    const bad = (safe.artists as string[]).filter(a => !ALLOWED_ARTISTS.includes(a));
    if (bad.length > 0) {
      return NextResponse.json({ error: `Invalid artists: ${bad.join(', ')}` }, { status: 400 });
    }
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('brand_collaborations')
    .update(safe)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/admin/brand-collabs?id=1
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getAdminClient();
  const { error } = await supabase.from('brand_collaborations').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
