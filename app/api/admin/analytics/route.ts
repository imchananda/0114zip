import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/auth';

// GET /api/admin/analytics?days=7
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const daysRaw = parseInt(req.nextUrl.searchParams.get('days') || '7', 10);
  const days = Number.isFinite(daysRaw) ? Math.max(1, Math.min(daysRaw, 365)) : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const admin = getAdminClient();

  // Total views in range
  const { count: totalViews } = await admin
    .from('page_views')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', since);

  // Views by day (last N days)
  const { data: rawViews } = await admin
    .from('page_views')
    .select('created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  const viewsByDay: Record<string, number> = {};
  rawViews?.forEach((v) => {
    const day = v.created_at.slice(0, 10);
    viewsByDay[day] = (viewsByDay[day] || 0) + 1;
  });

  // Top countries
  const { data: countryData } = await admin
    .from('page_views')
    .select('country')
    .gte('created_at', since)
    .not('country', 'is', null);

  const countryCounts: Record<string, number> = {};
  countryData?.forEach((v) => {
    if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
  });
  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));

  // Top pages
  const { data: pathData } = await admin
    .from('page_views')
    .select('path')
    .gte('created_at', since);

  const pathCounts: Record<string, number> = {};
  pathData?.forEach((v) => {
    pathCounts[v.path] = (pathCounts[v.path] || 0) + 1;
  });
  const topPages = Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  return NextResponse.json({
    totalViews: totalViews || 0,
    viewsByDay,
    topCountries,
    topPages,
    days,
  });
}
