'use client';

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { CinematicHero } from '@/components/hero/CinematicHero';
import { HomeSectionsWrapper } from '@/components/sections/HomeSectionsWrapper';
import { Footer } from '@/components/ui/Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { LandingSection } from '@/components/ui/LandingSection';
import type { SectionVariant } from '@/components/ui/LandingSection';
import { FloatingArtistSelector } from '@/components/navigation/FloatingArtistSelector';
import { useFloatingArtistSelectorConfig } from '@/components/navigation/FloatingArtistSelectorProvider';
import { mainSpacerClassForDock } from '@/lib/floating-artist-config';
import { STATIC_HOME_UI_KEYS, type HomepageSectionsConfig } from '@/lib/homepage-sections';
import type { HeroBannerConfig, HomeArtistProfile, HomeHeroSlide } from '@/lib/homepage-data';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

function DeferredSection({
  children,
  defer,
}: {
  children: () => ReactNode;
  defer: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(!defer);

  useEffect(() => {
    if (isVisible || !defer) return;

    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: '650px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [defer, isVisible]);

  return (
    <div ref={ref} className={isVisible ? undefined : 'min-h-[1px]'}>
      {isVisible ? children() : null}
    </div>
  );
}

function DeferredLandingSection({
  children,
  defer,
}: {
  children: () => ReactNode;
  defer: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(!defer);

  useEffect(() => {
    if (isVisible || !defer) return;

    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => setIsVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: '900px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [defer, isVisible]);

  return (
    <div ref={ref} className={isVisible ? undefined : 'min-h-[1px]'}>
      {isVisible ? children() : null}
    </div>
  );
}

function getSectionVariant(index: number): SectionVariant {
  return index % 2 === 0 ? 'alternate' : 'primary';
}

interface HomePageClientProps {
  config: HomepageSectionsConfig;
  heroConfig: HeroBannerConfig;
  heroSlides: HomeHeroSlide[];
  profiles: Record<string, HomeArtistProfile>;
  sections: Record<string, ReactNode>;
}

export function HomePageClient({ config, heroConfig, heroSlides, profiles, sections }: HomePageClientProps) {
  // Initial render must match SSR (always false). The session-aware skip is
  // applied in a post-mount effect to avoid hydration mismatches.
  const [introComplete, setIntroComplete] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const floatingCfg = useFloatingArtistSelectorConfig();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem('home_splash_seen') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount sessionStorage sync
      setIntroComplete(true);
    }
  }, []);

  const orderedSections = useMemo(() => {
    return Object.entries(config)
      .filter(([id, secConfig]) => secConfig.enabled && !STATIC_HOME_UI_KEYS.has(id))
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([id]) => id);
  }, [config]);

  const showFloatingHome =
    config.floatingArtistSelector?.enabled !== false && floatingCfg.visibility.home;
  const showScrollToTop = config.scrollToTop?.enabled !== false;
  const mainDockPadding = showFloatingHome ? mainSpacerClassForDock(floatingCfg.dock) : '';

  const handleIntroComplete = () => {
    window.sessionStorage.setItem('home_splash_seen', '1');
    setIntroComplete(true);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!introComplete && <SplashScreen key="splash" onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <main
        className={cn(
          'relative transition-opacity duration-1000',
          mainDockPadding,
          introComplete ? 'opacity-100' : 'opacity-0 h-screen overflow-hidden',
        )}
      >
        <motion.div className="fixed top-0 left-0 right-0 h-1 bg-nf-gradient z-[60] origin-left" style={{ scaleX }} />

        <Header />
        <CinematicHero slides={heroSlides} profiles={profiles} config={heroConfig} />

        <HomeSectionsWrapper>
          <div>
            {orderedSections.map((sectionId, index) => {
              const variant = getSectionVariant(index);
              const SectionComponent = sections[sectionId];

              if (!SectionComponent) return null;

              return (
                <DeferredLandingSection key={sectionId} defer={index > 2}>
                  {() => (
                    <div>
                      <LandingSection id={sectionId} delay={0.1} variant={variant}>
                        <DeferredSection defer={false}>
                          {() => SectionComponent}
                        </DeferredSection>
                      </LandingSection>
                    </div>
                  )}
                </DeferredLandingSection>
              );
            })}
          </div>
        </HomeSectionsWrapper>

        <Footer />
        {showScrollToTop ? <ScrollToTop /> : null}
        {showFloatingHome ? <FloatingArtistSelector /> : null}
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
