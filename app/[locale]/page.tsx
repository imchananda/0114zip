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
type BrandsSectionConfig = { layout?: 'split' | 'full-grid'; theme?: 'dark' | 'light'; title?: string };
type ScheduleSectionConfig = { layout?: 'cards' | 'list'; theme?: 'light' | 'dark'; limit?: number; title?: string };

async function AboutServer() {
  const [stats, content, settings] = await Promise.all([fetchLiveDashboardStats(), fetchContent(), fetchCoreSettings()]);
  const contentRows = content as unknown as HomeContentItem[];
  const awardsItems = contentRows.filter((c) => c.content_type === 'award');
  return <AboutSection ntWorks={stats.ntSeries || 0} flWorks={stats.flSeries || 0} totalAwards={awardsItems.length} config={settings.homepageConfig.about} />;
}

async function StatsServer() {
  const [stats, profiles] = await Promise.all([fetchLiveDashboardStats(), fetchProfiles()]);
  const brands = await fetchBrands();
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
    />
  );
}

async function BrandsServer() {
  const [brandsRaw, settings, profiles] = await Promise.all([fetchBrands(), fetchCoreSettings(), fetchProfiles()]);
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
      config={settings.homepageConfig.brands as BrandsSectionConfig}
      initialBrands={normalizedBrands}
      initialYears={brandYears}
      initialSectionImages={settings.brandSectionImages}
      initialProfileImages={profileImages}
    />
  );
}

async function ScheduleServer() {
  const [schedule, settings] = await Promise.all([fetchSchedule(), fetchCoreSettings()]);
  return <SchedulePreview 
    config={settings.homepageConfig.schedule as ScheduleSectionConfig}
    initialEvents={normalizeScheduleEvents(schedule as unknown as HomeScheduleEvent[])} 
  />;
}

async function ContentServer() {
  const [content, settings] = await Promise.all([fetchContent(), fetchCoreSettings()]);
  return <ContentSection initialContent={normalizeContentItems(content as unknown as HomeContentItem[])} config={settings.homepageConfig.content} />;
}

async function FashionServer() {
  const [fashion, brands, settings] = await Promise.all([fetchFashion(), fetchBrands(), fetchCoreSettings()]);
  return <FashionSection events={fashion as HomeFashionEvent[]} brandLookup={brands as HomeBrand[]} config={settings.homepageConfig.fashion} />;
}

async function AwardsServer() {
  const [content, settings] = await Promise.all([fetchContent(), fetchCoreSettings()]);
  const awardsItems = (content as unknown as HomeContentItem[]).filter((c) => c.content_type === 'award');
  return <AwardsPreview initialAwards={awardsItems} config={settings.homepageConfig.awards} />;
}

async function TimelineServer() {
  const [timeline, settings] = await Promise.all([fetchTimeline(), fetchCoreSettings()]);
  const timelineRows = (timeline as unknown as Array<HomeTimelineItem & { actors?: string[] }>).map((r) => ({
    id: r.id, year: r.year, title: r.title, title_thai: r.title_thai, description: r.description ?? '',
    category: r.category, actor: r.actors?.[0] ?? 'both', icon: r.icon ?? '✨', image: r.image
  }));
  return <TimelineSection initialEvents={normalizeTimelineItems(timelineRows)} config={settings.homepageConfig.timeline} />;
}

async function MediaTagsServer() {
  const [mediaTags, settings] = await Promise.all([fetchMediaTags(), fetchCoreSettings()]);
  return <MediaTagsSection initialEvents={normalizeMediaEvents(mediaTags as HomeMediaEvent[])} config={settings.homepageConfig.mediaTags} />;
}

async function ChallengesServer() {
  const [challenges, settings] = await Promise.all([fetchChallenges(), fetchCoreSettings()]);
  return <ChallengesSection initialChallenges={normalizeChallenges(challenges)} config={settings.homepageConfig.challenges} />;
}

async function PrizesServer() {
  const [prizes, settings] = await Promise.all([fetchPrizes(), fetchCoreSettings()]);
  return <PrizeSection initialPrizes={normalizePrizes(prizes)} config={settings.homepageConfig.prizes} />;
}

async function ProfileServer() {
  const [profiles, stats, brands, content, settings] = await Promise.all([
    fetchProfiles(),
    fetchLiveDashboardStats(),
    fetchBrands(),
    fetchContent(),
    fetchCoreSettings()
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
  const [settings, heroSlides, profiles] = await Promise.all([
    fetchCoreSettings(),
    fetchHeroSlides(),
    fetchProfiles()
  ]);

  const sections: Record<string, React.ReactNode> = {
    about: <Suspense fallback={<SectionSkeleton />}><AboutServer /></Suspense>,
    stats: <Suspense fallback={<SectionSkeleton />}><StatsServer /></Suspense>,
    brands: <Suspense fallback={<SectionSkeleton />}><BrandsServer /></Suspense>,
    schedule: <Suspense fallback={<SectionSkeleton />}><ScheduleServer /></Suspense>,
    content: <Suspense fallback={<SectionSkeleton />}><ContentServer /></Suspense>,
    fashion: <Suspense fallback={<SectionSkeleton />}><FashionServer /></Suspense>,
    awards: <Suspense fallback={<SectionSkeleton />}><AwardsServer /></Suspense>,
    timeline: <Suspense fallback={<SectionSkeleton />}><TimelineServer /></Suspense>,
    mediaTags: <Suspense fallback={<SectionSkeleton />}><MediaTagsServer /></Suspense>,
    challenges: <Suspense fallback={<SectionSkeleton />}><ChallengesServer /></Suspense>,
    prizes: <Suspense fallback={<SectionSkeleton />}><PrizesServer /></Suspense>,
    profile: <Suspense fallback={<SectionSkeleton />}><ProfileServer /></Suspense>,
  };

  return (
    <HomePageClient
      config={settings.homepageConfig}
      heroConfig={settings.heroBannerConfig}
      heroSlides={heroSlides}
      profiles={profiles}
      sections={sections}
    />
  );
}
