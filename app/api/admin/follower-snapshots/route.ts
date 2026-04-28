import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_ARTISTS = ['namtan', 'film', 'luna'] as const;
const ALLOWED_PLATFORMS = ['ig', 'x', 'tiktok', 'weibo'] as const;

// GET /api/admin/follower-snapshots?artist=namtan&platform=ig&limit=30
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const artist   = searchParams.get('artist');
  const platform = searchParams.get('platform');
  const limit    = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500);

  const supabase = getAdminClient();
  let query = supabase
    .from('artist_follower_snapshots')
    .select('*')
    .order('recorded_date', { ascending: false })
    .order('artist')
    .limit(limit);

  if (artist   && ALLOWED_ARTISTS.includes(artist as typeof ALLOWED_ARTISTS[number]))   query = query.eq('artist', artist);
  if (platform && ALLOWED_PLATFORMS.includes(platform as typeof ALLOWED_PLATFORMS[number])) query = query.eq('platform', platform);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/admin/follower-snapshots
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { artist, platform, followers, recorded_date, note } = body;

  if (!artist || !platform || followers === undefined || !recorded_date) {
    return NextResponse.json({ error: 'Missing required fields: artist, platform, followers, recorded_date' }, { status: 400 });
  }
  if (!ALLOWED_ARTISTS.includes(artist)) {
    return NextResponse.json({ error: `artist must be one of: ${ALLOWED_ARTISTS.join(', ')}` }, { status: 400 });
  }
  if (!ALLOWED_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: `platform must be one of: ${ALLOWED_PLATFORMS.join(', ')}` }, { status: 400 });
  }
  const followersNum = parseInt(followers, 10);
  if (isNaN(followersNum) || followersNum < 0) {
    return NextResponse.json({ error: 'followers must be a non-negative integer' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('artist_follower_snapshots')
    .upsert(
      { artist, platform, followers: followersNum, recorded_date, note: note ?? null },
      { onConflict: 'artist,platform,recorded_date' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/admin/follower-snapshots?id=123
export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = getAdminClient();
  const { error } = await supabase
    .from('artist_follower_snapshots')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
