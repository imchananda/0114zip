'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { useViewState } from '@/context/ViewStateContext';
import { Link } from '@/i18n/routing';
import {
  HomeArtistProfile,
  HomeEngData,
  HomeContentItem,
  HomeIgPost,
} from '@/lib/homepage-data';

/* ── Props ─────────────────────────────────────────────────────────── */

interface ProfileSectionProps {
  profiles?: Record<string, HomeArtistProfile>;
  engData?: HomeEngData;
  ntWorksCount?: number | null;
  flWorksCount?: number | null;
  allContent?: HomeContentItem[];
  config?: { theme?: string; layout?: string };
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function fmtDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  if (n > 0) return `$${n.toFixed(0)}`;
  return '—';
}

function sumEmv(posts: HomeIgPost[] | undefined): number {
  if (!posts?.length) return 0;
  return posts.reduce((s, p) => s + (p.emv ?? 0), 0);
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

/* ── Starfield (CSS) ──────────────────────────────────────────────── */

const STARFIELD_STYLE: import('react').CSSProperties = {
  backgroundImage: [
    'radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.5), transparent)',
    'radial-gradient(1.5px 1.5px at 22% 38%, rgba(255,255,255,0.25), transparent)',
    'radial-gradient(1px 1px at 45% 8%, rgba(255,255,255,0.4), transparent)',
    'radial-gradient(1px 1px at 78% 22%, rgba(255,255,255,0.3), transparent)',
    'radial-gradient(1.5px 1.5px at 92% 60%, rgba(255,255,255,0.45), transparent)',
  ].join(', '),
  backgroundSize: '100% 100%',
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

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
}) {
  const id = side === 'left' ? 'namtan' : 'film';
  const textAlign = side === 'right' ? 'items-end text-right' : 'items-start text-left';
  const unopt = shouldUnoptimizedImage(profile?.photo_url);
  const radius =
    splitMode === 'single'
      ? { tl: '1.25rem', tr: '1.25rem', bl: '1.25rem', br: '1.25rem' }
      : side === 'left'
        ? { tl: '1.25rem', tr: 0, bl: '1.25rem', br: 0 }
        : { tl: 0, tr: '1.25rem', bl: 0, br: '1.25rem' };

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

  return (
    <div
      className="relative min-h-[100svh] lg:min-h-[min(100svh,920px)] flex flex-col w-full overflow-hidden"
      style={{
        borderTopLeftRadius: radius.tl,
        borderBottomLeftRadius: radius.bl,
        borderTopRightRadius: radius.tr,
        borderBottomRightRadius: radius.br,
      }}
    >
      {/* Cinematic base + side tint (mockup: blue left / gold right wash) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: side === 'left'
            ? 'linear-gradient(180deg, #030a18 0%, #050c1a 40%, #060d1c 100%)'
            : 'linear-gradient(180deg, #120c02 0%, #0f0a00 50%, #0a0800 100%)',
        }}
      />
      {profile?.photo_url && (
        <div className="absolute inset-0 z-[1]">
          <Image
            src={profile.photo_url}
            alt={profile.nickname || id}
            fill
            unoptimized={unopt}
            className={
              side === 'left'
                ? 'object-cover object-top object-right opacity-90'
                : 'object-cover object-top object-left opacity-90'
            }
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={side === 'left'}
          />
        </div>
      )}

      {/* Orbit / glow + starfield + vignette */}
      <div className="absolute inset-0 z-[2] pointer-events-none" style={STARFIELD_STYLE} />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: side === 'left'
            ? 'radial-gradient(ellipse 90% 70% at 20% 30%, rgba(105,188,220,0.2), transparent 55%)'
            : 'radial-gradient(ellipse 90% 70% at 80% 30%, rgba(248,232,95,0.12), transparent 55%)',
        }}
      />
      <div
        className="absolute inset-0 z-[2] pointer-events-none mix-blend-multiply"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)',
        }}
      />
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #03050c 0%, rgba(3,5,12,0.4) 45%, rgba(3,5,12,0.2) 100%)',
        }}
      />
      <div
        className={`absolute z-[2] pointer-events-none opacity-30 ${
          side === 'left' ? '-left-[20%] top-[10%] w-[70%] aspect-square' : '-right-[20%] top-[10%] w-[70%] aspect-square'
        }`}
        style={{
          border: `1px solid ${accentHex}`,
          borderRadius: '50%',
          filter: 'blur(0.5px)',
        }}
      />

      {/* Foreground: content at bottom, mockup layout */}
      <div
        className={`relative z-10 flex flex-col flex-1 justify-end p-6 sm:p-8 md:p-10 lg:p-12 ${textAlign}`}
      >
        <div className="max-w-md w-full" style={side === 'right' ? { marginLeft: 'auto' } : undefined}>
          <h3
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-white leading-[0.95] drop-shadow-2xl"
            style={{ fontFeatureSettings: '"ss02"', textShadow: `0 0 40px ${accentHex}33` }}
          >
            {profile?.nickname?.toUpperCase() || id.toUpperCase()}
          </h3>
          <div
            className={`mt-2 flex items-center gap-2 ${side === 'right' ? 'justify-end' : 'justify-start'}`}
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
            <p className="text-white/75 text-sm sm:text-base leading-relaxed mt-4 font-thai line-clamp-4">
              {desc}
            </p>
          )}

          <Link
            href={`/artist/${id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/95 backdrop-blur-sm transition-all hover:brightness-110"
            style={{ borderColor: `${accentHex}99`, backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            {t('profile.viewProfile')}
            <span className="text-lg leading-none" aria-hidden>
              →
            </span>
          </Link>

          {/* Social stats: compact row (closer to mockup vertical list → we use 3 clear rows) */}
          <ul className={`mt-8 space-y-2.5 ${side === 'right' ? 'ml-auto' : ''}`}>
            {ig > 0 && (
              <li className="flex items-center gap-3 w-fit">
                <span className="shrink-0" style={{ color: accentHex }}>
                  <IgIcon className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <span className="text-xl sm:text-2xl font-display font-semibold text-white tabular-nums">
                    {fmt(ig)}
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-white/45">Instagram</span>
                </div>
              </li>
            )}
            {x > 0 && (
              <li className="flex items-center gap-3 w-fit">
                <span className="shrink-0" style={{ color: accentHex }}>
                  <XIcon className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <span className="text-xl sm:text-2xl font-display font-semibold text-white tabular-nums">
                    {fmt(x)}
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-white/45">X</span>
                </div>
              </li>
            )}
            {works != null && works > 0 && (
              <li className="flex items-center gap-3 w-fit">
                <span className="shrink-0" style={{ color: accentHex }}>
                  <FilmIcon className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <span className="text-xl sm:text-2xl font-display font-semibold text-white tabular-nums">
                    {works}
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-white/45">
                    {t('profile.totalWorks')}
                  </span>
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Latest Works — อยู่ในคอลัมน์เดียวกับฮีโร่ (รูป mockup) */}
        {latestWorks.length > 0 && (
          <div className="mt-8 w-full max-w-md border-t border-white/10 pt-5">
            <div className={`flex items-center justify-between mb-3 ${textAlign} flex-wrap gap-2`}>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                {t('profile.latestWorks')}
              </span>
              <Link
                href={`/artist/${id}?tab=works`}
                className="text-[10px] font-bold uppercase tracking-[0.15em] hover:opacity-80"
                style={{ color: accentHex }}
              >
                {t('profile.viewAll')}
              </Link>
            </div>
            <div className="flex gap-2 sm:gap-3">
              {latestWorks.map((work) => (
                <div key={work.id} className="flex-1 min-w-0 group/work">
                  <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-black/30 ring-1 ring-white/10">
                    {work.image && (
                      <Image
                        src={work.image}
                        alt={lang === 'th' ? work.title_thai || work.title : work.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover/work:scale-105"
                        sizes="120px"
                      />
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-white/90 font-medium truncate mt-1.5">
                    {lang === 'th' ? work.title_thai || work.title : work.title}
                  </p>
                  <p className="text-[8px] uppercase tracking-wider text-white/40">
                    {getTypeLabel(work.content_type)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
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
}: ProfileSectionProps) {
  const { state } = useViewState();
  const t = useTranslations();
  const lang = useLocale();

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

  const combinedFollowers =
    Object.values(ntSnap).reduce((s, v) => s + v, 0) + Object.values(flSnap).reduce((s, v) => s + v, 0);
  const emvNt = sumEmv(engData?.igPosts?.namtan);
  const emvFl = sumEmv(engData?.igPosts?.film);
  const emvTotal = emvNt + emvFl;
  const splitMode: 'pair' | 'single' = showNamtan && showFilm ? 'pair' : 'single';

  const theme = config?.theme || 'cinematic';
  const showTogetherBar = config?.layout !== 'hide';
  
  const sectionClasses = theme === 'clean' 
    ? "relative z-0 scroll-mt-24 bg-[var(--color-bg)] text-primary"
    : "relative z-0 scroll-mt-24 bg-[#03050c] text-white";
    
  const textPrimary = theme === 'clean' ? 'text-primary' : 'text-white';
  const textMuted = theme === 'clean' ? 'text-muted' : 'text-white/50';
  const textSub = theme === 'clean' ? 'text-accent' : 'text-cyan-300/80';
  const kickerColor = theme === 'clean' ? 'text-muted/60' : 'text-white/40';

  return (
    <section
      id="profile"
      className={sectionClasses}
    >
      {/* full-bleed: break out of page container without fighting parent */}
      <div className="w-full max-w-[100vw] overflow-x-hidden">
        <div className="mx-auto max-w-[1800px] px-4 sm:px-6 md:px-8 pt-14 pb-4">
          <p className={`text-[10px] uppercase tracking-[0.3em] ${kickerColor} mb-1`}>{t('profile.sectionKicker')}</p>
          <p className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] ${textSub} mb-2`}>
            {t('profile.sub')}
          </p>
          <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight ${textPrimary}`}>
            {t('profile.title')}
          </h2>
          <p className={`text-sm ${textMuted} mt-1 font-thai max-w-2xl`}>{t('profile.subThai')}</p>
        </div>

        {/* Split: 2 columns — น้ำตาล | ฟิล์ม */}
        <div
          className={`
            grid w-full
            ${showNamtan && showFilm ? 'lg:grid-cols-2 gap-0' : 'grid-cols-1'}
          `}
        >
          {showNamtan && (
            <ArtistSplitPanel
              side="left"
              profile={profiles.namtan}
              snap={ntSnap}
              works={ntWorksCount ?? null}
              latestWorks={ntLatest}
              accentHex="#69bcdc"
              orbitLabel="BLUE"
              getTypeLabel={contentLabel}
              lang={lang}
              t={t}
              splitMode={splitMode}
            />
          )}

          {showFilm && (
            <ArtistSplitPanel
              side="right"
              profile={profiles.film}
              snap={flSnap}
              works={flWorksCount ?? null}
              latestWorks={flLatest}
              accentHex="#f8e85f"
              orbitLabel="YELLOW"
              getTypeLabel={contentLabel}
              lang={lang}
              t={t}
              splitMode={splitMode}
            />
          )}
        </div>

        {/* Mobile: thin divider between when stacked */}
        {showNamtan && showFilm && <div className={`lg:hidden h-px w-full ${theme === 'clean' ? 'bg-theme/40' : 'bg-white/10'}`} />}

        {/* Together bar */}
        {showNamtan && showFilm && showTogetherBar && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mx-4 sm:mx-6 md:mx-8 max-w-[1800px] md:mx-auto mt-2 mb-12 rounded-2xl border p-5 sm:p-6 md:p-8 backdrop-blur-md
              ${theme === 'clean' 
                ? 'border-theme/40 bg-surface shadow-sm' 
                : 'border-white/10 bg-[#060912]/95 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]'}`}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
              <div className={`shrink-0 md:border-r md:pr-8 ${theme === 'clean' ? 'md:border-theme/40' : 'md:border-white/10'}`}>
                <h4 className={`font-display text-xl sm:text-2xl font-bold uppercase tracking-tight ${textPrimary}`}>
                  {t('profile.together')}
                </h4>
                <p className={`text-xs mt-0.5 ${theme === 'clean' ? 'text-muted' : 'text-white/45'}`}>{t('profile.togetherSub')}</p>
              </div>
              <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {combinedFollowers > 0 && (
                  <div className={`flex items-center gap-2 sm:gap-3 rounded-xl p-2.5 sm:p-3 ring-1 ${theme === 'clean' ? 'bg-panel ring-theme/40' : 'bg-white/[0.04] ring-white/5'}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-500 dark:text-cyan-300">
                      <UsersIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={`text-base sm:text-lg font-display font-semibold tabular-nums ${textPrimary}`}>
                        {fmt(combinedFollowers)}
                      </div>
                      <div className={`text-[8px] uppercase tracking-wider leading-tight ${theme === 'clean' ? 'text-muted' : 'text-white/40'}`}>
                        {t('profile.totalFollowers')}
                      </div>
                    </div>
                  </div>
                )}
                {emvTotal > 0 && (
                  <div className={`flex items-center gap-2 sm:gap-3 rounded-xl p-2.5 sm:p-3 ring-1 ${theme === 'clean' ? 'bg-panel ring-theme/40' : 'bg-white/[0.04] ring-white/5'}`}>
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300/90 flex items-center justify-center text-[10px] font-bold">E</div>
                    <div>
                      <div className={`text-base sm:text-lg font-display font-semibold tabular-nums ${textPrimary}`}>
                        {fmtDollar(emvTotal)}
                      </div>
                      <div className={`text-[8px] uppercase tracking-wider leading-tight line-clamp-2 ${theme === 'clean' ? 'text-muted' : 'text-white/40'}`}>
                        {t('profile.emv')}
                      </div>
                    </div>
                  </div>
                )}
                {(ntWorksCount ?? 0) + (flWorksCount ?? 0) > 0 && (
                  <div className={`flex items-center gap-2 sm:gap-3 rounded-xl p-2.5 sm:p-3 ring-1 ${theme === 'clean' ? 'bg-panel ring-theme/40' : 'bg-white/[0.04] ring-white/5'}`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-200">
                      <FilmIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={`text-base sm:text-lg font-display font-semibold tabular-nums ${textPrimary}`}>
                        {(ntWorksCount ?? 0) + (flWorksCount ?? 0)}
                      </div>
                      <div className={`text-[8px] uppercase tracking-wider leading-tight ${theme === 'clean' ? 'text-muted' : 'text-white/40'}`}>
                        {t('profile.totalWorks')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className={`text-center text-[9px] uppercase tracking-[0.2em] mt-4 ${theme === 'clean' ? 'text-muted/50' : 'text-white/30'}`}>
              {t('profile.dataRange')}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
