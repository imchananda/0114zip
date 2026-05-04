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

async function AboutServer() {
  const [stats, content, settings] = await Promise.all([fetchLiveDashboardStats(), fetchContent(), fetchCoreSettings()]);
  const awardsItems = content.filter((c: any) => c.content_type === 'award');
  return <AboutSection ntWorks={stats.ntSeries || 0} flWorks={stats.flSeries || 0} totalAwards={awardsItems.length} config={(settings.homepageConfig as any)?.about} />;
}

async function StatsServer() {
  const [stats, profiles] = await Promise.all([fetchLiveDashboardStats(), fetchProfiles()]);
  const brands = await fetchBrands();
  const engData: any = {
    latestSnapshots: {},
    snapshotHistory: [],
    igPosts: { namtan: [], film: [], luna: [] },
    brandCollabs: brands
  };
  
  // Fill latestSnapshots
  const latestMap: Record<string, Record<string, number>> = { namtan: {}, film: {}, luna: {} };
  stats.snapshots.forEach((row: any) => { latestMap[row.artist][row.platform] = row.followers; });
  
  // Fill snapshotHistory
  const historyByDate: Record<string, Record<string, number | string>> = {};
  stats.snapshots.forEach((row: any) => {
    const month = row.recorded_date.substring(0, 7);
    if (!historyByDate[month]) historyByDate[month] = { date: month };
    const key = `${row.artist}_${row.platform}`;
    const existing = historyByDate[month][key] as number | undefined;
    if (existing === undefined || row.followers > existing) historyByDate[month][key] = row.followers;
  });
  engData.snapshotHistory = Object.values(historyByDate).sort((a: any, b: any) => a.date.localeCompare(b.date));
  
  // Fill igPosts
  const ARTISTS = ['namtan', 'film', 'luna'];
  ARTISTS.forEach(a => { engData.igPosts[a] = stats.igPosts.filter((p: any) => p.artist === a).slice(0, 6); });
  engData.latestSnapshots = latestMap;

  return (
    <LiveDashboard
      initialEng={normalizeEngData(engData as any)}
      initialProfiles={profiles}
      initialFanCountries={stats.fanCountries as any}
      initialFeaturedSeries={stats.featuredSeries as any}
      initialFeaturedMusic={stats.featuredMusic as any}
      initialNtSeries={stats.ntSeries}
      initialFlSeries={stats.flSeries}
    />
  );
}

async function BrandsServer() {
  const [brandsRaw, settings, profiles] = await Promise.all([fetchBrands(), fetchCoreSettings(), fetchProfiles()]);
  
  const brandYears = Array.from(new Set(brandsRaw.filter((b: any) => b.start_date).map((b: any) => new Date(b.start_date!).getFullYear()))).sort((a, b) => b - a);
  
  const normalizedBrands = brandsRaw.map((b: any) => ({
    ...b,
    media_items: Array.isArray(b.media_items)
      ? b.media_items
          .filter((item: any) => !!item && typeof item === 'object')
          .map((item: any) => ({
            type: typeof item.type === 'string' ? item.type : 'Other',
            title: typeof item.title === 'string' ? item.title : '',
            ...(typeof item.url === 'string' ? { url: item.url } : {}),
          }))
      : null,
  }));

  const profileImages: Record<string, string> = {};
  Object.entries(profiles).forEach(([k, v]: [string, any]) => {
    profileImages[k] = v.photo_url || '';
  });

  return (
    <BrandsSection
      config={(settings.homepageConfig as any)?.brands}
      initialBrands={normalizedBrands as any}
      initialYears={brandYears}
      initialSectionImages={settings.brandSectionImages}
      initialProfileImages={profileImages}
    />
  );
}

async function ScheduleServer() {
  const [schedule, settings] = await Promise.all([fetchSchedule(), fetchCoreSettings()]);
  return <SchedulePreview 
    config={(settings.homepageConfig as any)?.schedule}
    initialEvents={normalizeScheduleEvents(schedule as any)} 
  />;
}

async function ContentServer() {
  const content = await fetchContent();
  return <ContentSection initialContent={normalizeContentItems(content as any)} />;
}

async function FashionServer() {
  const [fashion, brands, settings] = await Promise.all([fetchFashion(), fetchBrands(), fetchCoreSettings()]);
  return <FashionSection events={fashion as any} brandLookup={brands as any} config={(settings.homepageConfig as any)?.fashion} />;
}

async function AwardsServer() {
  const [content, settings] = await Promise.all([fetchContent(), fetchCoreSettings()]);
  const awardsItems = content.filter((c: any) => c.content_type === 'award');
  return <AwardsPreview initialAwards={awardsItems as any} config={(settings.homepageConfig as any)?.awards} />;
}

async function TimelineServer() {
  const [timeline, settings] = await Promise.all([fetchTimeline(), fetchCoreSettings()]);
  const timelineRows = timeline.map((r: any) => ({
    id: r.id, year: r.year, title: r.title, title_thai: r.title_thai, description: r.description ?? '',
    category: r.category, actor: r.actors?.[0] ?? 'both', icon: r.icon ?? '✨', image: r.image
  }));
  return <TimelineSection initialEvents={normalizeTimelineItems(timelineRows as any)} config={(settings.homepageConfig as any)?.timeline} />;
}

async function MediaTagsServer() {
  const mediaTags = await fetchMediaTags();
  return <MediaTagsSection initialEvents={normalizeMediaEvents(mediaTags as any)} />;
}

async function ChallengesServer() {
  const challenges = await fetchChallenges();
  return <ChallengesSection initialChallenges={normalizeChallenges(challenges as any)} />;
}

async function PrizesServer() {
  const prizes = await fetchPrizes();
  return <PrizeSection initialPrizes={normalizePrizes(prizes as any)} />;
}

async function ProfileServer() {
  const [profiles, stats, brands, content] = await Promise.all([
    fetchProfiles(),
    fetchLiveDashboardStats(),
    fetchBrands(),
    fetchContent()
  ]);

  const engData: any = {
    latestSnapshots: {},
    snapshotHistory: [],
    igPosts: { namtan: [], film: [], luna: [] },
    brandCollabs: brands
  };
  const latestMap: Record<string, Record<string, number>> = { namtan: {}, film: {}, luna: {} };
  stats.snapshots.forEach((row: any) => { latestMap[row.artist][row.platform] = row.followers; });
  engData.latestSnapshots = latestMap;

  return (
    <ProfileSection
      profiles={profiles}
      engData={engData}
      ntWorksCount={stats.ntSeries}
      flWorksCount={stats.flSeries}
      allContent={content as any}
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
