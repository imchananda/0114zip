import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient, supabase } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

export const revalidate = 600; // Cache timeline for 10 minutes

// GET /api/timeline — public, returns all events sorted year desc
export async function GET() {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
