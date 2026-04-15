'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ViewStateProvider } from '@/context/ViewStateContext';
import { ProfileSection } from '@/components/sections/ProfileSection';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { ContentSectionClient } from '@/components/content/ContentSectionClient';
import { SchedulePreview } from '@/components/sections/SchedulePreview';
import { AwardsPreview } from '@/components/sections/AwardsPreview';
import { LiveDashboard } from '@/components/dashboard/LiveDashboard';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/ui/Footer';
import { FloatingArtistSelector } from '@/components/navigation/FloatingArtistSelector';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { ViewState, ContentItem } from '@/types';
import { useTranslations, useLocale } from 'next-intl';

interface ArtistTabsProps {
  slug: ViewState;
  allContent: ContentItem[];
}

// ─── Banner config per artist ───────────────────────────────────
// 🔧 เปลี่ยนรูป Banner ได้ที่นี่เลย! แค่แก้ path ของ bannerImage
const ARTIST_CONFIG: Record<ViewState, {
  title: string;
  titleThai: string;
  tagline: string;
  taglineThai: string;
  bannerImage: string;       // 🔧 เปลี่ยนรูปที่นี่
  accentColor: string;
  gradientOverlay: string;
}> = {
  both: {
    title: 'Namtan × Film',
    titleThai: 'น้ำตาล × ฟิล์ม',
    tagline: 'Together, Always',
    taglineThai: 'คู่กันตลอดไป',
    bannerImage: '/images/banners/banner.png',       // 🔧 รูปคู่
    accentColor: 'var(--namtan-teal)',
    gradientOverlay: 'linear-gradient(to right, rgba(108,191,208,0.3), rgba(251,223,116,0.3))',
  },
  namtan: {
    title: 'Namtan Tipnaree',
    titleThai: 'น้ำตาล ทิพนารี',
    tagline: 'Deeply Felt. Perfectly Portrayed.',
    taglineThai: 'เข้าถึงทุกความรู้สึก ลึกซึ้งทุกตัวตน',
    bannerImage: '/images/banners/nt.png',            // 🔧 รูปน้ำตาล
    accentColor: 'var(--namtan-teal)',
    gradientOverlay: 'linear-gradient(to right, rgba(108,191,208,0.25), transparent)',
  },
  film: {
    title: 'Film Rachanun',
    titleThai: 'ฟิล์ม รชานันท์',
    tagline: 'Rising Star with Versatile Talent',
    taglineThai: 'ดาวรุ่งพุ่งแรงแห่ง GMMTV',
    bannerImage: '/images/banners/f.png',             // 🔧 รูปฟิล์ม
    accentColor: 'var(--film-gold)',
    gradientOverlay: 'linear-gradient(to left, rgba(251,223,116,0.25), transparent)',
  },
  lunar: {
    title: 'Lunar Space',
    titleThai: 'ลูน่า สเปซ',
    tagline: 'Panda × Duck — Fan Community',
    taglineThai: 'แพนดั๊ก — ชุมชนแฟนคลับ',
    bannerImage: '/images/banners/banner.png',        // 🔧 รูปลูน่า (ใช้รูปคู่ไปก่อน)
    accentColor: 'var(--namtan-teal)',
    gradientOverlay: 'linear-gradient(135deg, rgba(108,191,208,0.2), rgba(142,208,221,0.15), rgba(251,223,116,0.2))',
  },
};

export function ArtistTabs({ slug, allContent }: ArtistTabsProps) {
  const t = useTranslations();
  const locale = useLocale();
  const config = ARTIST_CONFIG[slug];
  
  const TABS = [
    { id: 'profile',    label: 'Profile',    icon: '📋', component: ProfileSection },
    { id: 'schedule',   label: 'Schedule',   icon: '📅', component: SchedulePreview },
    { id: 'works',      label: 'Works',      icon: '🎬', component: () => <ContentSectionClient initialContent={allContent} /> },
    { id: 'stats',      label: 'Stats',      icon: '📊', component: LiveDashboard },
    { id: 'awards',     label: 'Awards',     icon: '🏆', component: AwardsPreview },
    { id: 'timeline',   label: 'Timeline',   icon: '📖', component: TimelineSection },
  ] as const;

  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('profile');
  
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component || ProfileSection;

  return (
    <ViewStateProvider initialState={slug}>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
        <Header />

        {/* ── Hero Banner ── */}
        {slug === 'both' ? (
          <HeroBanner />
        ) : (
          <div className="relative h-[30vh] sm:h-[35vh] md:h-[40vh] w-full overflow-hidden">
            {/* Banner Image */}
            <Image
              src={config.bannerImage}
              alt={config.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
            />

            {/* Color overlay */}
            <div 
              className="absolute inset-0"
              style={{ background: config.gradientOverlay }}
            />

            {/* Bottom fade to page bg */}
            <div 
              className="absolute inset-x-0 bottom-0 h-1/2"
              style={{ background: 'linear-gradient(to top, var(--color-bg), transparent)' }}
            />

            {/* Vignette edges */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg)]/30 via-transparent to-[var(--color-bg)]/30" />

            {/* Content centered on banner */}
            <div className="absolute inset-0 flex items-end justify-center pb-6 md:pb-10 z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h1 className={cn(
                  'text-3xl sm:text-4xl md:text-6xl font-display tracking-wide mb-2',
                  'text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]',
                  locale === 'th' ? 'font-thai' : ''
                )}>
                  {locale === 'th' ? config.titleThai : config.title}
                </h1>
                <p className={cn(
                  'text-white/70 text-xs sm:text-sm tracking-wider uppercase',
                  'drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]',
                  locale === 'th' ? 'font-thai' : ''
                )}>
                  {locale === 'th' ? config.taglineThai : config.tagline}
                </p>
              </motion.div>
            </div>
          </div>
        )}

        {/* ── Tab Navigation ── */}
        <div className="sticky top-[72px] z-30 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border)] shadow-sm">
          <div className="container mx-auto px-4 md:px-12">
            <div className="flex overflow-x-auto scrollbar-hide py-2.5 gap-1 md:gap-2 md:justify-center items-center">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative px-4 py-2 text-xs sm:text-sm whitespace-nowrap transition-all duration-300 rounded-[1.5rem] tracking-wider flex items-center gap-1.5',
                      locale === 'th' ? 'font-thai' : '',
                      isActive
                        ? 'text-[#141413] bg-[var(--color-surface)] shadow-[0_0_0_1px_var(--color-border)] font-medium'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)]'
                    )}
                  >
                    <span className="text-sm">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <main className="flex-1 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />

        {/* Floating Artist Selector */}
        <FloatingArtistSelector />
      </div>
    </ViewStateProvider>
  );
}
