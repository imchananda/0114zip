import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/schedule
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type'); // 'upcoming', 'past', or null
    
    let query = supabase
      .from('content_items')
      .select('*, brand_collaborations(id, brand_name, brand_logo)')
      .eq('content_type', 'event')
      .eq('visible', true);

    if (type === 'upcoming') {
      // For upcoming, sort ascending (closest first)
      query = query.order('date', { ascending: true, nullsFirst: false });
      
      // Basic client-side string comparison: YYYY-MM-DD >= current YYYY-MM-DD
      const now = new Date();
      // Adjust to GMT+7 roughly by simple ISO string or just use regular ISO
      now.setHours(now.getHours() + 7);
      const nowStr = now.toISOString().slice(0, 16).replace('T', ' '); // YYYY-MM-DD HH:mm
      
      query = query.gte('date', nowStr);
    } else if (type === 'past') {
      // For past, sort descending (most recent first)
      query = query.order('date', { ascending: false });
      
      const now = new Date();
      now.setHours(now.getHours() + 7);
      const nowStr = now.toISOString().slice(0, 16).replace('T', ' ');
      
      query = query.lt('date', nowStr);
    } else {
      // Default: sort descending
      query = query.order('date', { ascending: false });
    }

    const limit = searchParams.get('limit');
    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
