import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 24;

// GET /api/works?type=series&search=query&actor=namtan&page=1&limit=24
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const actor = searchParams.get('actor');
    const featured = searchParams.get('featured');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || String(PAGE_SIZE), 10);

    const page = Math.max(1, Number.isFinite(pageParam) ? pageParam : 1);
    const limit = Math.max(1, Math.min(Number.isFinite(limitParam) ? limitParam : PAGE_SIZE, 100));
    const offset = (page - 1) * limit;

    // Count query
    let countQ = supabase
      .from('content_items')
      .select('*', { count: 'exact', head: true })
      .eq('visible', true);
    if (type && type !== 'all') countQ = countQ.eq('content_type', type);
    if (search) countQ = countQ.or(`title.ilike.%${search}%,title_thai.ilike.%${search}%`);
    if (actor && actor !== 'both' && actor !== 'all') countQ = countQ.contains('actors', [actor]);
    if (featured === 'true') countQ = countQ.eq('featured', true);

    // Data query
    let dataQ = supabase
      .from('content_items')
      .select('*')
      .eq('visible', true)
      .order('sort_order', { ascending: true })
      .order('year', { ascending: false })
      .range(offset, offset + limit - 1);
    if (type && type !== 'all') dataQ = dataQ.eq('content_type', type);
    if (search) dataQ = dataQ.or(`title.ilike.%${search}%,title_thai.ilike.%${search}%`);
    if (actor && actor !== 'both' && actor !== 'all') dataQ = dataQ.contains('actors', [actor]);
    if (featured === 'true') dataQ = dataQ.eq('featured', true);

    const [{ count, error: countErr }, { data, error: dataErr }] = await Promise.all([countQ, dataQ]);

    if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 });
    if (dataErr) return NextResponse.json({ error: dataErr.message }, { status: 500 });

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: data ?? [],
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

