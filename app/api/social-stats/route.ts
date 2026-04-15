import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdmin } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_STATS = {
  ig_followers: 10832,
  x_followers: 5412,
  tiktok_followers: 8261,
  community_members: 2847,
  posts_today: 156,
  hashtag_uses: 4230,
  avg_engagement_rate: 4.6,
  countries_reached: 6,
};

const DEFAULT_FOLLOWER_HISTORY = [
  { month: 'Sep', namtan_ig: 2100, film_ig: 1800, namtan_x: 980,  film_x: 850  },
  { month: 'Oct', namtan_ig: 2400, film_ig: 2000, namtan_x: 1100, film_x: 920  },
  { month: 'Nov', namtan_ig: 2900, film_ig: 2300, namtan_x: 1350, film_x: 1050 },
  { month: 'Dec', namtan_ig: 3500, film_ig: 2800, namtan_x: 1600, film_x: 1200 },
  { month: 'Jan', namtan_ig: 4200, film_ig: 3400, namtan_x: 2000, film_x: 1500 },
  { month: 'Feb', namtan_ig: 5100, film_ig: 4100, namtan_x: 2500, film_x: 1900 },
  { month: 'Mar', namtan_ig: 6000, film_ig: 4800, namtan_x: 3100, film_x: 2300 },
];

const DEFAULT_ENGAGEMENT = [
  { platform: 'IG',     namtan: 4.2, film: 3.8 },
  { platform: 'X',      namtan: 5.1, film: 4.6 },
  { platform: 'TikTok', namtan: 7.8, film: 6.5 },
  { platform: 'FB',     namtan: 2.1, film: 1.8 },
  { platform: 'YT',     namtan: 3.5, film: 3.2 },
];

const DEFAULT_COUNTRIES = [
  { name: 'Thailand',    value: 45, color: '#6cbfd0' },
  { name: 'China',       value: 20, color: '#fbdf74' },
  { name: 'Philippines', value: 12, color: '#66BB6A' },
  { name: 'Indonesia',   value: 8,  color: '#EF5350' },
  { name: 'Japan',       value: 6,  color: '#AB47BC' },
  { name: 'Others',      value: 9,  color: '#78909C' },
];

export async function GET(request: NextRequest) {
  const full = request.nextUrl.searchParams.get('full') === 'true';

  try {
    const { data: statsRow, error } = await supabase
      .from('social_stats')
      .select('*')
      .eq('id', 1)
      .single();

    const stats = error || !statsRow ? DEFAULT_STATS : statsRow;

    if (!full) {
      return NextResponse.json(stats);
    }

    // Fetch all chart data tables in parallel; fall back to defaults on any error
    const [historyRes, engagementRes, countriesRes] = await Promise.allSettled([
      supabase
        .from('follower_history')
        .select('month, namtan_ig, film_ig, namtan_x, film_x')
        .order('year', { ascending: true })
        .order('month_order', { ascending: true }),
      supabase
        .from('engagement_stats')
        .select('platform, namtan, film')
        .order('id', { ascending: true }),
      supabase
        .from('fan_countries')
        .select('country, percentage, color')
        .order('sort_order', { ascending: true }),
    ]);

    const followerHistory =
      historyRes.status === 'fulfilled' && !historyRes.value.error && historyRes.value.data?.length
        ? historyRes.value.data
        : DEFAULT_FOLLOWER_HISTORY;

    const engagementData =
      engagementRes.status === 'fulfilled' && !engagementRes.value.error && engagementRes.value.data?.length
        ? engagementRes.value.data
        : DEFAULT_ENGAGEMENT;

    const fanCountries =
      countriesRes.status === 'fulfilled' && !countriesRes.value.error && countriesRes.value.data?.length
        ? countriesRes.value.data.map((r: any) => ({ name: r.country, value: r.percentage, color: r.color }))
        : DEFAULT_COUNTRIES;

    return NextResponse.json({ stats, followerHistory, engagementData, fanCountries });
  } catch {
    if (!full) return NextResponse.json(DEFAULT_STATS);
    return NextResponse.json({
      stats: DEFAULT_STATS,
      followerHistory: DEFAULT_FOLLOWER_HISTORY,
      engagementData: DEFAULT_ENGAGEMENT,
      fanCountries: DEFAULT_COUNTRIES,
    });
  }
}


export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate integer fields
    const intFields = ['ig_followers', 'x_followers', 'tiktok_followers', 'community_members', 'posts_today', 'hashtag_uses', 'countries_reached'] as const;
    for (const field of intFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'number' || !Number.isFinite(body[field]) || body[field] < 0 || !Number.isInteger(body[field])) {
          return NextResponse.json({ error: `Invalid value for ${field}: must be a non-negative integer` }, { status: 400 });
        }
      }
    }
    if (body.avg_engagement_rate !== undefined) {
      if (typeof body.avg_engagement_rate !== 'number' || !Number.isFinite(body.avg_engagement_rate) || body.avg_engagement_rate < 0 || body.avg_engagement_rate > 100) {
        return NextResponse.json({ error: 'Invalid avg_engagement_rate: must be between 0 and 100' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('social_stats')
      .update({
        ig_followers: body.ig_followers,
        x_followers: body.x_followers,
        tiktok_followers: body.tiktok_followers,
        community_members: body.community_members,
        posts_today: body.posts_today,
        hashtag_uses: body.hashtag_uses,
        avg_engagement_rate: body.avg_engagement_rate,
        countries_reached: body.countries_reached,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error updating social stats:', error.message);
    return NextResponse.json({ error: 'Failed to update social stats' }, { status: 500 });
  }
}
