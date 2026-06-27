import { Suspense } from 'react';
import { Metadata } from 'next';
import { HomePageClient } from './HomePageClient';
import { SectionSkeleton } from '@/components/ui/SectionSkeleton';

import { AboutSection } from '@/components/sections/AboutSection';
import { LiveDashboard } from '@/components/dashboard/LiveDashboard';
import { BrandsSection } from '@/components/sections/BrandsSection';
import { SchedulePreview } from '@/components/sections/SchedulePreview';
import { ContentSection } from '@/components/content/ContentSection';
import { FashionSection } from '@/components/sections/FashionSection';
import { AwardsPreview } from '@/components/sections/AwardsPreview';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { MediaTagsSection } from '@/components/sections/MediaTagsSection';
import { ChallengesSection } from '@/components/sections/ChallengesSection';
import { PrizeSection } from '@/components/sections/PrizeSection';
import { ProfileSection } from '@/components/sections/ProfileSection';

import {
  fetchCoreSettings,
  fetchHeroSlides,
  fetchProfiles,
  fetchLiveDashboardStats,
  fetchBrands,
  fetchSchedule,
  fetchContent,
  fetchAwards,
  fetchAwardCount,
  fetchFashion,
  fetchTimeline,
  fetchMediaTags,
  fetchChallenges,
  fetchPrizes,
  fetchSeoSettings,
} from '@/lib/data/home';

import {
  normalizeEngData,
  normalizeTimelineItems,
  normalizeScheduleEvents,
  normalizeChallenges,
  normalizePrizes,
  normalizeContentItems,
  normalizeMediaEvents,
} from '@/lib/transformers/home';
import { normalizeHomeAwards } from '@/lib/awards-preview';
import type {
  HomeBrand,
  HomeContentItem,
  HomeEngData,
  HomeFashionEvent,
  HomeIgPost,
  HomeMediaEvent,
  HomeScheduleEvent,
  HomeTimelineItem,
} from '@/lib/homepage-data';
import type { ContentDbItem, FanCountry } from '@/components/dashboard/LiveDashboardTypes';

type SnapshotRow = { artist: string; platform: string; followers: number; recorded_date: string };
type BrandMediaItem = { type?: unknown; title?: unknown; url?: unknown };
type ProfileImageRow = { photo_url?: string | null };

interface SharedProps {
  settings: Awaited<ReturnType<typeof fetchCoreSettings>>;
  profiles: Awaited<ReturnType<typeof fetchProfiles>>;
}

async function AboutServer({ settings }: { settings: SharedProps['settings'] }) {
  const [stats, awardCount] = await Promise.all([
    fetchLiveDashboardStats(),
    fetchAwardCount()
  ]);
  return (
    <AboutSection
      ntWorks={stats.ntSeries || 0}
      flWorks={stats.flSeries || 0}
      totalAwards={awardCount}
      config={settings.homepageConfig.about}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
      customSettings={settings.aboutCustomSettings}
    />
  );
}

async function StatsServer({
  settings,
  profiles,
}: {
  settings: SharedProps['settings'];
  profiles: SharedProps['profiles'];
}) {
  const [stats, brands] = await Promise.all([
    fetchLiveDashboardStats(),
    fetchBrands()
  ]);
  const engData: HomeEngData = {
    latestSnapshots: {},
    snapshotHistory: [],
    igPosts: { namtan: [], film: [], luna: [] },
    brandCollabs: (brands as HomeBrand[]).map((brand) => ({ artists: brand.artists }))
  };
  
  // Fill latestSnapshots
  const latestMap: Record<string, Record<string, number>> = { namtan: {}, film: {}, luna: {} };
  (stats.snapshots as SnapshotRow[]).forEach((row) => { latestMap[row.artist][row.platform] = row.followers; });
  
  // Fill snapshotHistory
  const historyByDate: Record<string, Record<string, number | string>> = {};
  (stats.snapshots as SnapshotRow[]).forEach((row) => {
    const month = row.recorded_date.substring(0, 7);
    if (!historyByDate[month]) historyByDate[month] = { date: month };
    const key = `${row.artist}_${row.platform}`;
    const existing = historyByDate[month][key] as number | undefined;
    if (existing === undefined || row.followers > existing) historyByDate[month][key] = row.followers;
  });
  engData.snapshotHistory = Object.values(historyByDate).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  
  // Fill igPosts
  const ARTISTS = ['namtan', 'film', 'luna'];
  ARTISTS.forEach(a => { engData.igPosts[a] = (stats.igPosts as HomeIgPost[]).filter((p) => p.artist === a).slice(0, 6); });
  engData.latestSnapshots = latestMap;

  return (
    <LiveDashboard
      initialEng={normalizeEngData(engData)}
      initialProfiles={profiles}
      initialFanCountries={(stats.fanCountries as Array<{ country: string; percentage: number | null; color: string | null }>).map((r) => ({
        name: r.country,
        value: r.percentage ?? 0,
        color: r.color ?? 'var(--namtan-teal)',
      } satisfies FanCountry))}
      initialFeaturedSeries={stats.featuredSeries as unknown as ContentDbItem | null}
      initialFeaturedMusic={stats.featuredMusic as unknown as ContentDbItem | null}
      initialNtSeries={stats.ntSeries}
      initialFlSeries={stats.flSeries}
      config={settings.homepageConfig.stats}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
    />
  );
}

async function BrandsServer({
  settings,
  profiles,
}: {
  settings: SharedProps['settings'];
  profiles: SharedProps['profiles'];
}) {
  const brandsRaw = await fetchBrands();
  const brands = brandsRaw as HomeBrand[];
  
  const brandYears = Array.from(new Set(brands.filter((b) => b.start_date).map((b) => new Date(b.start_date!).getFullYear()))).sort((a, b) => b - a);
  
  const normalizedBrands = brands.map((b) => ({
    ...b,
    media_items: Array.isArray(b.media_items)
      ? b.media_items
          .filter((item): item is BrandMediaItem => !!item && typeof item === 'object')
          .map((item) => ({
            type: typeof item.type === 'string' ? item.type : 'Other',
            title: typeof item.title === 'string' ? item.title : '',
            ...(typeof item.url === 'string' ? { url: item.url } : {}),
          }))
      : null,
  }));

  const profileImages: Record<string, string> = {};
  Object.entries(profiles as Record<string, ProfileImageRow>).forEach(([k, v]) => {
    profileImages[k] = v.photo_url || '';
  });

  return (
    <BrandsSection
      config={settings.homepageConfig.brands}
      initialBrands={normalizedBrands}
      initialYears={brandYears}
      initialSectionImages={settings.brandSectionImages}
      initialProfileImages={profileImages}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
    />
  );
}

async function ScheduleServer({ settings }: { settings: SharedProps['settings'] }) {
  const schedule = await fetchSchedule();
  return (
    <SchedulePreview
      config={settings.homepageConfig.schedule}
      initialEvents={normalizeScheduleEvents(schedule as unknown as HomeScheduleEvent[])}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
    />
  );
}

async function ContentServer({ settings }: { settings: SharedProps['settings'] }) {
  const content = await fetchContent();
  return (
    <ContentSection
      initialContent={normalizeContentItems(content as unknown as HomeContentItem[])}
      config={settings.homepageConfig.content}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
    />
  );
}

async function FashionHighlightServer({ settings }: { settings: SharedProps['settings'] }) {
  const [fashion, brandsRaw] = await Promise.all([
    fetchFashion(),
    fetchBrands()
  ]);
  return (
    <FashionSection
      events={fashion as HomeFashionEvent[]}
      brandLookup={brandsRaw as HomeBrand[]}
      config={settings.homepageConfig.fashionHighlight}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
      mode="highlight"
    />
  );
}

async function FashionServer({ settings }: { settings: SharedProps['settings'] }) {
  const [fashion, brandsRaw] = await Promise.all([
    fetchFashion(),
    fetchBrands()
  ]);
  return (
    <FashionSection
      events={fashion as HomeFashionEvent[]}
      brandLookup={brandsRaw as HomeBrand[]}
      config={settings.homepageConfig.fashion}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
      mode="main"
    />
  );
}

async function AwardsServer({ settings }: { settings: SharedProps['settings'] }) {
  const awards = await fetchAwards();
  return (
    <AwardsPreview
      initialAwards={normalizeHomeAwards(awards)}
      config={settings.homepageConfig.awards}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
    />
  );
}

async function TimelineServer({ settings }: { settings: SharedProps['settings'] }) {
  const timeline = await fetchTimeline();
  const timelineRows = (timeline as unknown as Array<HomeTimelineItem & { actors?: string[] }>).map((r) => ({
    id: r.id, year: r.year, title: r.title, title_thai: r.title_thai, description: r.description ?? '',
    category: r.category, actor: r.actors?.[0] ?? 'both', icon: r.icon ?? '✨', image: r.image
  }));
  return (
    <TimelineSection
      initialEvents={normalizeTimelineItems(timelineRows)}
      config={settings.homepageConfig.timeline}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
    />
  );
}

async function MediaTagsServer({ settings }: { settings: SharedProps['settings'] }) {
  const mediaTags = await fetchMediaTags();
  return (
    <MediaTagsSection
      initialEvents={normalizeMediaEvents(mediaTags as HomeMediaEvent[])}
      config={settings.homepageConfig.mediaTags}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
    />
  );
}

async function ChallengesServer({ settings }: { settings: SharedProps['settings'] }) {
  const challenges = await fetchChallenges();
  return (
    <ChallengesSection
      initialChallenges={normalizeChallenges(challenges)}
      config={settings.homepageConfig.challenges}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
    />
  );
}

async function PrizesServer({ settings }: { settings: SharedProps['settings'] }) {
  const prizes = await fetchPrizes();
  return (
    <PrizeSection
      initialPrizes={normalizePrizes(prizes)}
      config={settings.homepageConfig.prizes}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
    />
  );
}

async function ProfileServer({
  settings,
  profiles,
}: {
  settings: SharedProps['settings'];
  profiles: SharedProps['profiles'];
}) {
  const [stats, brands, content] = await Promise.all([
    fetchLiveDashboardStats(),
    fetchBrands(),
    fetchContent()
  ]);

  const engData: HomeEngData = {
    latestSnapshots: {},
    snapshotHistory: [],
    igPosts: { namtan: [], film: [], luna: [] },
    brandCollabs: (brands as HomeBrand[]).map((brand) => ({ artists: brand.artists }))
  };
  const latestMap: Record<string, Record<string, number>> = { namtan: {}, film: {}, luna: {} };
  (stats.snapshots as SnapshotRow[]).forEach((row) => { latestMap[row.artist][row.platform] = row.followers; });
  engData.latestSnapshots = latestMap;

  return (
    <ProfileSection
      profiles={profiles}
      engData={engData}
      ntWorksCount={stats.ntSeries}
      flWorksCount={stats.flSeries}
      allContent={content as unknown as HomeContentItem[]}
      config={settings.homepageConfig.profile}
      pageMotion={settings.pageMotion}
      pageTheme={settings.pageTheme}
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchSeoSettings();
  
  if (!seo || Object.keys(seo).length === 0) {
    return {};
  }

  return {
    ...(seo.title && { title: seo.title }),
    ...(seo.description && { description: seo.description }),
    openGraph: {
      ...(seo.title && { title: seo.title }),
      ...(seo.description && { description: seo.description }),
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      ...(seo.title && { title: seo.title }),
      ...(seo.description && { description: seo.description }),
      images: seo.ogImage ? [seo.ogImage] : undefined,
    }
  };
}

export default async function HomePage() {
  // Prefetch globally shared above-the-fold entities in parallel (Fast path)
  const [settings, heroSlides, profiles] = await Promise.all([
    fetchCoreSettings(),
    fetchHeroSlides(),
    fetchProfiles(),
  ]);

  const sections: Record<string, React.ReactNode> = {
    about: <Suspense fallback={<SectionSkeleton />}><AboutServer settings={settings} /></Suspense>,
    stats: <Suspense fallback={<SectionSkeleton />}><StatsServer settings={settings} profiles={profiles} /></Suspense>,
    brands: <Suspense fallback={<SectionSkeleton />}><BrandsServer settings={settings} profiles={profiles} /></Suspense>,
    schedule: <Suspense fallback={<SectionSkeleton />}><ScheduleServer settings={settings} /></Suspense>,
    content: <Suspense fallback={<SectionSkeleton />}><ContentServer settings={settings} /></Suspense>,
    fashionHighlight: <Suspense fallback={<SectionSkeleton />}><FashionHighlightServer settings={settings} /></Suspense>,
    fashion: <Suspense fallback={<SectionSkeleton />}><FashionServer settings={settings} /></Suspense>,
    awards: <Suspense fallback={<SectionSkeleton />}><AwardsServer settings={settings} /></Suspense>,
    timeline: <Suspense fallback={<SectionSkeleton />}><TimelineServer settings={settings} /></Suspense>,
    mediaTags: <Suspense fallback={<SectionSkeleton />}><MediaTagsServer settings={settings} /></Suspense>,
    challenges: <Suspense fallback={<SectionSkeleton />}><ChallengesServer settings={settings} /></Suspense>,
    prizes: <Suspense fallback={<SectionSkeleton />}><PrizesServer settings={settings} /></Suspense>,
    profile: <Suspense fallback={<SectionSkeleton />}><ProfileServer settings={settings} profiles={profiles} /></Suspense>,
  };

  return (
    <HomePageClient
      config={settings.homepageConfig}
      heroConfig={settings.heroBannerConfig}
      heroSlides={heroSlides}
      profiles={profiles}
      sections={sections}
      features={settings.features}
    />
  );
}
