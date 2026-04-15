import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export const revalidate = 3600; // Cache awards for 1 hour

// GET /api/awards — public, optionally filter by artist or result
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const artist = searchParams.get('artist');
    const result = searchParams.get('result');

    const supabase = getAdminClient();
    let query = supabase
      .from('awards')
      .select('*')
      .order('year', { ascending: false })
      .order('created_at', { ascending: false });

    if (artist && artist !== 'all') {
      query = query.eq('artist', artist);
    }
    if (result && result !== 'all') {
      query = query.eq('result', result);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data ?? []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
