import { NextRequest, NextResponse } from 'next/server';
import { aggregateSchedule } from '@/lib/schedule/aggregate';
import { fetchScheduleSourceToggles } from '@/lib/schedule/settings';
import { toPublicScheduleEvents } from '@/lib/schedule/public-dto';
import type { ScheduleTimeFilter } from '@/lib/schedule/types';
import { supabase } from '@/lib/supabase';
export const revalidate = 60;

function parseTimeFilter(value: string | null): ScheduleTimeFilter {
  if (value === 'upcoming' || value === 'past') return value;
  return 'all';
}

// GET /api/schedule — public aggregated schedule
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = parseTimeFilter(searchParams.get('type'));
    const limitRaw = searchParams.get('limit');
    const limit = limitRaw ? parseInt(limitRaw, 10) : undefined;

    const items = await aggregateSchedule(supabase, {
      includeHidden: false,
      sources: await fetchScheduleSourceToggles(supabase),
      type,
      limit: Number.isFinite(limit) ? limit : undefined,
    });
    return NextResponse.json(toPublicScheduleEvents(items));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
