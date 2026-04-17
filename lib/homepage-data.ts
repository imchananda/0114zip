import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const db = createClient(supabaseUrl, supabaseKey);

const ARTISTS = ['namtan', 'film', 'luna'] as const;
type Artist = (typeof ARTISTS)[number];

// ── Exported types for component initial props ─────────────────────────────────

export interface HomeHeroSlide {
  id: string;
  title: string | null;
  title_thai: string | null;
  subtitle: string | null;
  subtitle_thai: string | null;
  image: string;
  link: string | null;
  sort_order: number;
  enabled: boolean;
}

export interface HomeIgPost { artist: Artist; emv: number; post_date: string }
export interface HomeBrandCollab { artists: string[] }

export interface HomeEngData {
  latestSnapshots: Record<string, Record<string, number>>;
  snapshotHistory: Record<string, unknown>[];
  igPosts:         Record<string, HomeIgPost[]>;
  brandCollabs:    HomeBrandCollab[];
}

export interface HomeArtistProfile { id: string; photo_url?: string | null }
export interface HomeFanCountry    { name: string; value: number; color: string }

export interface HomeContentItem {
  id: string;
  title: string;
  title_thai?: string;
  year?: number;
  content_type: string;
  actors: string[];
  image?: string | null;
  links?: { platform: string; url: string }[];
}

export interface HomeScheduleEvent {
  id: string;
  title: string;
  title_thai?: string;
  event_type: string;
  date: string;
  venue?: string;
  actors: string[];
  link?: string;
}

export interface HomeMediaPost {
  id: string;
  event_id: string | null;
  platform: string;
  title: string | null;
  caption: string | null;
  post_url: string;
  thumbnail: string | null;
  artist: string;
  post_date: string;
  views: number; likes: number; comments: number; shares: number; saves: number;
  goal_views: number; goal_likes: number; goal_comments: number; goal_shares: number; goal_saves: number;
  hashtags: string[];
  is_focus: boolean;
  is_visible: boolean;
}

export interface HomeMediaEvent {
  id: string;
  title: string;
  hashtags: string[];
  is_active: boolean;
  media_posts: HomeMediaPost[];
}

export interface HomeChallenge {
  id: string;
  title: string;
  description: string;
  type: string;
  participants: number;
  daysLeft: number;
  color: string;
  emoji: string;
}

export interface HomePrize {
  id: string;
  title: string;
  description: string;
  value: string;
  deadline: string;
  status: 'open' | 'closed' | 'announced';
  emoji: string;
}

export interface HomeBrand {
  id: number;
  artists: string[];
  brand_name: string;
  brand_logo: string | null;
  category: string | null;
  collab_type: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  media_items: { type: string; title: string; url?: string }[] | null;
}

export interface HomePageData {
  heroSlides:         HomeHeroSlide[];
  engData:            HomeEngData;
  profiles:           Record<string, HomeArtistProfile>;
  fanCountries:       HomeFanCountry[];
  featuredWork:       HomeContentItem | null;
  ntSeries:           number | null;
  flSeries:           number | null;
  scheduleEvents:     HomeScheduleEvent[];
  brands:             HomeBrand[];
  brandYears:         number[];
  brandSectionImages: Record<string, string>;
  brandProfileImages: Record<string, string>;
  mediaEvents:        HomeMediaEvent[];
  challenges:         HomeChallenge[];
  prizes:             HomePrize[];
}

// ── Server-side data fetch for the homepage ────────────────────────────────────
// All Supabase queries fire in parallel; individual failures fall back to safe
// defaults so a single failing table never breaks the page.
export async function fetchHomeData(): Promise<HomePageData> {
  const now = new Date();
  now.setHours(now.getHours() + 7); // rough GMT+7 offset
  const nowStr = now.toISOString().slice(0, 16).replace('T', ' '); // 'YYYY-MM-DD HH:mm'

  const [
    heroSlidesRes,
    snapshotsRes,
    igPostsRes,
    brandCollabsRes,
    profilesRes,
    fanCountriesRes,
    featuredWorkRes,
    ntSeriesRes,
    flSeriesRes,
    scheduleRes,
    brandSettingsRes,
    mediaEventsRes,
    challengesRes,
    prizesRes,
  ] = await Promise.allSettled([
    db.from('hero_slides').select('*').eq('enabled', true).order('sort_order'),
    db
      .from('artist_follower_snapshots')
      .select('*')
      .order('recorded_date', { ascending: true }),
    db
      .from('ig_posts')
      .select('artist, emv, post_date')
      .order('post_date', { ascending: false }),
    db
      .from('brand_collaborations')
      .select(
        'id, artists, brand_name, brand_logo, category, collab_type, start_date, end_date, description, media_items',
      )
      .eq('visible', true)
      .order('start_date', { ascending: false }),
    db.from('artist_profiles').select('id, photo_url').order('id'),
    db
      .from('fan_countries')
      .select('country, percentage, color')
      .order('sort_order', { ascending: true }),
    db
      .from('content_items')
      .select('id, title, title_thai, year, content_type, actors, image, links')
      .eq('visible', true)
      .eq('featured', true)
      .order('sort_order')
      .limit(1),
    db
      .from('content_items')
      .select('id', { count: 'exact', head: true })
      .eq('visible', true)
      .eq('content_type', 'series')
      .contains('actors', ['namtan']),
    db
      .from('content_items')
      .select('id', { count: 'exact', head: true })
      .eq('visible', true)
      .eq('content_type', 'series')
      .contains('actors', ['film']),
    db
      .from('content_items')
      .select('id, title, title_thai, content_type, date, venue, actors, link')
      .eq('content_type', 'event')
      .eq('visible', true)
      .gte('date', nowStr)
      .order('date', { ascending: true })
      .limit(10),
    db.from('site_settings').select('value').eq('key', 'brands_section_images').single(),
    db
      .from('media_events')
      .select('id, title, hashtags, is_active, media_posts(*)')
      .eq('is_active', true)
      .order('start_date', { ascending: false, nullsFirst: true }),
    db
      .from('challenges')
      .select('id, title, description, type, end_date, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3),
    db
      .from('prize_draws')
      .select('id, title_th, title_en, description, total_prizes, end_at, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  // ── Hero slides ─────────────────────────────────────────────────────────────
  const heroSlides: HomeHeroSlide[] =
    heroSlidesRes.status === 'fulfilled' && !heroSlidesRes.value.error
      ? (heroSlidesRes.value.data as HomeHeroSlide[]) ?? []
      : [];

  // ── Engagement: compute latestSnapshots + snapshotHistory ───────────────────
  const allSnapshots: any[] =
    snapshotsRes.status === 'fulfilled' && !snapshotsRes.value.error
      ? snapshotsRes.value.data ?? []
      : [];

  const latestMap: Record<string, Record<string, number>> = {};
  for (const a of ARTISTS) latestMap[a] = {};
  for (const row of allSnapshots) {
    if (!latestMap[row.artist]) latestMap[row.artist] = {};
    latestMap[row.artist][row.platform] = row.followers;
  }

  const historyByDate: Record<string, Record<string, number | string>> = {};
  for (const row of allSnapshots) {
    const month = (row.recorded_date as string).substring(0, 7);
    if (!historyByDate[month]) historyByDate[month] = { date: month };
    const key = `${row.artist}_${row.platform}`;
    const existing = historyByDate[month][key] as number | undefined;
    if (existing === undefined || row.followers > existing) {
      historyByDate[month][key] = row.followers;
    }
  }

  // Fallback to legacy follower_history table if no new snapshot data
  const hasNewData = ARTISTS.some(a => allSnapshots.some((s: any) => s.artist === a));
  if (!hasNewData) {
    const { data: old } = await db
      .from('follower_history')
      .select(
        'month, month_order, year, namtan_ig, film_ig, namtan_x, film_x, namtan_tiktok, film_tiktok',
      )
      .order('year', { ascending: true })
      .order('month_order', { ascending: true });
    if (old && old.length > 0) {
      for (const row of old) {
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
      const last = old[old.length - 1];
      latestMap['namtan'] = { ig: last.namtan_ig ?? 0, x: last.namtan_x ?? 0, tiktok: last.namtan_tiktok ?? 0 };
      latestMap['film']   = { ig: last.film_ig   ?? 0, x: last.film_x   ?? 0, tiktok: last.film_tiktok   ?? 0 };
    }
  }

  const snapshotHistory = Object.values(historyByDate).sort(
    (a, b) => (a.date as string).localeCompare(b.date as string),
  );

  const allPosts: any[] =
    igPostsRes.status === 'fulfilled' && !igPostsRes.value.error
      ? igPostsRes.value.data ?? []
      : [];
  const igPosts: Record<string, HomeIgPost[]> = {};
  for (const a of ARTISTS) {
    igPosts[a] = allPosts.filter((p: any) => p.artist === a).slice(0, 6);
  }

  const brandCollabsRaw: any[] =
    brandCollabsRes.status === 'fulfilled' && !brandCollabsRes.value.error
      ? brandCollabsRes.value.data ?? []
      : [];

  const engData: HomeEngData = {
    latestSnapshots: latestMap,
    snapshotHistory,
    igPosts,
    brandCollabs: brandCollabsRaw,
  };

  // ── Artist profiles ─────────────────────────────────────────────────────────
  const profilesList: HomeArtistProfile[] =
    profilesRes.status === 'fulfilled' && !profilesRes.value.error
      ? (profilesRes.value.data ?? []) as HomeArtistProfile[]
      : [];
  const profiles: Record<string, HomeArtistProfile> = {};
  profilesList.forEach(p => { profiles[p.id] = p; });

  // ── Fan countries ───────────────────────────────────────────────────────────
  const fanCountriesRaw: any[] =
    fanCountriesRes.status === 'fulfilled' && !fanCountriesRes.value.error
      ? fanCountriesRes.value.data ?? []
      : [];
  const fanCountries: HomeFanCountry[] = fanCountriesRaw.map(r => ({
    name: r.country, value: r.percentage, color: r.color,
  }));

  // ── Featured work ───────────────────────────────────────────────────────────
  const featuredWork: HomeContentItem | null =
    featuredWorkRes.status === 'fulfilled' && !featuredWorkRes.value.error
      ? ((featuredWorkRes.value.data ?? [])[0] as HomeContentItem ?? null)
      : null;

  // ── Series counts ───────────────────────────────────────────────────────────
  const ntSeries: number | null =
    ntSeriesRes.status === 'fulfilled' && !ntSeriesRes.value.error
      ? (ntSeriesRes.value.count ?? null)
      : null;
  const flSeries: number | null =
    flSeriesRes.status === 'fulfilled' && !flSeriesRes.value.error
      ? (flSeriesRes.value.count ?? null)
      : null;

  // ── Schedule events ─────────────────────────────────────────────────────────
  const scheduleRaw: any[] =
    scheduleRes.status === 'fulfilled' && !scheduleRes.value.error
      ? scheduleRes.value.data ?? []
      : [];
  const scheduleEvents: HomeScheduleEvent[] = scheduleRaw.map(r => ({
    id:         r.id,
    title:      r.title,
    title_thai: r.title_thai,
    event_type: r.content_type ?? 'event',
    date:       r.date,
    venue:      r.venue,
    actors:     r.actors ?? [],
    link:       r.link,
  }));

  // ── Brands ──────────────────────────────────────────────────────────────────
  const brands: HomeBrand[] = brandCollabsRaw as HomeBrand[];
  const brandYears = Array.from(
    new Set(
      brands
        .filter(b => b.start_date)
        .map(b => new Date(b.start_date!).getFullYear()),
    ),
  ).sort((a, b) => b - a);

  const brandSectionImages: Record<string, string> = {};
  if (brandSettingsRes.status === 'fulfilled') {
    // .single() returns { data, error } — error may be PGRST116 if row not found
    const val = (brandSettingsRes.value as any).data?.value;
    if (val && typeof val === 'object') Object.assign(brandSectionImages, val);
  }

  const brandProfileImages: Record<string, string> = {};
  profilesList.forEach(p => {
    if ((p.id === 'namtan' || p.id === 'film') && p.photo_url) {
      brandProfileImages[p.id] = p.photo_url;
    }
  });

  // ── Media events ────────────────────────────────────────────────────────────
  const mediaEvents: HomeMediaEvent[] =
    mediaEventsRes.status === 'fulfilled' && !mediaEventsRes.value.error
      ? (mediaEventsRes.value.data as HomeMediaEvent[]) ?? []
      : [];

  // ── Challenges ──────────────────────────────────────────────────────────────
  const CHALLENGE_COLORS = ['#6cbfd0', '#fbdf74', '#a78bfa', '#f87171', '#34d399'];
  const CHALLENGE_EMOJI: Record<string, string> = { quiz: '🎬', art: '🎨', photo: '📷', trivia: '🧠' };
  const challengesRaw: any[] =
    challengesRes.status === 'fulfilled' && !challengesRes.value.error
      ? challengesRes.value.data ?? []
      : [];
  const today = Date.now();
  const challenges: HomeChallenge[] = challengesRaw.map((r, i) => ({
    id:           r.id,
    title:        r.title,
    description:  r.description ?? '',
    type:         r.type ?? 'quiz',
    participants: 0,
    daysLeft:     r.end_date ? Math.max(0, Math.ceil((new Date(r.end_date).getTime() - today) / 86_400_000)) : 0,
    color:        CHALLENGE_COLORS[i % CHALLENGE_COLORS.length],
    emoji:        CHALLENGE_EMOJI[r.type?.toLowerCase()] ?? '🎮',
  }));

  // ── Prizes ──────────────────────────────────────────────────────────────────
  const prizesRaw: any[] =
    prizesRes.status === 'fulfilled' && !prizesRes.value.error
      ? prizesRes.value.data ?? []
      : [];
  const prizes: HomePrize[] = prizesRaw.map(r => ({
    id:          r.id,
    title:       r.title_th,
    description: r.description ?? '',
    value:       `${r.total_prizes ?? 1} รางวัล`,
    deadline:    r.end_at
      ? new Date(r.end_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'ไม่กำหนด',
    status:      r.is_active ? 'open' : 'closed',
    emoji:       '🎁',
  }));

  return {
    heroSlides,
    engData,
    profiles,
    fanCountries,
    featuredWork,
    ntSeries,
    flSeries,
    scheduleEvents,
    brands,
    brandYears,
    brandSectionImages,
    brandProfileImages,
    mediaEvents,
    challenges,
    prizes,
  };
}
