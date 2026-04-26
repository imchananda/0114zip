import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 120; // Cache for 2 minutes

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ARTISTS   = ['namtan', 'film', 'luna'] as const;
type Artist = (typeof ARTISTS)[number];

interface IgPostRow {
  artist: Artist;
}

// GET /api/engagement?year=2025
// Returns: latestSnapshots, snapshotHistory, igPosts, brandCollabs
export async function GET(req: NextRequest) {
  const yearParam = req.nextUrl.searchParams.get('year');
  const year = yearParam && /^\d{4}$/.test(yearParam) ? parseInt(yearParam, 10) : null;

  // Date range for filtering (null = all time)
  const dateFrom = year ? `${year}-01-01` : null;
  const dateTo   = year ? `${year}-12-31` : null;

  let snapshotsQ = supabase
    .from('artist_follower_snapshots')
    .select('*')
    .order('recorded_date', { ascending: true });
  if (dateFrom && dateTo) {
    snapshotsQ = snapshotsQ.gte('recorded_date', dateFrom).lte('recorded_date', dateTo);
  }

  let igPostsQ = supabase
    .from('ig_posts')
    .select('*')
    .order('post_date', { ascending: false });
  if (dateFrom && dateTo) {
    igPostsQ = igPostsQ.gte('post_date', dateFrom).lte('post_date', dateTo);
  }

  let brandsQ = supabase
    .from('brand_collaborations')
    .select('*')
    .eq('visible', true)
    .order('start_date', { ascending: false });
  if (dateFrom && dateTo) {
    brandsQ = brandsQ.gte('start_date', dateFrom).lte('start_date', dateTo);
  }

  const [snapshotsRes, igPostsRes, brandsRes] = await Promise.allSettled([
    snapshotsQ,
    igPostsQ,
    brandsQ,
  ]);

  // ── Follower snapshots ──────────────────────────────────────────────────────
  const allSnapshots =
    snapshotsRes.status === 'fulfilled' && !snapshotsRes.value.error
      ? snapshotsRes.value.data ?? []
      : [];

  // Latest value per artist × platform
  const latestMap: Record<string, Record<string, number>> = {};
  for (const artist of ARTISTS) latestMap[artist] = {};
  for (const row of allSnapshots) {
    if (!latestMap[row.artist]) latestMap[row.artist] = {};
    // Since ordered by asc date, later rows overwrite earlier → last write = latest
    latestMap[row.artist][row.platform] = row.followers;
  }

  // History grouped by recorded_date for chart rendering
  // Shape: [{ date: '2026-04', namtan_ig: 123, film_ig: 456, ... }]
  const historyByDate: Record<string, Record<string, number | string>> = {};
  for (const row of allSnapshots) {
    const month = row.recorded_date.substring(0, 7); // 'YYYY-MM'
    if (!historyByDate[month]) historyByDate[month] = { date: month };
    const key = `${row.artist}_${row.platform}`;
    // Use the latest value for the same month
    const existing = historyByDate[month][key] as number | undefined;
    if (existing === undefined || row.followers > (existing ?? 0)) {
      historyByDate[month][key] = row.followers;
    }
  }

  // ── Fallback to old follower_history table when new table has no data ───────
  const hasNewData = ARTISTS.some(a => Object.keys(latestMap[a]).length > 0);
  if (!hasNewData) {
    const { data: oldHistory } = await supabase
      .from('follower_history')
      .select('month, month_order, year, namtan_ig, film_ig, namtan_x, film_x, namtan_tiktok, film_tiktok')
      .order('year', { ascending: true })
      .order('month_order', { ascending: true });

    if (oldHistory && oldHistory.length > 0) {
      for (const row of oldHistory) {
        const month = `${row.year}-${String(row.month_order).padStart(2, '0')}`;
        historyByDate[month] = {
          date:          month,
          namtan_ig:     row.namtan_ig     ?? 0,
          film_ig:       row.film_ig       ?? 0,
          namtan_x:      row.namtan_x      ?? 0,
          film_x:        row.film_x        ?? 0,
          namtan_tiktok: row.namtan_tiktok ?? 0,
          film_tiktok:   row.film_tiktok   ?? 0,
        };
      }
      // Latest row → latestMap (namtan + film only; luna has no old data)
      const latest = oldHistory[oldHistory.length - 1];
      latestMap['namtan'] = {
        ig:     latest.namtan_ig     ?? 0,
        x:      latest.namtan_x      ?? 0,
        tiktok: latest.namtan_tiktok ?? 0,
      };
      latestMap['film'] = {
        ig:     latest.film_ig     ?? 0,
        x:      latest.film_x      ?? 0,
        tiktok: latest.film_tiktok ?? 0,
      };
    }
  }

  const snapshotHistory = Object.values(historyByDate).sort((a, b) =>
    (a.date as string).localeCompare(b.date as string)
  );

  // ── IG Posts ────────────────────────────────────────────────────────────────
  const allPosts: IgPostRow[] =
    igPostsRes.status === 'fulfilled' && !igPostsRes.value.error
      ? (igPostsRes.value.data as IgPostRow[] | null) ?? []
      : [];

  // Latest 6 per artist
  const igPosts: Record<string, IgPostRow[]> = {};
  for (const artist of ARTISTS) {
    igPosts[artist] = allPosts.filter((p) => p.artist === artist).slice(0, 6);
  }

  // ── Brand Collabs ───────────────────────────────────────────────────────────
  const brandCollabs =
    brandsRes.status === 'fulfilled' && !brandsRes.value.error
      ? brandsRes.value.data ?? []
      : [];

  return NextResponse.json({
    latestSnapshots: latestMap,
    snapshotHistory,
    igPosts,
    brandCollabs,
  });
}
