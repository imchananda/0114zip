'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useViewState } from '@/context/ViewStateContext';
import { supabase } from '@/lib/supabase';

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
  // Instagram: official magenta-pink from brand guidelines
  instagram: { label: 'Instagram', color: '#C13584', bg: '#C1358420' },
  // X (formerly Twitter): official black
  x:         { label: 'X',         color: '#000000', bg: '#00000015' },
  // TikTok: black icon, red-tinted bg
  tiktok:    { label: 'TikTok',    color: '#000000', bg: '#FE2C5520' },
  // YouTube: official red
  youtube:   { label: 'YouTube',   color: '#FF0000', bg: '#FF000020' },
  // Facebook: sky-blue
  facebook:  { label: 'Facebook',  color: '#0EA5E9', bg: '#0EA5E920' },
  // Threads: official black
  threads:   { label: 'Threads',   color: '#000000', bg: '#00000015' },
  // Weibo: official red-orange
  weibo:     { label: 'Weibo',     color: '#E6162D', bg: '#E6162D20' },
  // RedNote (Xiaohongshu): official red
  rednote:   { label: 'RedNote',   color: '#FF2442', bg: '#FF244220' },
};

function PlatformIcon({ platform, color }: { platform: string; color: string }) {
  const props = { width: 20, height: 20, fill: color, viewBox: '0 0 24 24' };
  switch (platform) {
    case 'instagram':
      return (
        <svg {...props}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'x':
      return (
        <svg {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...props}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...props}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...props}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'threads':
      return (
        <svg {...props}>
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.851 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 1.868-.012 3.454-.373 4.714-1.073 1.613-.875 2.507-2.183 2.657-3.888.092-.997-.043-1.832-.398-2.487-.355-.652-.924-1.17-1.69-1.544-.22 1.567-.805 2.835-1.741 3.767-1.178 1.171-2.79 1.813-4.66 1.856-1.484.032-2.82-.404-3.757-1.227-.99-.866-1.519-2.104-1.484-3.491.033-1.337.594-2.506 1.575-3.294.93-.748 2.197-1.121 3.667-1.073 1.243.042 2.311.359 3.18.942.72.495 1.273 1.14 1.641 1.916.14-.36.217-.747.228-1.156l.017-.66c.044-1.713-.571-3.098-1.83-4.117-1.1-.886-2.531-1.355-4.253-1.395-3.285-.076-5.678 1.25-6.84 3.807l-1.925-.834c1.53-3.407 4.607-5.171 8.874-5.071 2.173.051 4.05.644 5.577 1.765 1.738 1.287 2.626 3.156 2.565 5.41l-.017.66c-.02.805-.178 1.583-.47 2.313.43.548.762 1.161.985 1.827.423 1.267.405 2.695-.052 4.244-.877 3.002-3.477 4.947-7.426 5.062l-.184.004zm-2.76-8.766c-.384.988.091 2.079 1.055 2.44.972.363 2.111-.145 2.597-1.09.48-.935.133-2-.796-2.349-.93-.348-2.028.039-2.432.96l-.424-.163z" />
        </svg>
      );
    case 'weibo':
      return (
        <svg {...props}>
          <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.611-2.759 5.049-6.739 5.443zm4.138-11.055c.235.086.48-.031.553-.26a4.56 4.56 0 0 0-.875-4.362 4.847 4.847 0 0 0-4.229-1.66.448.448 0 0 0-.395.492.45.45 0 0 0 .492.395 3.955 3.955 0 0 1 3.447 1.348 3.674 3.674 0 0 1 .711 3.523.445.445 0 0 0 .296.524zm1.834-1.049a.69.69 0 0 0 .868-.432 7.179 7.179 0 0 0-1.37-6.831 7.439 7.439 0 0 0-6.498-2.566.693.693 0 0 0 .123 1.38 6.057 6.057 0 0 1 5.292 2.092 5.806 5.806 0 0 1 1.109 5.503.693.693 0 0 0 .476.854zM9.05 17.219c-.384.988.091 2.079 1.055 2.44.972.363 2.111-.145 2.597-1.09.48-.935.133-2-.796-2.349-.93-.348-2.028.039-2.432.96l-.424-.163z" />
        </svg>
      );
    case 'rednote':
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M21.5 7.5h-3v-3a1 1 0 0 0-1-1h-11a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-3h3a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5zm-5 7.5h-2.5v2.5h-1.5v-2.5h-2.5v-1.5h2.5v-2.5h1.5v2.5h2.5v1.5z" />
        </svg>
      );
    default:
      return (
        <svg {...props} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="3" />
        </svg>
      );
  }
}

const METRIC_DEFS = [
  { key: 'views',    goal: 'goal_views',    icon: '\u{1F441}' },
  { key: 'likes',    goal: 'goal_likes',    icon: '\u2764\uFE0F' },
  { key: 'comments', goal: 'goal_comments', icon: '\u{1F4AC}' },
  { key: 'shares',   goal: 'goal_shares',   icon: '\u{1F501}' },
  { key: 'saves',    goal: 'goal_saves',    icon: '\u{1F516}' },
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
    <div className="flex-1 min-w-0 space-y-0.5">
      <div className="flex justify-between text-[10px] leading-none gap-1">
        <span>{icon}</span>
        <span className={`tabular-nums truncate ${done ? 'text-green-500' : 'text-[var(--color-text-muted)]'}`}>
          {fmtNum(value)}{goal > 0 ? `/${fmtNum(goal)}` : ''}
        </span>
      </div>
      <div className="h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-[#6cbfd0]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PostCard({ post, eventTitle }: { post: MediaPost & { eventTitle: string }; eventTitle: string }) {
  const pm = PLATFORM_META[post.platform] ?? { label: post.platform, color: '#888', bg: '#88888820' };
  const hasGoals = METRIC_DEFS.some(m => (post[m.goal as keyof MediaPost] as number ?? 0) > 0);
  const shownMetrics = METRIC_DEFS.filter(
    m => (post[m.key as keyof MediaPost] as number ?? 0) > 0 || (post[m.goal as keyof MediaPost] as number ?? 0) > 0
  );

  const inner = (
    <div className="flex gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)] transition-colors">
      {/* Platform icon */}
      <div
        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: pm.bg }}
      >
        <PlatformIcon platform={post.platform} color={pm.color} />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: pm.color, background: pm.bg }}
          >
            {pm.label}
          </span>
          {post.is_focus && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#fbdf7420] text-[#fbdf74]">
              {'\u2B50'} Focus
            </span>
          )}
          {eventTitle && (
            <span className="text-[10px] text-[var(--color-text-muted)] truncate ml-auto">
              {eventTitle}
            </span>
          )}
        </div>

        {/* Title / caption */}
        {(post.title || post.caption) && (
          <p className="text-xs text-[var(--color-text-muted)] truncate">
            {post.title || post.caption}
          </p>
        )}

        {/* Metrics with goal bars */}
        {shownMetrics.length > 0 && (
          <div className="flex gap-2 pt-0.5">
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

        {/* Post hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {post.hashtags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)]">
                {tag}
              </span>
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

export function MediaTagsSection() {
  const { state } = useViewState();
  const [events, setEvents] = useState<MediaEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
    <section id="media-tags" className="py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-12">

        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-[var(--color-text)]">
              {'\u{1F4F1}'} Media &amp; Tags
            </h2>
            <p className="text-[var(--color-muted)] text-sm mt-1">
              รายการสื่อและแฮชแท็กจากกิจกรรม
            </p>
          </div>
          <Link href="/engage/media" className="hidden sm:block text-sm text-[#6cbfd0] hover:underline shrink-0">
            ดูทั้งหมด &rarr;
          </Link>
        </motion.div>

        {/* Event filter tabs */}
        {!loading && multipleEvents && (
          <motion.div
            className="flex flex-wrap gap-2 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => setSelectedEventId('all')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedEventId === 'all'
                  ? 'bg-[#6cbfd0] border-[#6cbfd0] text-[#141413] font-semibold'
                  : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[#6cbfd0] hover:text-[#6cbfd0]'
              }`}
            >
              ทั้งหมด
            </button>
            {events.map(ev => (
              <button
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedEventId === ev.id
                    ? 'bg-[#6cbfd0] border-[#6cbfd0] text-[#141413] font-semibold'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[#6cbfd0] hover:text-[#6cbfd0]'
                }`}
              >
                {ev.title}
              </button>
            ))}
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Media list */}
          <div className="space-y-2.5">
            {loading && (
              <div className="space-y-2">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-20 rounded-xl bg-[var(--color-border)] animate-pulse" />
                ))}
              </div>
            )}
            {!loading && displayed.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] py-4">ยังไม่มีรายการสื่อ</p>
            )}
            <AnimatePresence mode="popLayout">
              {displayed.slice(0, 6).map((post, i) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PostCard
                    post={post}
                    eventTitle={multipleEvents && selectedEventId === 'all' ? post.eventTitle : ''}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Hashtags */}
          <div>
            <h3 className="text-sm font-normal font-display text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
              แฮชแท็กกิจกรรม
            </h3>
            {!loading && hashtags.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">ยังไม่มีแฮชแท็ก</p>
            )}
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigator.clipboard?.writeText(tag)}
                  className="px-3 py-1.5 rounded-full text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-[#6cbfd0] hover:text-[#6cbfd0] transition-colors cursor-pointer"
                  title="คัดลอก"
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
