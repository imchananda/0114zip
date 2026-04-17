import { Header } from '@/components/navigation/Header';
import { HeroSlider } from '@/components/hero/HeroSlider';
import { LiveDashboard } from '@/components/dashboard/LiveDashboard';
import { EditorialCheatSheet } from '@/components/dashboard/EditorialCheatSheet';
import { Footer } from '@/components/ui/Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { FloatingArtistSelector } from '@/components/navigation/FloatingArtistSelector';
import { ProfileSection } from '@/components/sections/ProfileSection';
import { SchedulePreview } from '@/components/sections/SchedulePreview';
import { ContentSection } from '@/components/content/ContentSection';
import { FashionSection } from '@/components/sections/FashionSection';
import { AwardsPreview } from '@/components/sections/AwardsPreview';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { MediaTagsSection } from '@/components/sections/MediaTagsSection';
import { ChallengesSection } from '@/components/sections/ChallengesSection';
import { PrizeSection } from '@/components/sections/PrizeSection';
import { BrandsSection } from '@/components/sections/BrandsSection';
import { HomeSectionsWrapper } from '@/components/sections/HomeSectionsWrapper';
import { supabase } from '@/lib/supabase';

// Re-fetch homepage section settings at most every 30 seconds
export const revalidate = 30;

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
  const sections = await getSections();

  // Sort enabled sections (excluding fixed-position utilities) by order
  const orderedKeys = Object.entries(sections)
    .filter(([key, cfg]) => cfg.enabled && key in SECTION_COMPONENTS)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key);

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sticky Header */}
      <Header />

      {/* Ordered, toggleable sections — wrapped in ViewStateProvider for client components */}
      <HomeSectionsWrapper>
        {orderedKeys.map(key => {
          const Comp = SECTION_COMPONENTS[key];
          return <Comp key={key} />;
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
