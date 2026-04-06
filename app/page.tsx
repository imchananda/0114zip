import { ViewStateProvider } from '@/context/ViewStateContext';
import { Header } from '@/components/navigation/Header';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { StateIndicator } from '@/components/navigation/StateIndicator';
import { ContentSection } from '@/components/content/ContentSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { TimelineSection } from '@/components/sections/TimelineSection';
import { ProfileSection } from '@/components/sections/ProfileSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { EngagePreview } from '@/components/sections/EngagePreview';
import { SchedulePreview } from '@/components/sections/SchedulePreview';
import { AwardsPreview } from '@/components/sections/AwardsPreview';
import { Footer } from '@/components/ui/Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

export default function HomePage() {
  return (
    <ViewStateProvider>
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        {/* Sticky Header */}
        <Header />

        {/* Netflix-style Hero Banner */}
        <HeroBanner />

        {/* State Indicator Pills */}
        <StateIndicator />

        {/* Content Rows */}
        <ContentSection />

        {/* Profile Section */}
        <ProfileSection />

        {/* Timeline Section */}
        <TimelineSection />

        {/* Gallery Section */}
        <GallerySection />

        {/* Schedule Preview */}
        <SchedulePreview />

        {/* Awards Preview */}
        <AwardsPreview />

        {/* Engagement & Stats Preview */}
        <EngagePreview />

        {/* Footer */}
        <Footer />

        {/* Scroll To Top */}
        <ScrollToTop />
      </main>
    </ViewStateProvider>
  );
}
