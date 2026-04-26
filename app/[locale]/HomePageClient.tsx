'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/navigation/Header';
import { CinematicHero } from '@/components/hero/CinematicHero';
import { EditorialCheatSheet } from '@/components/dashboard/EditorialCheatSheet';
import type { EngData, ArtistProfile, FanCountry, ContentDbItem } from '@/components/dashboard/EditorialCheatSheet';
import { HomeSectionsWrapper } from '@/components/sections/HomeSectionsWrapper';
import { Footer } from '@/components/ui/Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { LandingSection } from '@/components/ui/LandingSection';
import type { SectionVariant } from '@/components/ui/LandingSection';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { FloatingArtistSelector } from '@/components/navigation/FloatingArtistSelector';
import { Mascot } from '@/components/mascot/Mascot';
import type { HomePageData } from '@/lib/homepage-data';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

type BrandSectionBrand = {
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
};

const SectionSkeleton = () => (
  <div className="w-full py-24 md:py-32 animate-pulse bg-[var(--color-bg)]">
    <div className="container mx-auto px-6 md:px-12 max-w-6xl space-y-12">
      <div className="space-y-4 border-b border-theme/20 pb-8">
        <div className="h-3 w-32 rounded-full bg-theme/20" />
        <div className="h-12 w-80 rounded-2xl bg-theme/10" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="h-72 rounded-[2rem] bg-theme/5" />
        <div className="h-72 rounded-[2rem] bg-theme/5" />
        <div className="h-72 rounded-[2rem] bg-theme/5" />
      </div>
    </div>
  </div>
);

const BrandsSection = dynamic(() => import('@/components/sections/BrandsSection').then((m) => m.BrandsSection), { loading: SectionSkeleton });
const ProfileSection = dynamic(() => import('@/components/sections/ProfileSection').then((m) => m.ProfileSection), { loading: SectionSkeleton });
const SchedulePreview = dynamic(() => import('@/components/sections/SchedulePreview').then((m) => m.SchedulePreview), { loading: SectionSkeleton });
const ContentSection = dynamic(() => import('@/components/content/ContentSection').then((m) => m.ContentSection), { loading: SectionSkeleton });
const FashionSection = dynamic(() => import('@/components/sections/FashionSection').then((m) => m.FashionSection), { loading: SectionSkeleton });
const AwardsPreview = dynamic(() => import('@/components/sections/AwardsPreview').then((m) => m.AwardsPreview), { loading: SectionSkeleton });
const TimelineSection = dynamic(() => import('@/components/sections/TimelineSection').then((m) => m.TimelineSection), { loading: SectionSkeleton });
const MediaTagsSection = dynamic(() => import('@/components/sections/MediaTagsSection').then((m) => m.MediaTagsSection), { loading: SectionSkeleton });
const PrizeSection = dynamic(() => import('@/components/sections/PrizeSection').then((m) => m.PrizeSection), { loading: SectionSkeleton });
const AboutSection = dynamic(() => import('@/components/sections/AboutSection').then((m) => m.AboutSection), { loading: SectionSkeleton });
const ChallengesSection = dynamic(() => import('@/components/sections/ChallengesSection').then((m) => m.ChallengesSection), { loading: SectionSkeleton });

function getSectionVariant(index: number): SectionVariant {
  return index % 2 === 0 ? 'alternate' : 'primary';
}

export function HomePageClient({ data }: { data: HomePageData }) {
  const [introComplete, setIntroComplete] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const orderedSections = useMemo(() => {
    return Object.entries(data.homepageConfig)
      .filter(([, config]) => config.enabled)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([id]) => id);
  }, [data.homepageConfig]);

  const renderSection = (id: string) => {
    switch (id) {
      case 'about':
        return <AboutSection ntWorks={data.ntSeries || 0} flWorks={data.flSeries || 0} totalAwards={data.awardsItems.length} />;
      case 'stats':
        return (
          <EditorialCheatSheet
            initialEng={data.engData as unknown as EngData}
            initialProfiles={data.profiles as unknown as Record<string, ArtistProfile>}
            initialFanCountries={data.fanCountries as unknown as FanCountry[]}
            initialFeaturedSeries={data.featuredSeries as unknown as ContentDbItem | null}
            initialFeaturedMusic={data.featuredMusic as unknown as ContentDbItem | null}
            initialNtSeries={data.ntSeries}
            initialFlSeries={data.flSeries}
          />
        );
      case 'brands':
        {
          const normalizedBrands: BrandSectionBrand[] = data.brands.map((b) => ({
            ...b,
            media_items: Array.isArray(b.media_items)
              ? b.media_items
                  .filter((item): item is { type?: unknown; title?: unknown; url?: unknown } => !!item && typeof item === 'object')
                  .map((item) => ({
                    type: typeof item.type === 'string' ? item.type : 'Other',
                    title: typeof item.title === 'string' ? item.title : '',
                    ...(typeof item.url === 'string' ? { url: item.url } : {}),
                  }))
              : null,
          }));

        return (
          <BrandsSection
            initialBrands={normalizedBrands}
            initialYears={data.brandYears}
            initialSectionImages={data.brandSectionImages}
            initialProfileImages={Object.fromEntries(Object.entries(data.profiles).map(([k, v]) => [k, v.photo_url || '']))}
          />
        );
        }
      case 'schedule':
        return <SchedulePreview initialEvents={data.scheduleEvents as unknown as never[]} />;
      case 'content':
        return <ContentSection initialContent={data.allContent as unknown as never[]} />;
      case 'fashion':
        return <FashionSection initialItems={data.fashionItems as unknown as never[]} />;
      case 'awards':
        return <AwardsPreview initialAwards={data.awardsItems as unknown as never[]} />;
      case 'timeline':
        return <TimelineSection initialEvents={data.timelineItems as unknown as never[]} />;
      case 'mediaTags':
        return <MediaTagsSection initialEvents={data.mediaEvents as unknown as never[]} />;
      case 'challenges':
        return <ChallengesSection initialChallenges={data.challenges as unknown as never[]} />;
      case 'prizes':
        return <PrizeSection initialPrizes={data.prizes as unknown as never[]} />;
      case 'profile':
        return <ProfileSection profiles={data.profiles} />;
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!introComplete && <SplashScreen key="splash" onComplete={() => setIntroComplete(true)} />}
      </AnimatePresence>

      <main className={cn('relative transition-opacity duration-1000', introComplete ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden')}>
        <motion.div className="fixed top-0 left-0 right-0 h-1 bg-nf-gradient z-[60] origin-left" style={{ scaleX }} />

        <Header />
        <CinematicHero slides={data.heroSlides} profiles={data.profiles} config={data.heroBannerConfig} />

        <HomeSectionsWrapper>
          <div>
            {orderedSections.map((sectionId, index) => {
              const variant = getSectionVariant(index);
              const prevVariant = index > 0 ? getSectionVariant(index - 1) : 'alternate';

              return (
                <div key={sectionId}>
                  <SectionDivider fromVariant={index === 0 ? 'alternate' : prevVariant} toVariant={variant} />

                  {index > 0 && index % 4 === 0 && (
                    <div className="flex justify-center py-2 -mt-16 relative z-10">
                      <div className="opacity-20 hover:opacity-100 transition-opacity duration-700">
                        <Mascot state="waving" size={64} />
                      </div>
                    </div>
                  )}

                  <LandingSection id={sectionId} delay={0.1} variant={variant}>
                    {renderSection(sectionId)}
                  </LandingSection>
                </div>
              );
            })}

            {orderedSections.length > 0 && <SectionDivider fromVariant={getSectionVariant(orderedSections.length - 1)} toVariant="primary" />}
          </div>
        </HomeSectionsWrapper>

        <Footer />
        <ScrollToTop />
        <FloatingArtistSelector />
      </main>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        body {
          overflow-x: hidden;
          background-color: var(--color-bg);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
