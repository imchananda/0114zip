'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import { Instagram, Twitter, Youtube, Facebook, Hash, Eye, Heart, MessageCircle, Share2, Bookmark, Star, ChevronDown, ChevronUp, CalendarDays, ArrowUpRight } from 'lucide-react';
import { Mascot } from '@/components/mascot/Mascot';
import { supabase } from '@/lib/supabase';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zM12 7c-2.757 0-5 2.243-5 5v1h10v-1c0-2.757-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3v-1h6v1c0 1.654-1.346 3-3 3z"/>
  </svg>
);

type Platform = 'instagram' | 'x' | 'tiktok' | 'facebook' | 'youtube' | 'threads' | 'weibo' | 'rednote';
type Artist = 'namtan' | 'film' | 'both';

interface MediaPost {
  id: string;
  event_id: string | null;
  platform: Platform;
  title: string | null;
  post_url: string;
  thumbnail: string | null;
  caption: string | null;
  artist: Artist;
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
  description: string | null;
  hashtags: string[];
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  media_posts: MediaPost[];
}

const PLATFORM_MAP: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  instagram: { icon: Instagram,   color: '#E4405F', label: 'Instagram' },
  x:         { icon: Twitter,     color: '#1DA1F2', label: 'X' },
  tiktok:    { icon: TikTokIcon,  color: '#FF0050', label: 'TikTok' },
  youtube:   { icon: Youtube,     color: '#FF0000', label: 'YouTube' },
  facebook:  { icon: Facebook,    color: '#1877F2', label: 'Facebook' },
  threads:   { icon: ThreadsIcon, color: '#888888', label: 'Threads' },
  weibo:     { icon: Hash,        color: '#FF8200', label: 'Weibo' },
  rednote:   { icon: Hash,        color: '#FF2442', label: 'RedNote' },
};

const ARTIST_OPTIONS = [
  { id: 'all',    label: 'ทุกคน' },
  { id: 'both',   label: '💙💛 คู่' },
  { id: 'namtan', label: '💙 น้ำตาล' },
  { id: 'film',   label: '💛 ฟิล์ม' },
];

const formatNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

function formatDateRange(start: string | null, end: string | null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `เริ่ม ${fmt(start)}`;
  if (end) return `ถึง ${fmt(end)}`;
  return null;
}

interface GoalBarProps { icon: React.ReactNode; label: string; value: number; goal: number }
function GoalBar({ icon, label, value, goal }: GoalBarProps) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const done = goal > 0 && value >= goal;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="flex items-center gap-1 text-neutral-400">{icon} {label}</span>
        <span className={`font-medium tabular-nums ${done ? 'text-green-400' : 'text-white'}`}>
          {formatNum(value)}<span className="text-neutral-500">/{formatNum(goal)}</span>
          <span className={`ml-1.5 ${done ? 'text-green-400' : 'text-[#6cbfd0]'}`}>{pct.toFixed(0)}%</span>
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${done ? 'bg-green-500' : 'bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PostCard({ post, viewMode }: { post: MediaPost; viewMode: 'grid' | 'list' }) {
  const meta = PLATFORM_MAP[post.platform] ?? { icon: Hash, color: '#6B7280', label: post.platform };
  const Icon = meta.icon;
  const hasGoals = post.goal_views > 0 || post.goal_likes > 0 || post.goal_comments > 0 || post.goal_shares > 0 || post.goal_saves > 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group bg-neutral-900 border border-white/5 hover:border-white/20 rounded-2xl overflow-hidden transition-all hover:shadow-xl ${viewMode === 'list' ? 'flex flex-row items-stretch' : 'flex flex-col'}`}
    >
      <a href={post.post_url} target="_blank" rel="noopener noreferrer"
        className={`relative bg-black flex-shrink-0 ${viewMode === 'list' ? 'w-36 h-32' : 'w-full aspect-video'}`}
      >
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title ?? 'media'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-700">
            <Icon className="w-10 h-10" />
          </div>
        )}
        <div className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ color: meta.color }}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        {post.is_focus && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500 text-black text-[9px] font-bold rounded uppercase">Focus</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </a>

      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-white/10 text-neutral-300 rounded-full">
            {post.artist === 'both' ? 'คู่จิ้น' : post.artist === 'namtan' ? 'น้ำตาล' : 'ฟิล์ม'}
          </span>
          <span className="text-[10px] text-neutral-500 ml-auto">
            {new Date(post.post_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <p className="text-sm text-neutral-200 line-clamp-2 leading-relaxed font-thai flex-1">
          {post.title || post.caption || '—'}
        </p>

        <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-medium pt-2 border-t border-white/5">
          {post.views > 0    && <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNum(post.views)}</span>}
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatNum(post.likes)}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{formatNum(post.comments)}</span>
          {post.shares > 0   && <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{formatNum(post.shares)}</span>}
          {post.saves > 0    && <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" />{formatNum(post.saves)}</span>}
        </div>

        {hasGoals && (
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            {post.goal_views > 0    && <GoalBar icon={<Eye className="w-3 h-3 inline"/>}            label="Views"    value={post.views}    goal={post.goal_views}    />}
            {post.goal_likes > 0    && <GoalBar icon={<Heart className="w-3 h-3 inline"/>}          label="Likes"    value={post.likes}    goal={post.goal_likes}    />}
            {post.goal_comments > 0 && <GoalBar icon={<MessageCircle className="w-3 h-3 inline"/>}  label="Comments" value={post.comments} goal={post.goal_comments} />}
            {post.goal_shares > 0   && <GoalBar icon={<Share2 className="w-3 h-3 inline"/>}         label="Shares"   value={post.shares}   goal={post.goal_shares}   />}
            {post.goal_saves > 0    && <GoalBar icon={<Bookmark className="w-3 h-3 inline"/>}       label="Saves"    value={post.saves}    goal={post.goal_saves}    />}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EventBlock({ event, artistFilter, viewMode }: { event: MediaEvent; artistFilter: string; viewMode: 'grid' | 'list' }) {
  const [expanded, setExpanded] = useState(true);
  const visiblePosts = (event.media_posts ?? []).filter(p =>
    p.is_visible && (artistFilter === 'all' || p.artist === artistFilter || (artistFilter === 'both' && p.artist === 'both'))
  );
  if (visiblePosts.length === 0) return null;

  const total = visiblePosts.reduce((acc, p) => ({
    views:         acc.views         + (p.views    ?? 0),
    likes:         acc.likes         + (p.likes    ?? 0),
    comments:      acc.comments      + (p.comments ?? 0),
    shares:        acc.shares        + (p.shares   ?? 0),
    saves:         acc.saves         + (p.saves    ?? 0),
    goal_views:    acc.goal_views    + (p.goal_views    ?? 0),
    goal_likes:    acc.goal_likes    + (p.goal_likes    ?? 0),
    goal_comments: acc.goal_comments + (p.goal_comments ?? 0),
    goal_shares:   acc.goal_shares   + (p.goal_shares   ?? 0),
    goal_saves:    acc.goal_saves    + (p.goal_saves    ?? 0),
  }), { views: 0, likes: 0, comments: 0, shares: 0, saves: 0,
        goal_views: 0, goal_likes: 0, goal_comments: 0, goal_shares: 0, goal_saves: 0 });

  const hasGoals = total.goal_views > 0 || total.goal_likes > 0 || total.goal_comments > 0 || total.goal_shares > 0 || total.goal_saves > 0;
  const dateRange = formatDateRange(event.start_date, event.end_date);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white font-thai">{event.title}</h2>
            {dateRange && (
              <p className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                <CalendarDays className="w-3.5 h-3.5" /> {dateRange}
              </p>
            )}
            {event.description && (
              <p className="text-sm text-neutral-400 mt-1.5 font-thai">{event.description}</p>
            )}
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-sm mb-4">
          {total.views > 0  && <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 text-neutral-300"><Eye className="w-3.5 h-3.5 text-neutral-500" />{formatNum(total.views)}</div>}
          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 text-neutral-300"><Heart className="w-3.5 h-3.5 text-red-400" />{formatNum(total.likes)}</div>
          <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 text-neutral-300"><MessageCircle className="w-3.5 h-3.5 text-blue-400" />{formatNum(total.comments)}</div>
          {total.shares > 0 && <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 text-neutral-300"><Share2 className="w-3.5 h-3.5 text-green-400" />{formatNum(total.shares)}</div>}
          {total.saves > 0  && <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5 text-neutral-300"><Bookmark className="w-3.5 h-3.5 text-amber-400" />{formatNum(total.saves)}</div>}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-3 py-1.5 text-neutral-500 text-xs">{visiblePosts.length} โพสต์</div>
        </div>

        {hasGoals && (
          <div className="space-y-2.5 pt-3 border-t border-white/10">
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">เป้าหมายรวมกิจกรรม</p>
            {total.goal_views > 0    && <GoalBar icon={<Eye className="w-3 h-3 inline"/>}            label="Views"    value={total.views}    goal={total.goal_views}    />}
            {total.goal_likes > 0    && <GoalBar icon={<Heart className="w-3 h-3 inline"/>}          label="Likes"    value={total.likes}    goal={total.goal_likes}    />}
            {total.goal_comments > 0 && <GoalBar icon={<MessageCircle className="w-3 h-3 inline"/>}  label="Comments" value={total.comments} goal={total.goal_comments} />}
            {total.goal_shares > 0   && <GoalBar icon={<Share2 className="w-3 h-3 inline"/>}         label="Shares"   value={total.shares}   goal={total.goal_shares}   />}
            {total.goal_saves > 0    && <GoalBar icon={<Bookmark className="w-3 h-3 inline"/>}       label="Saves"    value={total.saves}    goal={total.goal_saves}    />}
          </div>
        )}

        {event.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10 mt-3">
            {event.hashtags.map(tag => (
              <button
                key={tag}
                onClick={() => navigator.clipboard?.writeText(tag)}
                title="คัดลอก"
                className="text-[11px] px-2 py-0.5 rounded-full bg-[#6cbfd0]/10 text-[#6cbfd0] hover:bg-[#6cbfd0]/20 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-3xl'}`}
          >
            {visiblePosts.map(post => (
              <PostCard key={post.id} post={post} viewMode={viewMode} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MediaPage() {
  const [events, setEvents] = useState<MediaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistFilter, setArtistFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    supabase
      .from('media_events')
      .select('*, media_posts(*)')
      .eq('is_active', true)
      .order('start_date', { ascending: false, nullsFirst: true })
      .then(({ data }) => {
        setEvents((data as MediaEvent[]) ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalPosts = events.reduce((s, e) => s + (e.media_posts?.filter(p => p.is_visible).length ?? 0), 0);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-neutral-950 to-neutral-900">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <Link href="/" className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors mb-4 text-sm">
                ← กลับหน้าหลัก
              </Link>
              <h1 className="text-4xl md:text-5xl font-light text-white mb-2 font-thai">
                Media <span className="bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] bg-clip-text text-transparent">Posts</span>
              </h1>
              <p className="text-neutral-400 text-sm">
                อัปเดตโพสต์และยอด Engagement แยกตามกิจกรรม
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-black/40 border border-white/10 rounded-full p-1">
                {ARTIST_OPTIONS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setArtistFilter(a.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${artistFilter === a.id ? 'bg-white/20 text-white' : 'text-neutral-400 hover:text-white'}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-neutral-900 rounded-2xl animate-pulse h-48" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.03] border border-white/10 rounded-3xl">
              <Mascot state="sleeping" size={100} showCaption className="mx-auto mb-6" />
              <h3 className="text-xl text-white mb-2 font-thai">ยังไม่มีกิจกรรม</h3>
              <p className="text-neutral-500 text-sm">แอดมินยังไม่ได้เพิ่มกิจกรรมสื่อ</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-neutral-500 mb-8">{events.length} กิจกรรม · {totalPosts} โพสต์</p>
              {events.map(event => (
                <EventBlock key={event.id} event={event} artistFilter={artistFilter} viewMode={viewMode} />
              ))}
            </>
          )}
        </div>
      </main>
    </>
  );
}
