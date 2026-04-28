import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/media?platform=ig&artist=namtan
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const platform = searchParams.get('platform');
    const artist = searchParams.get('artist');
    const isFocus = searchParams.get('isFocus');
    const limit = searchParams.get('limit') || '50';

    let query = supabase
      .from('media_posts')
      .select('*, media_events!inner(is_active)')
      .eq('is_visible', true)
      .eq('media_events.is_active', true)
      .order('post_date', { ascending: false })
      .limit(parseInt(limit, 10));

    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }
    if (artist && artist !== 'all') {
      query = query.eq('artist', artist);
    }
    if (isFocus === 'true') {
      query = query.eq('is_focus', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('API Error /api/media GET:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error /api/media GET:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
