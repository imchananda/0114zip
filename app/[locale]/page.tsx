import dynamic from 'next/dynamic';
import { Header } from '@/components/navigation/Header';
import { HeroSlider } from '@/components/hero/HeroSlider';
import { EditorialCheatSheet } from '@/components/dashboard/EditorialCheatSheet';
import { Footer } from '@/components/ui/Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { FloatingArtistSelector } from '@/components/navigation/FloatingArtistSelector';
import { HomeSectionsWrapper } from '@/components/sections/HomeSectionsWrapper';
import { supabase } from '@/lib/supabase';
import { fetchHomeData } from '@/lib/homepage-data';
import type { HomePageData } from '@/lib/homepage-data';

// ── Below-the-fold sections: code-split so they don't bloat the initial bundle ─
const SectionSkeleton = () => (
  <div className="w-full py-16 md:py-24 animate-pulse">
    <div className="container mx-auto px-6 md:px-12 space-y-4">
      <div className="h-6 w-40 rounded-lg bg-[var(--color-surface)]" />
      <div className="h-4 w-64 rounded-lg bg-[var(--color-surface)]" />
    </div>
  </div>
);

const BrandsSection    = dynamic(() => import('@/components/sections/BrandsSection').then(m => m.BrandsSection),    { loading: SectionSkeleton });
const ProfileSection   = dynamic(() => import('@/components/sections/ProfileSection').then(m => m.ProfileSection),   { loading: SectionSkeleton });
const SchedulePreview  = dynamic(() => import('@/components/sections/SchedulePreview').then(m => m.SchedulePreview), { loading: SectionSkeleton });
const ContentSection   = dynamic(() => import('@/components/content/ContentSection').then(m => m.ContentSection),    { loading: SectionSkeleton });
const FashionSection   = dynamic(() => import('@/components/sections/FashionSection').then(m => m.FashionSection),   { loading: SectionSkeleton });
const AwardsPreview    = dynamic(() => import('@/components/sections/AwardsPreview').then(m => m.AwardsPreview),     { loading: SectionSkeleton });
const TimelineSection  = dynamic(() => import('@/components/sections/TimelineSection').then(m => m.TimelineSection), { loading: SectionSkeleton });
const MediaTagsSection = dynamic(() => import('@/components/sections/MediaTagsSection').then(m => m.MediaTagsSection), { loading: SectionSkeleton });
const ChallengesSection = dynamic(() => import('@/components/sections/ChallengesSection').then(m => m.ChallengesSection), { loading: SectionSkeleton });
const PrizeSection     = dynamic(() => import('@/components/sections/PrizeSection').then(m => m.PrizeSection),       { loading: SectionSkeleton });

// Re-fetch homepage section settings at most every 2 minutes
export const revalidate = 120;

export type SectionConfig = { enabled: boolean; order: number };

// Default config: key → { enabled, order }
// floatingArtistSelector / scrollToTop are fixed-position UI, kept separate from ordered sections
const DEFAULT_SECTIONS: Record<string, SectionConfig> = {
  heroBanner:             { enabled: true,  order: 0  },
  liveDashboard:          { enabled: true,  order: 1  },
  brands:                 { enabled: true,  order: 2  },
  profile:                { enabled: true,  order: 3  },
  schedule:               { enabled: true,  order: 4  },
  content:                { enabled: true,  order: 5  },
  fashion:                { enabled: true,  order: 6  },
  awards:                 { enabled: true,  order: 7  },
  timeline:               { enabled: true,  order: 8  },
  mediaTags:              { enabled: true,  order: 9  },
  challenges:             { enabled: true,  order: 10 },
  prize:                  { enabled: true,  order: 11 },
  floatingArtistSelector: { enabled: true,  order: 99 },
  scrollToTop:            { enabled: true,  order: 100 },
};

async function getSections(): Promise<Record<string, SectionConfig>> {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'homeSections')
      .single();
    if (data?.value && typeof data.value === 'object') {
      const merged = { ...DEFAULT_SECTIONS };
      for (const [key, val] of Object.entries(data.value as Record<string, unknown>)) {
        if (typeof val === 'boolean') {
          // backward-compat: old boolean format
          merged[key] = { ...(merged[key] ?? { order: 50 }), enabled: val };
        } else if (val && typeof val === 'object' && 'enabled' in val) {
          merged[key] = { ...(merged[key] ?? { order: 50 }), ...(val as SectionConfig) };
        }
      }
      return merged;
    }
  } catch { /* use defaults */ }
  return DEFAULT_SECTIONS;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_COMPONENTS: Record<string, any> = {
  heroBanner:    HeroSlider,
  liveDashboard: EditorialCheatSheet,
  brands:        BrandsSection,
  profile:       ProfileSection,
  schedule:      SchedulePreview,
  content:       ContentSection,
  fashion:       FashionSection,
  awards:        AwardsPreview,
  timeline:      TimelineSection,
  mediaTags:     MediaTagsSection,
  challenges:    ChallengesSection,
  prize:         PrizeSection,
};

export default async function HomePage() {
  // Fetch sections config and all homepage data in parallel
  const [sections, homeData] = await Promise.all([
    getSections(),
    fetchHomeData().catch(() => null) as Promise<HomePageData | null>,
  ]);

  // Sort enabled sections (excluding fixed-position utilities) by order
  const orderedKeys = Object.entries(sections)
    .filter(([key, cfg]) => cfg.enabled && key in SECTION_COMPONENTS)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key);

  // Initial props to pass to each data-dependent section
  const sectionInitialProps: Record<string, Record<string, unknown>> = homeData
    ? {
        heroBanner: {
          initialSlides: homeData.heroSlides,
        },
        liveDashboard: {
          initialEng:          homeData.engData,
          initialProfiles:     homeData.profiles,
          initialFanCountries: homeData.fanCountries,
          initialFeaturedWork: homeData.featuredWork,
          initialNtSeries:     homeData.ntSeries,
          initialFlSeries:     homeData.flSeries,
        },
        schedule: {
          initialEvents: homeData.scheduleEvents,
        },
        brands: {
          initialBrands:        homeData.brands,
          initialYears:         homeData.brandYears,
          initialSectionImages: homeData.brandSectionImages,
          initialProfileImages: homeData.brandProfileImages,
        },
        mediaTags: {
          initialEvents: homeData.mediaEvents,
        },
        challenges: {
          initialChallenges: homeData.challenges,
        },
        prize: {
          initialPrizes: homeData.prizes,
        },
      }
    : {};

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sticky Header */}
      <Header />

      {/* Ordered, toggleable sections — wrapped in ViewStateProvider for client components */}
      <HomeSectionsWrapper>
        {orderedKeys.map(key => {
          const Comp = SECTION_COMPONENTS[key];
          const props = sectionInitialProps[key] ?? {};
          return <Comp key={key} {...props} />;
        })}
      </HomeSectionsWrapper>

      {/* Footer divider */}
      <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-border), transparent)' }} />

      {/* Footer */}
      <Footer />

      {/* Fixed-position UI utilities */}
      {sections.scrollToTop?.enabled && <ScrollToTop />}
      {sections.floatingArtistSelector?.enabled && <FloatingArtistSelector />}
    </main>
  );
}
