import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import {
  normalizeHomepageSections,
  type HomepageSectionsConfig,
} from './homepage-sections';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const db = createClient<Database>(supabaseUrl, supabaseKey);

const ARTISTS = ['namtan', 'film', 'luna'] as const;
type Artist = (typeof ARTISTS)[number];

// ── Exported types for component initial props ─────────────────────────────────

export type HeroBannerType = 'cinematic' | 'video' | 'image' | 'slide';

export interface HeroBannerConfig {
  type: HeroBannerType;
  videoUrl?: string;
  imageUrl?: string;
  clickUrl?: string;
  showScrollHint?: boolean;
}

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
  theme: 'light' | 'dark' | 'both';
  view_state: 'both' | 'namtan' | 'film' | 'lunar';
}

export interface HomeIgPost { artist: Artist; emv: number; post_date: string }
export interface HomeBrandCollab { artists: string[] }

export interface HomeEngData {
  latestSnapshots: Record<string, Record<string, number>>;
  snapshotHistory: Record<string, unknown>[];
  igPosts:         Record<string, HomeIgPost[]>;
  brandCollabs:    HomeBrandCollab[];
}

export interface HomeArtistProfile {
  id: string;
  nickname: string;
  nickname_th?: string;
  full_name: string;
  full_name_th?: string;
  birth_date: string;
  birth_date_th?: string;
  birth_place?: string;
  birth_place_th?: string;
  education?: string;
  education_th?: string;
  tagline?: string;
  tagline_th?: string;
  description?: string;
  description_th?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  photo_url?: string | null;
}

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
  description?: string;
  award_name?: string;
  ceremony?: string;
  magazine_name?: string;
  issue?: string;
}

/** Fashion event row — matches `fashion_events` (admin: /admin/fashion) */
export interface HomeFashionEvent {
  id: string;
  event_name: string;
  title_thai: string | null;
  brands: string[];
  location: string | null;
  category: string;
  actors: string[];
  hashtag: string | null;
  engagement: number | null;
  emv: number | null;
  miv: number | null;
  event_date: string | null;
  image_url: string | null;
  look_count: number;
  in_highlight: boolean;
  sort_order: number;
  visible: boolean;
}

export interface HomeScheduleEvent {
  id: string;
  title: string;
  title_thai?: string;
  event_type: string;
  date: string;
  venue?: string;
  actors: string[];
  link: string | null;
}

export interface HomeMediaEvent {
  id: string;
  title: string;
  hashtags: string[];
  is_active: boolean;
  media_posts: unknown[];
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
  media_items: unknown[] | null;
}

type SiteSettingRow = { key: string; value: unknown };
type SnapshotRow = { artist: string; platform: string; followers: number; recorded_date: string };
type CountryRow = { country: string; percentage: number; color: string };
type ScheduleRow = {
  id: string;
  title: string;
  title_thai?: string;
  content_type?: string;
  date: string;
  venue?: string;
  actors?: string[];
  link: string | null;
};
type TimelineRow = {
  id: string;
  year: number;
  title: string;
  title_thai?: string;
  description?: string;
  category: string;
  actors?: string[];
  icon?: string;
  image?: string;
};

export interface HomeTimelineItem {
  id: string;
  year: number;
  title: string;
  title_thai?: string;
  description: string;
  category: string;
  actor: string;
  icon: string;
  image?: string;
}

export interface HomePageData {
  heroSlides:         HomeHeroSlide[];
  engData:            HomeEngData;
  profiles:           Record<string, HomeArtistProfile>;
  fanCountries:       HomeFanCountry[];
  featuredSeries:     HomeContentItem | null;
  featuredMusic:      HomeContentItem | null;
  ntSeries:           number | null;
  flSeries:           number | null;
  scheduleEvents:     HomeScheduleEvent[];
  brands:             HomeBrand[];
  brandYears:         number[];
  brandSectionImages: Record<string, string>;
  mediaEvents:        HomeMediaEvent[];
  challenges:         unknown[];
  prizes:             unknown[];
  timelineItems:      HomeTimelineItem[];
  fashionEvents:      HomeFashionEvent[];
  awardsItems:        HomeContentItem[];
  allContent:         HomeContentItem[];
  homepageConfig:     HomepageSectionsConfig;
  heroBannerConfig:   HeroBannerConfig;
}

// ── Server-side data fetch for the homepage ────────────────────────────────────
export async function fetchHomeData(): Promise<HomePageData> {
  const now = new Date();
  now.setHours(now.getHours() + 7);
  const nowStr = now.toISOString().slice(0, 16).replace('T', ' ');

  const siteSettingsRes = await db.from('site_settings').select('key, value');

  const settings: Record<string, unknown> = {};
  if (siteSettingsRes.data) {
    (siteSettingsRes.data as SiteSettingRow[]).forEach((r) => { settings[r.key] = r.value; });
  }

  const homepageConfig = normalizeHomepageSections(settings.homeSections);
  const isEnabled = (section: keyof typeof homepageConfig) => homepageConfig[section]?.enabled !== false;

  const needAbout = isEnabled('about');
  const needStats = isEnabled('stats');
  const needBrands = isEnabled('brands');
  const needProfile = isEnabled('profile');
  const needSchedule = isEnabled('schedule');
  const needContent = isEnabled('content');
  const needFashion = isEnabled('fashion');
  const needAwards = isEnabled('awards');
  const needTimeline = isEnabled('timeline');
  const needMediaTags = isEnabled('mediaTags');
  const needChallenges = isEnabled('challenges');
  const needPrizes = isEnabled('prizes');

  const needProfiles = needStats || needBrands || needProfile;
  const needAllContent = needContent || needAwards;

  const [
    heroSlidesRes,
    snapshotsResMaybe,
    igPostsResMaybe,
    brandCollabsResMaybe,
    profilesResMaybe,
    fanCountriesResMaybe,
    featuredSeriesResMaybe,
    featuredMusicResMaybe,
    ntSeriesResMaybe,
    flSeriesResMaybe,
    scheduleResMaybe,
    mediaEventsResMaybe,
    challengesResMaybe,
    prizesResMaybe,
    timelineResMaybe,
    allContentResMaybe,
    fashionEventsResMaybe,
  ] = await Promise.allSettled([
    db.from('hero_slides').select('*').eq('enabled', true).order('sort_order'),
    needStats ? db.from('artist_follower_snapshots').select('*').order('recorded_date', { ascending: true }) : Promise.resolve({ data: [] }),
    needStats ? db.from('ig_posts').select('artist, emv, post_date').order('post_date', { ascending: false }) : Promise.resolve({ data: [] }),
    (needStats || needBrands) ? db.from('brand_collaborations').select('*').eq('visible', true).order('start_date', { ascending: false }) : Promise.resolve({ data: [] }),
    needProfiles ? db.from('artist_profiles').select('*').order('id') : Promise.resolve({ data: [] }),
    needStats ? db.from('fan_countries').select('country, percentage, color').order('sort_order', { ascending: true }) : Promise.resolve({ data: [] }),
    needStats ? db.from('content_items').select('*').eq('visible', true).eq('show_on_live_dashboard', true).eq('content_type', 'series').limit(1) : Promise.resolve({ data: [] }),
    needStats ? db.from('content_items').select('*').eq('visible', true).eq('show_on_live_dashboard', true).eq('content_type', 'music').limit(1) : Promise.resolve({ data: [] }),
    (needStats || needAbout) ? db.from('content_items').select('id', { count: 'exact', head: true }).eq('visible', true).eq('content_type', 'series').contains('actors', ['namtan']) : Promise.resolve({ count: null }),
    (needStats || needAbout) ? db.from('content_items').select('id', { count: 'exact', head: true }).eq('visible', true).eq('content_type', 'series').contains('actors', ['film']) : Promise.resolve({ count: null }),
    needSchedule ? db.from('content_items').select('*').eq('content_type', 'event').eq('visible', true).gte('date', nowStr).order('date', { ascending: true }).limit(10) : Promise.resolve({ data: [] }),
    needMediaTags ? db.from('media_events').select('*, media_posts(*)').eq('is_active', true).order('start_date', { ascending: false, nullsFirst: true }) : Promise.resolve({ data: [] }),
    needChallenges ? db.from('challenges').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3) : Promise.resolve({ data: [] }),
    needPrizes ? db.from('prize_draws').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3) : Promise.resolve({ data: [] }),
    needTimeline ? db.from('timeline_items').select('*').eq('visible', true).order('year', { ascending: false }).order('sort_order', { ascending: true }) : Promise.resolve({ data: [] }),
    needAllContent ? db.from('content_items').select('*').eq('visible', true).order('year', { ascending: false }).order('sort_order', { ascending: true }) : Promise.resolve({ data: [] }),
    needFashion
      ? db
          .from('fashion_events')
          .select('*')
          .eq('visible', true)
          .order('sort_order', { ascending: true })
          .order('event_date', { ascending: false, nullsFirst: false })
      : Promise.resolve({ data: [] }),
  ]);

  const heroSlides = heroSlidesRes.status === 'fulfilled' ? (heroSlidesRes.value.data as HomeHeroSlide[] ?? []) : [];
  
  // Engagement
  const allSnapshots: SnapshotRow[] = snapshotsResMaybe.status === 'fulfilled' ? (snapshotsResMaybe.value.data as SnapshotRow[] ?? []) : [];
  const latestMap: Record<string, Record<string, number>> = { namtan: {}, film: {}, luna: {} };
  allSnapshots.forEach((row) => { latestMap[row.artist][row.platform] = row.followers; });

  const historyByDate: Record<string, Record<string, number | string>> = {};
  allSnapshots.forEach((row) => {
    const month = row.recorded_date.substring(0, 7);
    if (!historyByDate[month]) historyByDate[month] = { date: month };
    const key = `${row.artist}_${row.platform}`;
    const existing = historyByDate[month][key] as number | undefined;
    if (existing === undefined || row.followers > existing) historyByDate[month][key] = row.followers;
  });

  const snapshotHistory = Object.values(historyByDate).sort((a, b) => (a.date as string).localeCompare(b.date as string));
  const allPosts = igPostsResMaybe.status === 'fulfilled' ? ((igPostsResMaybe.value.data ?? []) as HomeIgPost[]) : [];
  const igPostsMap: Record<string, HomeIgPost[]> = { namtan: [], film: [], luna: [] };
  ARTISTS.forEach(a => { igPostsMap[a] = allPosts.filter((p) => p.artist === a).slice(0, 6); });

  const engData: HomeEngData = {
    latestSnapshots: latestMap,
    snapshotHistory,
    igPosts: igPostsMap,
    brandCollabs: brandCollabsResMaybe.status === 'fulfilled' ? (brandCollabsResMaybe.value.data as HomeBrandCollab[] ?? []) : [],
  };

  const profilesList = profilesResMaybe.status === 'fulfilled' ? (profilesResMaybe.value.data as HomeArtistProfile[] ?? []) : [];
  const profilesMap: Record<string, HomeArtistProfile> = {};
  profilesList.forEach(p => { profilesMap[p.id] = p; });

  const fanCountries = fanCountriesResMaybe.status === 'fulfilled'
    ? (fanCountriesResMaybe.value.data as CountryRow[] ?? []).map(r => ({ name: r.country, value: r.percentage, color: r.color }))
    : [];

  const featuredSeries = featuredSeriesResMaybe.status === 'fulfilled' ? (featuredSeriesResMaybe.value.data?.[0] as unknown as HomeContentItem ?? null) : null;
  const featuredMusic = featuredMusicResMaybe.status === 'fulfilled' ? (featuredMusicResMaybe.value.data?.[0] as unknown as HomeContentItem ?? null) : null;
  const ntSeries = ntSeriesResMaybe.status === 'fulfilled' ? (ntSeriesResMaybe.value.count ?? null) : null;
  const flSeries = flSeriesResMaybe.status === 'fulfilled' ? (flSeriesResMaybe.value.count ?? null) : null;

  const scheduleEvents = scheduleResMaybe.status === 'fulfilled'
    ? (scheduleResMaybe.value.data as ScheduleRow[] ?? []).map(r => ({
        id: r.id, title: r.title, title_thai: r.title_thai, event_type: r.content_type ?? 'event',
        date: r.date, venue: r.venue, actors: r.actors ?? [], link: r.link
      }))
    : [];

  const brands = engData.brandCollabs as unknown as HomeBrand[];
  const brandYears = Array.from(new Set(brands.filter(b => b.start_date).map(b => new Date(b.start_date!).getFullYear()))).sort((a, b) => b - a);

  const timelineItems = timelineResMaybe.status === 'fulfilled'
    ? (timelineResMaybe.value.data as TimelineRow[] ?? []).map(r => ({
        id: r.id, year: r.year, title: r.title, title_thai: r.title_thai, description: r.description ?? '',
        category: r.category, actor: r.actors?.[0] ?? 'both', icon: r.icon ?? '✨', image: r.image
      }))
    : [];

  const allContent = allContentResMaybe.status === 'fulfilled' ? (allContentResMaybe.value.data as HomeContentItem[] ?? []) : [];
  const fashionEvents = fashionEventsResMaybe.status === 'fulfilled'
    ? (fashionEventsResMaybe.value.data as HomeFashionEvent[] ?? [])
    : [];
  const awardsItems = allContent.filter(c => c.content_type === 'award').slice(0, 6);
  const defaultHeroConfig: HeroBannerConfig = { type: 'cinematic', showScrollHint: true };
  const heroBannerConfig = (settings.heroBanner as HeroBannerConfig) || defaultHeroConfig;

  return {
    heroSlides,
    engData,
    profiles: profilesMap,
    fanCountries,
    featuredSeries,
    featuredMusic,
    ntSeries,
    flSeries,
    scheduleEvents,
    brands,
    brandYears,
    brandSectionImages: (settings.brands_section_images as Record<string, string>) || {},
    mediaEvents: mediaEventsResMaybe.status === 'fulfilled' ? (mediaEventsResMaybe.value.data as HomeMediaEvent[] ?? []) : [],
    challenges: challengesResMaybe.status === 'fulfilled' ? (challengesResMaybe.value.data as unknown[] ?? []) : [],
    prizes: prizesResMaybe.status === 'fulfilled' ? (prizesResMaybe.value.data as unknown[] ?? []) : [],
    timelineItems,
    fashionEvents,
    awardsItems,
    allContent,
    homepageConfig,
    heroBannerConfig,
  };
}
