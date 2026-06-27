'use client';

/**
 * Phase 6 — cross-layer section (pattern from Timeline/Awards pilots):
 *   • Visual: getProfileStyles (profileSection.styles.ts)
 *   • Motion: useSectionMotion + toWhileInViewBinding
 *   • Theme: SectionThemeWrapper → CSS vars
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useViewState } from '@/context/ViewStateContext';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { HomepageSectionConfig, PageMotionConfig, PageThemeConfig } from '@/lib/homepage-sections';
import { SectionThemeWrapper } from '@/components/ui/SectionThemeWrapper';
import { toWhileInViewBinding, useSectionMotion } from '@/lib/visual';
import {
  HomeArtistProfile,
  HomeEngData,
  HomeContentItem,
} from '@/lib/homepage-data';
import {
  getArtistPanelContentClass,
  getArtistPanelRadius,
  getArtistPanelShellClass,
  getProfileStyles,
  getSplitGridClass,
  PROFILE_ARTIST_ACCENTS,
} from './profileSection.styles';

/* ── Props ─────────────────────────────────────────────────────────── */

interface ProfileSectionProps {
  profiles?: Record<string, HomeArtistProfile>;
  engData?: HomeEngData;
  ntWorksCount?: number | null;
  flWorksCount?: number | null;
  allContent?: HomeContentItem[];
  config?: Pick<HomepageSectionConfig, 'theme' | 'layout' | 'motion' | 'themeTokens'>;
  pageMotion?: PageMotionConfig;
  pageTheme?: PageThemeConfig;
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function shouldUnoptimizedImage(url: string | null | undefined): boolean {
  if (!url || !url.startsWith('http')) return false;
  if (url.includes('supabase.co') || url.includes('supabase.in')) return false;
  return true;
}

const CONTENT_TYPE_LABEL: Record<string, Record<string, string>> = {
  en: { series: 'Series', variety: 'Variety', music: 'Music', magazine: 'Magazine', event: 'Event', award: 'Award' },
  th: { series: 'ซีรีส์', variety: 'วาไรตี้', music: 'เพลง', magazine: 'นิตยสาร', event: 'อีเวนต์', award: 'รางวัล' },
};

/* ── Icons (compact) ─────────────────────────────────────────────── */

function IgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

/* ── Half-panel (single artist column, mockup-accurate structure) ───── */

function ArtistSplitPanel({
  side,
  profile,
  snap,
  works,
  latestWorks,
  accentHex,
  orbitLabel,
  getTypeLabel,
  lang,
  t,
  splitMode = 'pair',
  theme,
}: {
  side: 'left' | 'right';
  profile: HomeArtistProfile | undefined;
  snap: Record<string, number>;
  works: number | null;
  latestWorks: HomeContentItem[];
  accentHex: string;
  orbitLabel: string;
  getTypeLabel: (contentType: string) => string;
  lang: string;
  t: ReturnType<typeof useTranslations>;
  /** pair = left/right in split; single = นับเป็นคนเดียว มุมโค้งรอบการ์ด */
  splitMode?: 'pair' | 'single';
  theme?: string;
}) {
  const id = side === 'left' ? 'namtan' : 'film';
  const unopt = shouldUnoptimizedImage(profile?.photo_url);
  const styles = getProfileStyles({ theme });
  const isLight = styles.resolvedTheme === 'light';

  const loc = (enK: keyof HomeArtistProfile, thK: keyof HomeArtistProfile) => {
    if (!profile) return '';
    return lang === 'th'
      ? ((profile[thK] as string) || (profile[enK] as string) || '')
      : ((profile[enK] as string) || '');
  };

  const desc =
    loc('tagline', 'tagline_th') || loc('description', 'description_th') || loc('full_name', 'full_name_th');

  const ig = snap.instagram ?? 0;
  const x = snap.x ?? snap.twitter ?? 0;

  const starfieldStyle = useMemo(() => {
    const particleColor = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.45)';
    return {
      backgroundImage: [
        `radial-gradient(1px 1px at 8% 12%, ${particleColor}, transparent)`,
        `radial-gradient(1.5px 1.5px at 22% 38%, ${particleColor}, transparent)`,
        `radial-gradient(1px 1px at 45% 8%, ${particleColor}, transparent)`,
        `radial-gradient(1px 1px at 78% 22%, ${particleColor}, transparent)`,
        `radial-gradient(1.5px 1.5px at 92% 60%, ${particleColor}, transparent)`,
      ].join(', '),
      backgroundSize: '100% 100%',
    };
  }, [isLight]);

  return (
    <motion.div
      className={getArtistPanelShellClass(side, isLight)}
      whileHover={{ 
        boxShadow: isLight
          ? `0 0 60px -15px ${accentHex}20`
          : `0 0 60px -15px ${accentHex}25`, 
        borderColor: `${accentHex}20` 
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Cinematic base + side tint (mockup: blue left / gold right wash) */}
      <div
        className="absolute inset-0 z-0 transition-all duration-700"
        style={{
          background: isLight
            ? (side === 'left'
                ? 'linear-gradient(180deg, #f3f8fa 0%, #eaf3f6 40%, #deeef2 100%)'
                : 'linear-gradient(180deg, #fdfbf5 0%, #faf5e6 50%, #f6edd0 100%)')
            : (side === 'left'
                ? 'linear-gradient(180deg, #030a18 0%, #050c1a 40%, #060d1c 100%)'
                : 'linear-gradient(180deg, #120c02 0%, #0f0a00 50%, #0a0800 100%)'),
        }}
      />
      {profile?.photo_url && (
        <motion.div 
          className="absolute inset-0 z-[1] overflow-hidden"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Image
            src={profile.photo_url}
            alt={profile.nickname || id}
            fill
            unoptimized={unopt}
            className={cn(
              'object-cover object-top transition-all duration-700',
              side === 'left' ? 'object-right' : 'object-left',
              isLight ? 'opacity-[0.85]' : 'opacity-80'
            )}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={side === 'left'}
          />
        </motion.div>
      )}

      {/* Orbit / glow + starfield + vignette */}
      <div className="absolute inset-0 z-[2] pointer-events-none" style={starfieldStyle} />
      <div
        className="absolute inset-0 z-[2] pointer-events-none transition-all duration-700"
        style={{
          background: side === 'left'
            ? `radial-gradient(ellipse 90% 70% at 20% 30%, ${isLight ? 'rgba(105,188,220,0.22)' : 'rgba(105,188,220,0.2)'}, transparent 55%)`
            : `radial-gradient(ellipse 90% 70% at 80% 30%, ${isLight ? 'rgba(248,232,95,0.2)' : 'rgba(248,232,95,0.12)'}, transparent 55%)`,
        }}
      />
      <div
        className="absolute inset-0 z-[2] pointer-events-none transition-all duration-700"
        style={{
          background: isLight
            ? 'radial-gradient(ellipse at center, transparent 40%, rgba(255,255,255,0.25) 100%)'
            : 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)',
          mixBlendMode: isLight ? 'normal' : 'multiply'
        } as import('react').CSSProperties}
      />
      <div
        className="absolute inset-0 z-[2] pointer-events-none transition-all duration-700"
        style={{
          background: isLight
            ? (side === 'left'
                ? 'linear-gradient(to top, #deeef2 0%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 100%)'
                : 'linear-gradient(to top, #f6edd0 0%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 100%)')
            : 'linear-gradient(to top, #03050c 0%, rgba(3,5,12,0.4) 45%, rgba(3,5,12,0.2) 100%)',
        }}
      />

      {/* Rotating Astronomical Symmetrical Orbit Ring */}
      <motion.div
        className={`absolute z-[2] pointer-events-none opacity-20 transition-all duration-700 ${
          side === 'left' ? '-left-[25%] top-[15%] w-[80%] aspect-square' : '-right-[25%] top-[15%] w-[80%] aspect-square'
        }`}
        style={{
          border: `1px solid ${accentHex}`,
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
      />

      {/* Foreground: content at bottom, mockup layout */}
      <div className={getArtistPanelContentClass(side)}>
        <div className="max-w-md w-full" style={side === 'right' ? { marginLeft: 'auto' } : undefined}>
          <h3
            className={cn(
              "text-4xl sm:text-6xl md:text-7xl lg:text-5xl xl:text-7xl 2xl:text-8xl font-display font-bold tracking-tight leading-[0.95] transition-all duration-500",
              isLight ? "text-slate-900 drop-shadow-sm" : "text-white drop-shadow-2xl"
            )}
            style={{ fontFeatureSettings: '"ss02"', textShadow: isLight ? 'none' : `0 0 40px ${accentHex}33` }}
          >
            {profile?.nickname?.toUpperCase() || id.toUpperCase()}
          </h3>
          <div
            className={`mt-3.5 flex items-center gap-2 ${side === 'right' ? 'justify-end' : 'justify-start'}`}
          >
            <span
              className="h-2 w-2 rounded-full shadow-lg"
              style={{ backgroundColor: accentHex, boxShadow: `0 0 12px ${accentHex}` }}
            />
            <span
              className="text-xs font-bold uppercase tracking-[0.25em] font-sans"
              style={{ color: accentHex }}
            >
              {t('profile.orbit')} : {orbitLabel}
            </span>
          </div>

          {desc && (
            <p className={cn(
              "text-sm sm:text-base leading-relaxed mt-4 font-thai line-clamp-4 font-medium transition-colors duration-500",
              isLight ? "text-slate-800" : "text-white/75"
            )}>
              {desc}
            </p>
          )}

          {/* Symmetrical mirrored button */}
          <Link
            href={`/artist/${id}`}
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm transition-all hover:brightness-110",
              isLight ? "text-slate-900 hover:bg-black/5" : "text-white/95 hover:bg-white/5"
            )}
            style={{ 
              borderColor: isLight ? `${accentHex}aa` : `${accentHex}88`, 
              backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)' 
            }}
          >
            {side === 'right' && <span className="text-sm leading-none" aria-hidden>←</span>}
            {t('profile.viewProfile')}
            {side === 'left' && <span className="text-sm leading-none" aria-hidden>→</span>}
          </Link>

          {/* Floating Glassmorphic Symmetrical Stats Module */}
          <div className={styles.statsContainerClass(side)}>
            {ig > 0 && (
              <div className={styles.statItemClass(side)}>
                <span className="shrink-0" style={{ color: accentHex }}>
                  <IgIcon className="h-5 w-5" />
                </span>
                <div>
                  <span className={styles.statValueClass}>{fmt(ig)}</span>
                  <span className={styles.statLabelClass}>Instagram</span>
                </div>
              </div>
            )}
            {x > 0 && (
              <div className={styles.statItemClass(side)}>
                <span className="shrink-0" style={{ color: accentHex }}>
                  <XIcon className="h-5 w-5" />
                </span>
                <div>
                  <span className={styles.statValueClass}>{fmt(x)}</span>
                  <span className={styles.statLabelClass}>X</span>
                </div>
              </div>
            )}
            {works != null && works > 0 && (
              <div className={styles.statItemClass(side)}>
                <span className="shrink-0" style={{ color: accentHex }}>
                  <FilmIcon className="h-5 w-5" />
                </span>
                <div>
                  <span className={styles.statValueClass}>{works}</span>
                  <span className={styles.statLabelClass}>{t('profile.totalWorks')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Latest Works — Glass floating cards (mirrored) */}
        {latestWorks.length > 0 && (
          <div className={styles.worksWrapperClass(side)}>
            <div className={styles.worksTitleClass}>
              {t('profile.latestWorks')}
            </div>
            <div className={styles.worksGridClass(side)}>
              {latestWorks.map((work) => (
                <Link
                  href={`/artist/${id}?tab=works`}
                  key={work.id}
                  className={styles.workCardClass}
                >
                  <div className={styles.workImageWrapClass}>
                    {work.image && (
                      <Image
                        src={work.image}
                        alt={lang === 'th' ? work.title_thai || work.title : work.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 group-hover/work:scale-110"
                        sizes="120px"
                      />
                    )}
                  </div>
                  <div className={styles.workInfoClass(side)}>
                    <span className={styles.workTextClass}>
                      {lang === 'th' ? work.title_thai || work.title : work.title}
                    </span>
                    <span className={styles.workSubClass}>
                      {getTypeLabel(work.content_type)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main section ─────────────────────────────────────────────────── */

export function ProfileSection({
  profiles = {},
  engData,
  ntWorksCount,
  flWorksCount,
  allContent = [],
  config,
  pageMotion,
  pageTheme,
}: ProfileSectionProps) {
  const { state } = useViewState();
  const t = useTranslations();
  const lang = useLocale();
  const styles = getProfileStyles({ theme: config?.theme, layout: config?.layout });
  const sectionMotion = useSectionMotion(pageMotion, config?.motion);
  const headerTitleMotion = toWhileInViewBinding(sectionMotion, 2);

  const showNamtan = state === 'both' || state === 'namtan' || state === 'lunar';
  const showFilm = state === 'both' || state === 'film' || state === 'lunar';

  const contentLabel = (type: string) =>
    CONTENT_TYPE_LABEL[lang]?.[type] ?? CONTENT_TYPE_LABEL.en[type] ?? type;

  const ntSnap = engData?.latestSnapshots?.namtan ?? {};
  const flSnap = engData?.latestSnapshots?.film ?? {};
  const ntLatest = allContent
    .filter((c) => c.actors?.includes('namtan') && c.image)
    .slice(0, 3);
  const flLatest = allContent
    .filter((c) => c.actors?.includes('film') && c.image)
    .slice(0, 3);

  const splitMode: 'pair' | 'single' = showNamtan && showFilm ? 'pair' : 'single';

  return (
    <SectionThemeWrapper
      as="section"
      id="profile"
      className={styles.sectionClass}
      pageTheme={pageTheme}
      sectionTheme={config?.themeTokens}
    >
      <div className={styles.outerWrapClass}>
        {/* Magazine-style Centered Header */}
        <div className={styles.headerWrapClass}>
          <motion.h2
            initial={headerTitleMotion.initial}
            whileInView={headerTitleMotion.whileInView}
            viewport={headerTitleMotion.viewport}
            transition={headerTitleMotion.transition}
            className={styles.titleClass}
          >
            {t('profile.title')}
          </motion.h2>
          <p className={styles.subThaiClass}>{t('profile.subThai')}</p>
          <div className={styles.headerDividerClass} />
        </div>

        <div className={getSplitGridClass(showNamtan && showFilm)}>
          {/* Symmetrical desktop vertical divider line */}
          {showNamtan && showFilm && (
            <div className={styles.centerDividerClass} />
          )}

          {showNamtan && (
            <ArtistSplitPanel
              side="left"
              profile={profiles.namtan}
              snap={ntSnap}
              works={ntWorksCount ?? null}
              latestWorks={ntLatest}
              accentHex={PROFILE_ARTIST_ACCENTS.namtan}
              orbitLabel="BLUE"
              getTypeLabel={contentLabel}
              lang={lang}
              t={t}
              splitMode={splitMode}
              theme={config?.theme}
            />
          )}

          {showFilm && (
            <ArtistSplitPanel
              side="right"
              profile={profiles.film}
              snap={flSnap}
              works={flWorksCount ?? null}
              latestWorks={flLatest}
              accentHex={PROFILE_ARTIST_ACCENTS.film}
              orbitLabel="YELLOW"
              getTypeLabel={contentLabel}
              lang={lang}
              t={t}
              splitMode={splitMode}
              theme={config?.theme}
            />
          )}
        </div>
      </div>
    </SectionThemeWrapper>
  );
}
