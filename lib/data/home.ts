import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { HeroBannerConfig, HomeHeroSlide } from '../homepage-data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const db = createClient<Database>(supabaseUrl, supabaseKey);

const nowStr = () => {
  const now = new Date();
  now.setHours(now.getHours() + 7);
  return now.toISOString().slice(0, 16).replace('T', ' ');
};

const REVALIDATE_TIME = 300; // 5 minutes

export const fetchCoreSettings = unstable_cache(
  async () => {
    const siteSettingsRes = await db.from('site_settings').select('key, value');
    const settings: Record<string, any> = {};
    if (siteSettingsRes.data) {
      siteSettingsRes.data.forEach((r) => { settings[r.key] = r.value; });
    }

    const defaultHeroConfig: HeroBannerConfig = { type: 'cinematic', showScrollHint: true };
    const heroBannerConfig = (settings.heroBanner as HeroBannerConfig) || defaultHeroConfig;
    
    const rawConfig = (settings.homeSections as Record<string, any>) ?? {};
    const homepageConfig = {
        about:      { enabled: true, order: 1 },
        content:    { enabled: true, order: 2 },
        schedule:   { enabled: true, order: 3 },
        challenges: { enabled: true, order: 4 },
        stats:      { enabled: true, order: 5 },
        brands:     { enabled: true, order: 6 },
        profile:    { enabled: true, order: 7 },
        fashion:    { enabled: true, order: 8 },
        timeline:   { enabled: true, order: 9 },
        mediaTags:  { enabled: true, order: 10 },
        awards:     { enabled: true, order: 11 },
        prizes:     { enabled: true, order: 12 },
    };

    for (const [key, val] of Object.entries(rawConfig)) {
        if (typeof val === 'boolean') {
          (homepageConfig as any)[key] = { ...((homepageConfig as any)[key] ?? { order: 50 }), enabled: val };
        } else if (val && typeof val === 'object' && 'enabled' in val) {
          (homepageConfig as any)[key] = { ...((homepageConfig as any)[key] ?? { order: 50 }), ...val };
        }
    }

    return {
      homepageConfig,
      heroBannerConfig,
      brandSectionImages: (settings.brands_section_images as Record<string, string>) || {}
    };
  },
  ['home-core-settings'],
  { revalidate: REVALIDATE_TIME, tags: ['settings'] }
);

export const fetchSeoSettings = unstable_cache(
  async () => {
    const { data } = await db.from('site_settings').select('value').eq('key', 'seo').single();
    return data?.value as { title?: string; description?: string; ogImage?: string } | null;
  },
  ['home-seo-settings'],
  { revalidate: REVALIDATE_TIME, tags: ['settings'] }
);

export const fetchHeroSlides = unstable_cache(
  async () => {
    const { data } = await db.from('hero_slides').select('*').eq('enabled', true).order('sort_order');
    return (data as HomeHeroSlide[]) ?? [];
  },
  ['home-hero-slides'],
  { revalidate: REVALIDATE_TIME, tags: ['hero_slides'] }
);

export const fetchProfiles = unstable_cache(
  async () => {
    const { data } = await db.from('artist_profiles').select('*').order('id');
    const profilesMap: Record<string, any> = {};
    (data ?? []).forEach((p: any) => { profilesMap[p.id] = p; });
    return profilesMap;
  },
  ['home-profiles'],
  { revalidate: REVALIDATE_TIME, tags: ['artist_profiles'] }
);

export const fetchLiveDashboardStats = unstable_cache(
  async () => {
    const [snapshots, igPosts, fanCountries, featuredSeries, featuredMusic, ntSeries, flSeries] = await Promise.all([
      db.from('artist_follower_snapshots').select('*').order('recorded_date', { ascending: true }),
      db.from('ig_posts').select('artist, emv, post_date').order('post_date', { ascending: false }),
      db.from('fan_countries').select('country, percentage, color').order('sort_order', { ascending: true }),
      db.from('content_items').select('*').eq('visible', true).eq('show_on_live_dashboard', true).eq('content_type', 'series').limit(1),
      db.from('content_items').select('*').eq('visible', true).eq('show_on_live_dashboard', true).eq('content_type', 'music').limit(1),
      db.from('content_items').select('id', { count: 'exact', head: true }).eq('visible', true).eq('content_type', 'series').contains('actors', ['namtan']),
      db.from('content_items').select('id', { count: 'exact', head: true }).eq('visible', true).eq('content_type', 'series').contains('actors', ['film']),
    ]);

    return {
      snapshots: snapshots.data ?? [],
      igPosts: igPosts.data ?? [],
      fanCountries: fanCountries.data ?? [],
      featuredSeries: featuredSeries.data?.[0] ?? null,
      featuredMusic: featuredMusic.data?.[0] ?? null,
      ntSeries: ntSeries.count ?? null,
      flSeries: flSeries.count ?? null
    };
  },
  ['home-live-dashboard'],
  { revalidate: REVALIDATE_TIME, tags: ['artist_follower_snapshots', 'ig_posts', 'fan_countries', 'content_items'] }
);

export const fetchBrands = unstable_cache(
  async () => {
    const { data } = await db.from('brand_collaborations').select('*').eq('visible', true).order('start_date', { ascending: false });
    return data ?? [];
  },
  ['home-brands'],
  { revalidate: REVALIDATE_TIME, tags: ['brand_collaborations'] }
);

export const fetchSchedule = unstable_cache(
  async () => {
    const { data } = await db.from('content_items').select('*').eq('content_type', 'event').eq('visible', true).gte('date', nowStr()).order('date', { ascending: true }).limit(10);
    return data ?? [];
  },
  ['home-schedule'],
  { revalidate: 60, tags: ['content_items'] } // 1 minute for schedule
);

export const fetchContent = unstable_cache(
  async () => {
    const { data } = await db.from('content_items').select('*').eq('visible', true).order('year', { ascending: false }).order('sort_order', { ascending: true });
    return data ?? [];
  },
  ['home-content'],
  { revalidate: REVALIDATE_TIME, tags: ['content_items'] }
);

export const fetchFashion = unstable_cache(
  async () => {
    const { data } = await db.from('fashion_events').select('*').eq('visible', true).order('sort_order', { ascending: true }).order('event_date', { ascending: false, nullsFirst: false });
    return data ?? [];
  },
  ['home-fashion'],
  { revalidate: REVALIDATE_TIME, tags: ['fashion_events'] }
);

export const fetchTimeline = unstable_cache(
  async () => {
    const { data } = await db.from('timeline_items').select('*').eq('visible', true).order('year', { ascending: false }).order('sort_order', { ascending: true });
    return data ?? [];
  },
  ['home-timeline'],
  { revalidate: REVALIDATE_TIME, tags: ['timeline_items'] }
);

export const fetchMediaTags = unstable_cache(
  async () => {
    const { data } = await db.from('media_events').select('*, media_posts(*)').eq('is_active', true).order('start_date', { ascending: false, nullsFirst: true });
    return data ?? [];
  },
  ['home-media-tags'],
  { revalidate: REVALIDATE_TIME, tags: ['media_events', 'media_posts'] }
);

export const fetchChallenges = unstable_cache(
  async () => {
    const { data } = await db.from('challenges').select('*').eq('is_active', true).order('created_at', { ascending: false });
    return data ?? [];
  },
  ['home-challenges'],
  { revalidate: REVALIDATE_TIME, tags: ['challenges'] }
);

export const fetchPrizes = unstable_cache(
  async () => {
    const { data } = await db.from('prize_draws').select('*').eq('is_active', true).order('created_at', { ascending: false });
    return data ?? [];
  },
  ['home-prizes'],
  { revalidate: REVALIDATE_TIME, tags: ['prize_draws'] }
);
