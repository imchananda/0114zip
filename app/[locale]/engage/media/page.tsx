'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/ui/Footer';
import { Instagram, Twitter, Youtube, Facebook, Hash, Eye, Heart, MessageCircle, ChevronDown, ChevronUp, CalendarDays, ArrowUpRight, LayoutGrid, List, ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Mascot } from '@/components/mascot/Mascot';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

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

const PLATFORM_MAP: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  instagram: { icon: Instagram, color: '#E4405F', label: 'Instagram' },
  x:         { icon: Twitter,   color: 'var(--primary)', label: 'X (Twitter)' },
  tiktok:    { icon: Hash,      color: '#FE2C55', label: 'TikTok' },
  youtube:   { icon: Youtube,   color: '#FF0000', label: 'YouTube' },
  facebook:  { icon: Facebook,  color: '#1877F2', label: 'Facebook' },
  threads:   { icon: Hash,      color: 'var(--primary)', label: 'Threads' },
  weibo:     { icon: Hash,      color: '#FF8200', label: 'Weibo' },
  rednote:   { icon: Hash,      color: '#FF2442', label: 'RedNote' },
};

const ARTIST_OPTIONS = [
  { id: 'all',    label: 'All' },
  { id: 'both',   label: 'Together' },
  { id: 'namtan', label: 'Namtan' },
  { id: 'film',   label: 'Film' },
];

const formatNum = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

function GoalBar({ icon: Icon, label, value, goal }: { icon: LucideIcon; label: string; value: number; goal: number }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const done = goal > 0 && value >= goal;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
        <span className="flex items-center gap-1.5 text-muted opacity-60"><Icon className="w-3 h-3"/> {label}</span>
        <span className={cn("tabular-nums", done ? "text-green-500" : "text-primary")}>
          {formatNum(value)}<span className="opacity-30"> / {formatNum(goal)}</span>
          <span className="ml-2 opacity-40">{pct.toFixed(0)}%</span>
        </span>
      </div>
      <div className="h-0.5 bg-theme/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full transition-all", done ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-namtan-primary")}
        />
      </div>
    </div>
  );
}

function PostCard({ post, viewMode }: { post: MediaPost; viewMode: 'grid' | 'list' }) {
  const meta = PLATFORM_MAP[post.platform] ?? { icon: Hash, color: 'var(--muted)', label: post.platform };
  const hasGoals = post.goal_views > 0 || post.goal_likes > 0 || post.goal_comments > 0 || post.goal_shares > 0 || post.goal_saves > 0;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group bg-surface border border-theme/60 hover:border-accent/40 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl",
        viewMode === 'list' ? "flex flex-row items-stretch min-h-[160px]" : "flex flex-col"
      )}
    >
      <a href={post.post_url} target="_blank" rel="noopener noreferrer"
        className={cn(
          "relative bg-panel flex-shrink-0 overflow-hidden",
          viewMode === 'list' ? "w-40 md:w-56" : "w-full aspect-video"
        )}
      >
        {post.thumbnail ? (
          <Image src={post.thumbnail} alt="" fill className="object-cover transition-all duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted opacity-10">
            <meta.icon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10" style={{ color: meta.color }}>
          <meta.icon className="w-4 h-4" />
        </div>
        {post.is_focus && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-accent text-deep-dark text-[9px] font-bold rounded-full uppercase tracking-widest shadow-lg">Focus</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <ArrowUpRight className="w-5 h-5" />
           </div>
        </div>
      </a>

      <div className="p-8 flex-1 flex flex-col gap-6">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-1">
                 {post.artist === 'namtan' || post.artist === 'both' ? <div className="w-2.5 h-2.5 rounded-full bg-namtan-primary border border-surface shadow-sm" /> : null}
                 {post.artist === 'film' || post.artist === 'both' ? <div className="w-2.5 h-2.5 rounded-full bg-film-primary border border-surface shadow-sm" /> : null}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted/40">
                {post.artist === 'both' ? 'NamtanFilm' : post.artist}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-muted/40 ml-auto tabular-nums">
                {new Date(post.post_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
              </span>
           </div>
           <p className="text-base md:text-lg font-display text-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors">
             {post.title || post.caption || 'Untitled Post'}
           </p>
        </div>

        <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest text-muted/60 mt-auto pt-4 border-t border-theme/30">
          {post.views > 0    && <span className="flex items-center gap-2"><Eye className="w-3.5 h-3.5" />{formatNum(post.views)}</span>}
          <span className="flex items-center gap-2"><Heart className="w-3.5 h-3.5" />{formatNum(post.likes)}</span>
          <span className="flex items-center gap-2"><MessageCircle className="w-3.5 h-3.5" />{formatNum(post.comments)}</span>
        </div>

        {hasGoals && (
          <div className="space-y-4 pt-4 border-t border-theme/30">
            {post.goal_views > 0    && <GoalBar icon={Eye}           label="Views"    value={post.views}    goal={post.goal_views}    />}
            {post.goal_likes > 0    && <GoalBar icon={Heart}         label="Likes"    value={post.likes}    goal={post.goal_likes}    />}
            {post.goal_comments > 0 && <GoalBar icon={MessageCircle} label="Comments" value={post.comments} goal={post.goal_comments} />}
          </div>
        )}
      </div>
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
      }, () => setLoading(false));
  }, []);

  const totalPosts = events.reduce((s, e) => s + (e.media_posts?.filter(p => p.is_visible).length ?? 0), 0);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] transition-colors duration-500">
      <Header />
      <div className="pt-32 pb-24 container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        
        {/* Header Section */}
        <header className="mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-accent transition-all mb-8 text-[10px] font-bold uppercase tracking-[0.3em] group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-theme/40 pb-12">
            <div>
              <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">Media Curation</p>
              <h1 className="text-5xl md:text-7xl font-display text-primary leading-tight font-light">
                Digital <span className="nf-gradient-text italic">Footprint</span>
              </h1>
            </div>
            <div className="flex flex-col items-end gap-6">
               <div className="flex items-center gap-4 bg-surface px-6 py-2 rounded-full border border-theme/60 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    {events.length} Events · {totalPosts} Posts
                  </span>
               </div>
               {/* Controls */}
               <div className="flex items-center gap-4">
                  <div className="flex p-1 bg-surface border border-theme/60 rounded-full shadow-sm">
                    {ARTIST_OPTIONS.map(a => (
                      <button
                        key={a.id}
                        onClick={() => setArtistFilter(a.id)}
                        className={cn(
                          "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                          artistFilter === a.id ? "bg-primary text-deep-dark" : "text-muted hover:text-primary"
                        )}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex p-1 bg-surface border border-theme/60 rounded-xl">
                    <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-panel text-accent" : "text-muted hover:text-primary")}>
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-panel text-accent" : "text-muted hover:text-primary")}>
                      <List className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-surface rounded-[2rem] border border-theme/40 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-32 bg-surface/50 border border-theme/40 rounded-[3rem] opacity-40">
            <Mascot state="sleeping" size={120} showCaption className="mx-auto mb-8" />
            <p className="text-sm font-bold uppercase tracking-widest">No social activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-24">
            {events.map(event => (
              <EventBlock key={event.id} event={event} artistFilter={artistFilter} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

function EventBlock({ event, artistFilter, viewMode }: { event: MediaEvent; artistFilter: string; viewMode: 'grid' | 'list' }) {
  const [expanded, setExpanded] = useState(true);
  const visiblePosts = (event.media_posts ?? []).filter(p =>
    p.is_visible && (artistFilter === 'all' || p.artist === artistFilter || (artistFilter === 'both' && p.artist === 'both'))
  );
  if (visiblePosts.length === 0) return null;

  return (
    <div className="space-y-10">
      {/* Event Meta Card */}
      <div className="relative group bg-panel/30 border border-theme/40 rounded-[2.5rem] p-10 md:p-12 hover:bg-panel/50 transition-all duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-surface border border-theme/40 flex items-center justify-center text-accent shadow-sm">
                    <CalendarDays className="w-5 h-5" />
                 </div>
                 <h2 className="text-2xl md:text-3xl font-display text-primary font-light">{event.title}</h2>
              </div>
              <p className="text-muted text-sm md:text-base leading-relaxed font-body max-w-2xl">
                 {event.description || 'Global engagement tracking for this official appearance.'}
              </p>
           </div>
           
           <div className="flex flex-col items-end gap-6">
              <div className="flex flex-wrap justify-end gap-2">
                 {event.hashtags.map(tag => (
                   <button key={tag} onClick={() => navigator.clipboard?.writeText(tag)}
                     className="px-4 py-1.5 rounded-full bg-surface border border-theme/60 text-[10px] font-bold text-accent hover:border-accent transition-all uppercase tracking-widest">
                     #{tag.startsWith('#') ? tag.slice(1) : tag}
                   </button>
                 ))}
              </div>
              <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted hover:text-primary transition-colors">
                 {expanded ? 'Hide Gallery' : 'Show Gallery'}
                 {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
           </div>
        </div>
      </div>

      {/* Posts Grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className={cn(
              "grid gap-8",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}
          >
            {visiblePosts.map(post => (
              <PostCard key={post.id} post={post} viewMode={viewMode} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
