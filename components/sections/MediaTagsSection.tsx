'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useViewState } from '@/context/ViewStateContext';
import { supabase } from '@/lib/supabase';
import { Instagram, Twitter, Hash, Facebook, Youtube } from 'lucide-react';
import { useTranslations } from 'next-intl';

// -- Types --------------------------------------------------------------------

interface MediaPost {
  id: string;
  event_id: string | null;
  platform: string;
  title: string | null;
  caption: string | null;
  post_url: string;
  thumbnail: string | null;
  artist: string;
  post_date: string;
  views: number; likes: number; comments: number; shares: number; saves: number;
  goal_views: number; goal_likes: number; goal_comments: number; goal_shares: number; goal_saves: number;
  hashtags: string[];
  is_focus: boolean;
  is_visible: boolean;
}

interface MediaEvent {
  id: string;
  title: string;
  hashtags: string[];
  is_active: boolean;
  media_posts: MediaPost[];
}

// -- Constants ----------------------------------------------------------------

const PLATFORM_META: Record<string, { label: string; color: string; bg: string }> = {
  instagram: { label: 'Instagram', color: '#C13584', bg: '#C1358410' },
  x:         { label: 'X (Twitter)', color: 'var(--primary)', bg: 'var(--color-surface)' },
  tiktok:    { label: 'TikTok',    color: 'var(--deep-dark)', bg: '#FE2C5510' },
  youtube:   { label: 'YouTube',   color: '#FF0000', bg: '#FF000010' },
  facebook:  { label: 'Facebook',  color: '#0EA5E9', bg: '#0EA5E910' },
  threads:   { label: 'Threads',   color: 'var(--primary)', bg: 'var(--color-surface)' },
  weibo:     { label: 'Weibo',     color: '#E6162D', bg: '#E6162D10' },
  rednote:   { label: 'RedNote',   color: '#FF2442', bg: '#FF244210' },
};

function PlatformIcon({ platform, color }: { platform: string; color: string }) {
  switch (platform) {
    case 'instagram': return <Instagram className="w-4 h-4" style={{ color }} />;
    case 'x':         return <Twitter   className="w-4 h-4" style={{ color }} />;
    case 'youtube':   return <Youtube   className="w-4 h-4" style={{ color }} />;
    case 'facebook':  return <Facebook  className="w-4 h-4" style={{ color }} />;
    default:          return <Hash      className="w-4 h-4" style={{ color }} />;
  }
}

const METRIC_DEFS = [
  { key: 'views',    goal: 'goal_views',    icon: '👁️' },
  { key: 'likes',    goal: 'goal_likes',    icon: '❤️' },
  { key: 'comments', goal: 'goal_comments', icon: '💬' },
  { key: 'shares',   goal: 'goal_shares',   icon: '🔄' },
  { key: 'saves',    goal: 'goal_saves',    icon: '🔖' },
] as const;

// -- Helpers ------------------------------------------------------------------

const fmtNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

// -- Sub-components -----------------------------------------------------------

function MetricBar({ icon, value, goal }: { icon: string; value: number; goal: number }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const done = goal > 0 && value >= goal;
  return (
    <div className="flex-1 min-w-0 space-y-1">
      <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest leading-none gap-1">
        <span className="opacity-60">{icon}</span>
        <span className={`tabular-nums truncate ${done ? 'text-green-500' : 'text-muted'}`}>
          {fmtNum(value)}{goal > 0 ? ` / ${fmtNum(goal)}` : ''}
        </span>
      </div>
      <div className="h-0.5 rounded-full bg-theme/30 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${done ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-namtan-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PostCard({ post, eventTitle, t }: { post: MediaPost & { eventTitle: string }; eventTitle: string; t: ReturnType<typeof useTranslations> }) {
  const pm = PLATFORM_META[post.platform] ?? { label: post.platform, color: 'var(--muted)', bg: 'var(--color-surface)' };
  const hasGoals = METRIC_DEFS.some(m => (post[m.goal as keyof MediaPost] as number ?? 0) > 0);
  const shownMetrics = METRIC_DEFS.filter(
    m => (post[m.key as keyof MediaPost] as number ?? 0) > 0 || (post[m.goal as keyof MediaPost] as number ?? 0) > 0
  );

  const inner = (
    <div className="group flex gap-5 p-5 rounded-2xl border border-theme/60 bg-surface hover:border-accent/40 hover:shadow-lg transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full opacity-10 group-hover:opacity-100 transition-opacity" style={{ background: pm.color }} />
      
      {/* Platform icon */}
      <div
        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border border-theme/40 bg-panel group-hover:scale-110 transition-transform duration-500 shadow-sm"
      >
        <PlatformIcon platform={post.platform} color={pm.color} />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border"
            style={{ color: pm.color, background: `${pm.color}10`, borderColor: `${pm.color}20` }}
          >
            {pm.label}
          </span>
          {post.is_focus && (
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-film-primary/10 text-film-primary border border-film-primary/20">
               {t('mediaTags.focus')}
            </span>
          )}
          {eventTitle && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40 truncate ml-auto">
              {eventTitle}
            </span>
          )}
        </div>

        {/* Title / caption */}
        {(post.title || post.caption) && (
          <p className="text-sm font-display text-primary leading-snug group-hover:text-accent transition-colors truncate">
            {post.title || post.caption}
          </p>
        )}

        {/* Metrics with goal bars */}
        {shownMetrics.length > 0 && (
          <div className="flex gap-4 pt-1">
            {shownMetrics.map(m => (
              <MetricBar
                key={m.key}
                icon={m.icon}
                value={post[m.key as keyof MediaPost] as number ?? 0}
                goal={hasGoals ? (post[m.goal as keyof MediaPost] as number ?? 0) : 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return post.post_url ? (
    <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="block">
      {inner}
    </a>
  ) : (
    <div>{inner}</div>
  );
}

// -- Main Section -------------------------------------------------------------

type PostWithEvent = MediaPost & { eventTitle: string };

interface MediaTagsSectionProps {
  initialEvents?: MediaEvent[];
}

export function MediaTagsSection({ initialEvents }: MediaTagsSectionProps = {}) {
  const { state } = useViewState();
  const t = useTranslations();
  const [events, setEvents] = useState<MediaEvent[]>(initialEvents ?? []);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [loading, setLoading] = useState(!initialEvents);

  useEffect(() => {
    if (initialEvents !== undefined) return;
    supabase
      .from('media_events')
      .select('id, title, hashtags, is_active, media_posts(*)')
      .eq('is_active', true)
      .order('start_date', { ascending: false, nullsFirst: true })
      .then(({ data }) => {
        setEvents((data as MediaEvent[]) ?? []);
        setLoading(false);
      })
      .then(undefined, () => setLoading(false));
  }, [initialEvents]);

  // All visible posts with their event title attached
  const allPosts: PostWithEvent[] = events.flatMap(ev =>
    (ev.media_posts ?? [])
      .filter(p => p.is_visible)
      .map(p => ({ ...p, eventTitle: ev.title }))
  );

  // Filter by artist view state
  const artistFiltered = allPosts.filter(p => {
    if (state === 'both' || state === 'lunar') return true;
    return p.artist === state || p.artist === 'both';
  });

  // Filter by selected event
  const displayed = selectedEventId === 'all'
    ? artistFiltered
    : artistFiltered.filter(p => p.event_id === selectedEventId);

  // Hashtags from selected event(s)
  const hashtags = Array.from(new Set(
    (selectedEventId === 'all' ? events : events.filter(e => e.id === selectedEventId))
      .flatMap(e => e.hashtags ?? [])
  ));

  const multipleEvents = events.length > 1;

  return (
    <section id="media-tags" className="py-24 md:py-32 bg-[var(--color-bg)] transition-colors duration-500 relative">
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 md:mb-16 pb-6 border-b border-theme/40">
          <div>
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]"
            >
              {t('mediaTags.sub')}
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-section text-primary leading-tight font-light"
            >
              {t('mediaTags.titleLine1')} <br className="md:hidden" />{t('mediaTags.titleLine2')}
            </motion.h2>
          </div>
          <Link href="/engage/media" className="text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors flex items-center gap-2 group mt-6 md:mt-0">
             {t('mediaTags.exploreGallery')} <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Event filter tabs */}
        {!loading && multipleEvents && (
          <motion.div
            className="flex flex-wrap gap-2 mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => setSelectedEventId('all')}
              className={`text-xs font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border transition-all duration-300 ${
                selectedEventId === 'all'
                  ? 'bg-primary text-deep-dark border-primary shadow-md'
                  : 'border-theme/60 text-muted hover:border-accent hover:text-accent'
              }`}
            >
              {t('mediaTags.allEvents')}
            </button>
            {events.map(ev => (
              <button
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`text-xs font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full border transition-all duration-300 ${
                  selectedEventId === ev.id
                    ? 'bg-primary text-deep-dark border-primary shadow-md'
                    : 'border-theme/60 text-muted hover:border-accent hover:text-accent'
                }`}
              >
                {ev.title}
              </button>
            ))}
          </motion.div>
        )}

        <div className="grid md:grid-cols-5 gap-12">
          {/* Media list */}
          <div className="md:col-span-3 space-y-4">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-24 rounded-2xl bg-surface border border-theme/40 animate-pulse" />
                ))}
              </div>
            )}
            {!loading && displayed.length === 0 && (
              <div className="py-20 text-center bg-surface/50 border border-theme/40 rounded-3xl opacity-60">
                <p className="text-sm font-bold uppercase tracking-widest">{t('mediaTags.empty')}</p>
                <Link href="/engage/media" className="inline-flex mt-5 text-xs tracking-[0.2em] font-bold uppercase text-muted hover:text-accent transition-colors">
                  {t('mediaTags.emptyAction')}
                </Link>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {displayed.slice(0, 6).map((post, i) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PostCard
                    post={post}
                    eventTitle={multipleEvents && selectedEventId === 'all' ? post.eventTitle : ''}
                    t={t}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Hashtags column */}
          <div className="md:col-span-2">
            <div className="sticky top-32">
              <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em] mb-6 border-b border-theme/40 pb-2">
                {t('mediaTags.activeHashtags')}
              </h3>
              {!loading && hashtags.length === 0 && (
                <p className="text-sm text-muted opacity-60 italic">{t('mediaTags.noHashtags')}</p>
              )}
              <div className="flex flex-wrap gap-2.5">
                {hashtags.map((tag, i) => (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigator.clipboard?.writeText(tag)}
                    className="px-4 py-2 rounded-xl text-xs md:text-sm font-thai border border-theme/60 bg-surface text-primary hover:border-accent hover:text-accent hover:shadow-md transition-all cursor-pointer group flex items-center gap-2"
                    title={t('mediaTags.copyTag')}
                  >
                    <span className="opacity-40 group-hover:opacity-100 transition-opacity">#</span>
                    {tag.startsWith('#') ? tag.slice(1) : tag}
                  </motion.button>
                ))}
              </div>
              <div className="mt-12 p-8 rounded-3xl border border-theme/40 bg-panel/30 hidden md:block">
                 <p className="text-xs font-bold text-muted uppercase tracking-[0.2em] mb-3">{t('mediaTags.communityNote')}</p>
                 <p className="text-xs text-muted leading-relaxed font-body">{t('mediaTags.communityNoteBody')}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
