'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useViewState } from '@/context/ViewStateContext';
import type { HomepageSectionConfig, PageMotionConfig } from '@/lib/homepage-sections';
import { toEnterMotionBinding, toWhileInViewBinding, useSectionMotion } from '@/lib/visual';
import { supabase } from '@/lib/supabase';
import { Instagram, Twitter, Hash, Facebook, Youtube } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  getMediaTagsStyles,
  getPlatformAccentStyle,
  getPlatformBadgeStyle,
  getPlatformMeta,
  resolveMediaTagsLimit,
  resolveMediaTagsTitle,
} from './mediaTags.styles';

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

function PlatformIcon({ platform, color }: { platform: string; color: string }) {
  switch (platform) {
    case 'instagram': return <Instagram className="w-4 h-4" style={{ color }} />;
    case 'x':         return <Twitter   className="w-4 h-4" style={{ color }} />;
    case 'youtube':   return <Youtube   className="w-4 h-4" style={{ color }} />;
    case 'facebook':  return <Facebook  className="w-4 h-4" style={{ color }} />;
    default:          return <Hash      className="w-4 h-4" style={{ color }} />;
  }
}

// -- Sub-components -----------------------------------------------------------

function MetricBar({
  icon,
  value,
  goal,
  styles,
}: {
  icon: string;
  value: number;
  goal: number;
  styles: ReturnType<typeof getMediaTagsStyles>;
}) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const done = goal > 0 && value >= goal;
  return (
    <div className="flex-1 min-w-0 space-y-1">
      <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest leading-none gap-1">
        <span className={styles.metricLabelClass}>{icon}</span>
        <span className={`tabular-nums truncate ${done ? styles.metricValueDoneClass : styles.metricValuePendingClass}`}>
          {fmtNum(value)}{goal > 0 ? ` / ${fmtNum(goal)}` : ''}
        </span>
      </div>
      <div className={styles.metricBarTrackClass}>
        <div
          className={done ? styles.metricBarFillDoneClass : styles.metricBarFillPendingClass}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PostCard({
  post,
  eventTitle,
  t,
  styles,
}: {
  post: MediaPost & { eventTitle: string };
  eventTitle: string;
  t: ReturnType<typeof useTranslations>;
  styles: ReturnType<typeof getMediaTagsStyles>;
}) {
  const pm = getPlatformMeta(post.platform);
  const hasGoals = METRIC_DEFS.some(m => (post[m.goal as keyof MediaPost] as number ?? 0) > 0);
  const shownMetrics = METRIC_DEFS.filter(
    m => (post[m.key as keyof MediaPost] as number ?? 0) > 0 || (post[m.goal as keyof MediaPost] as number ?? 0) > 0
  );

  const inner = (
    <div className={styles.postCardClass}>
      <div className={styles.postCardAccentClass} style={getPlatformAccentStyle(pm.color)} />

      <div className={styles.platformIconWrapperClass}>
        <PlatformIcon platform={post.platform} color={pm.color} />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className={styles.platformBadgeClass} style={getPlatformBadgeStyle(pm.color)}>
            {pm.label}
          </span>
          {post.is_focus && (
            <span className={styles.focusBadgeClass}>
               {t('mediaTags.focus')}
            </span>
          )}
          {eventTitle && (
            <span className={styles.eventTitleBadgeClass}>
              {eventTitle}
            </span>
          )}
        </div>

        {(post.title || post.caption) && (
          <p className={styles.postTitleClass}>
            {post.title || post.caption}
          </p>
        )}

        {shownMetrics.length > 0 && (
          <div className="flex gap-4 pt-1">
            {shownMetrics.map(m => (
              <MetricBar
                key={m.key}
                icon={m.icon}
                value={post[m.key as keyof MediaPost] as number ?? 0}
                goal={hasGoals ? (post[m.goal as keyof MediaPost] as number ?? 0) : 0}
                styles={styles}
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
  config?: Pick<HomepageSectionConfig, 'limit' | 'layout' | 'title' | 'motion'>;
  pageMotion?: PageMotionConfig;
}

export function MediaTagsSection({ initialEvents, config, pageMotion }: MediaTagsSectionProps = {}) {
  const { state } = useViewState();
  const t = useTranslations();
  const styles = getMediaTagsStyles({ layout: config?.layout });
  const sectionMotion = useSectionMotion(pageMotion, config?.motion);
  const headerMotion = toWhileInViewBinding(sectionMotion);
  const titleMotion = toWhileInViewBinding(sectionMotion, 1);
  const titleLines = resolveMediaTagsTitle(
    t('mediaTags.titleLine1'),
    t('mediaTags.titleLine2'),
    config?.title,
  );
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

  const allPosts: PostWithEvent[] = events.flatMap(ev =>
    (ev.media_posts ?? [])
      .filter(p => p.is_visible)
      .map(p => ({ ...p, eventTitle: ev.title }))
  );

  const artistFiltered = allPosts.filter(p => {
    if (state === 'both' || state === 'lunar') return true;
    return p.artist === state || p.artist === 'both';
  });

  const displayed = selectedEventId === 'all'
    ? artistFiltered
    : artistFiltered.filter(p => p.event_id === selectedEventId);

  const hashtags = Array.from(new Set(
    (selectedEventId === 'all' ? events : events.filter(e => e.id === selectedEventId))
      .flatMap(e => e.hashtags ?? [])
  ));

  const multipleEvents = events.length > 1;
  const limit = resolveMediaTagsLimit(config?.limit);

  return (
    <section id="media-tags" className={styles.sectionClass}>
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">

        <div className={styles.headerClass}>
          <div>
            <motion.p
              initial={headerMotion.initial}
              whileInView={headerMotion.whileInView}
              viewport={headerMotion.viewport}
              transition={headerMotion.transition}
              className={styles.overlineClass}
            >
              {t('mediaTags.sub')}
            </motion.p>
            <motion.h2
              initial={titleMotion.initial}
              whileInView={titleMotion.whileInView}
              viewport={titleMotion.viewport}
              transition={titleMotion.transition}
              className={styles.titleClass}
            >
              {titleLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < titleLines.length - 1 ? <br className="md:hidden" /> : null}
                </span>
              ))}
            </motion.h2>
          </div>
          <Link href="/engage/media" className={styles.exploreLinkClass}>
             {t('mediaTags.exploreGallery')} <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {!loading && multipleEvents && (
          <motion.div
            className={styles.eventTabsWrapperClass}
            initial={headerMotion.initial}
            whileInView={headerMotion.whileInView}
            viewport={headerMotion.viewport}
            transition={headerMotion.transition}
          >
            <button
              onClick={() => setSelectedEventId('all')}
              className={styles.eventFilterTabClass(selectedEventId === 'all')}
            >
              {t('mediaTags.allEvents')}
            </button>
            {events.map(ev => (
              <button
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={styles.eventFilterTabClass(selectedEventId === ev.id)}
              >
                {ev.title}
              </button>
            ))}
          </motion.div>
        )}

        <div className={styles.gridClass}>
          <div className={styles.mediaListClass}>
            {loading && (
              <div className={styles.loadingWrapperClass}>
                {[...Array(limit)].map((_, n) => (
                  <div key={n} className={styles.skeletonClass} />
                ))}
              </div>
            )}
            {!loading && displayed.length === 0 && (
              <div className={styles.emptyStateClass}>
                <p className="text-sm font-bold uppercase tracking-widest">{t('mediaTags.empty')}</p>
                <Link href="/engage/media" className={styles.emptyActionClass}>
                  {t('mediaTags.emptyAction')}
                </Link>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {displayed.slice(0, limit).map((post, i) => {
                const itemMotion = toEnterMotionBinding(sectionMotion, i);
                return (
                <motion.div
                  key={post.id}
                  layout={!sectionMotion.disabled}
                  initial={itemMotion.initial}
                  animate={itemMotion.animate}
                  exit={itemMotion.exit}
                  transition={itemMotion.transition}
                >
                  <PostCard
                    post={post}
                    eventTitle={multipleEvents && selectedEventId === 'all' ? post.eventTitle : ''}
                    t={t}
                    styles={styles}
                  />
                </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className={styles.hashtagsColumnClass}>
            <div className={styles.hashtagsInnerClass}>
              <h3 className={styles.hashtagsHeadingClass}>
                {t('mediaTags.activeHashtags')}
              </h3>
              {!loading && hashtags.length === 0 && (
                <p className={styles.hashtagsEmptyClass}>{t('mediaTags.noHashtags')}</p>
              )}
              <div className="flex flex-wrap gap-2.5">
                {hashtags.map((tag, i) => {
                  const tagMotion = toWhileInViewBinding(sectionMotion, i);
                  return (
                  <motion.button
                    key={tag}
                    initial={tagMotion.initial}
                    whileInView={tagMotion.whileInView}
                    viewport={tagMotion.viewport}
                    transition={tagMotion.transition}
                    onClick={() => navigator.clipboard?.writeText(tag)}
                    className={styles.hashtagButtonClass}
                    title={t('mediaTags.copyTag')}
                  >
                    <span className="opacity-40 group-hover:opacity-100 transition-opacity">#</span>
                    {tag.startsWith('#') ? tag.slice(1) : tag}
                  </motion.button>
                  );
                })}
              </div>
              <div className={styles.communityNoteClass}>
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
