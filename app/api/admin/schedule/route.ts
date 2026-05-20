import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { aggregateSchedule } from '@/lib/schedule/aggregate';
import { fetchScheduleSourceToggles } from '@/lib/schedule/settings';
import type { ScheduleTimeFilter } from '@/lib/schedule/types';
import { getAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function parseTimeFilter(value: string | null): ScheduleTimeFilter {
  if (value === 'upcoming' || value === 'past' || value === 'all') return value;
  return 'all';
}

// GET /api/admin/schedule
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const type = parseTimeFilter(searchParams.get('type'));
    const limitRaw = searchParams.get('limit');
    const limit = limitRaw ? parseInt(limitRaw, 10) : undefined;
    const admin = getAdminClient();

    const items = await aggregateSchedule(admin, {
      includeHidden: true,
      sources: await fetchScheduleSourceToggles(admin),
      type,
      limit: Number.isFinite(limit) ? limit : undefined,
    });

    return NextResponse.json(items);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
