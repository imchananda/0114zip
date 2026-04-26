'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/navigation/Header';
import { ArrowLeft, TrendingUp, Award, Tag, BarChart3, Globe2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

type Tab = 'followers' | 'igposts' | 'brands' | 'engagement' | 'audience' | 'works' | 'awards';
type Artist = 'namtan' | 'film' | 'luna';

interface SocialStats {
  ig_followers: number; x_followers: number; tiktok_followers: number;
  community_members: number; posts_today: number; hashtag_uses: number;
  avg_engagement_rate: number; countries_reached: number;
}
interface FollowerPoint { month: string; namtan_ig: number; film_ig: number; namtan_x: number; film_x: number; }
interface EngagementPoint { platform: string; namtan: number; film: number; }
interface CountryPoint { name: string; value: number; color: string; }
interface IgPost {
  id: number; artist: Artist; post_url: string | null; post_date: string;
  likes: number; comments: number; saves: number; reach: number; impressions: number;
  emv: number; note: string | null;
}
interface BrandCollab {
  id: number; artists: Artist[]; brand_name: string; brand_logo: string | null;
  category: string | null; collab_type: string | null;
  start_date: string | null; end_date: string | null;
}
interface EngagementData {
  latestSnapshots: Record<Artist, Record<string, number>>;
  snapshotHistory: Record<string, number | string>[];
  igPosts: Record<Artist, IgPost[]>;
  brandCollabs: BrandCollab[];
}

const ARTIST_META: { value: Artist; label: string; color: string; emoji: string }[] = [
  { value: 'namtan', label: 'Namtan', color: 'var(--namtan-teal)', emoji: '🦋' },
  { value: 'film',   label: 'Film',   color: 'var(--film-gold)',   emoji: '✨' },
  { value: 'luna',   label: 'Luna',   color: '#a78bfa',            emoji: '🌙' },
];

const PLATFORM_META = [
  { value: 'ig'     as const, label: 'Instagram', icon: '📸', short: 'IG'     },
  { value: 'x'      as const, label: 'X (Twitter)', icon: '𝕏',  short: 'X'      },
  { value: 'tiktok' as const, label: 'TikTok',    icon: '🎵', short: 'TikTok' },
  { value: 'weibo'  as const, label: 'Weibo',     icon: '🌐', short: 'Weibo'  },
];

const TABS: { id: Tab; icon: LucideIcon; label: string }[] = [
  { id: 'followers',  icon: TrendingUp, label: 'Followers' },
  { id: 'igposts',    icon: Tag,        label: 'IG Posts' },
  { id: 'brands',     icon: Award,      label: 'Brands' },
  { id: 'engagement', icon: BarChart3,  label: 'Engagement' },
  { id: 'audience',   icon: Globe2,     label: 'Audience' },
];

function fmtK(n: number) {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}
function emvFmt(emv: number) {
  if (emv >= 1_000_000) return `฿${(emv / 1_000_000).toFixed(2)}M`;
  if (emv >= 1_000)     return `฿${(emv / 1_000).toFixed(1)}K`;
  return `฿${Number(emv).toLocaleString('th-TH')}`;
}

export default function StatsPage() {
  const [tab, setTab]               = useState<Tab>('followers');
  const [socialData, setSocialData] = useState<{
    stats: SocialStats; followerHistory: FollowerPoint[];
    engagementData: EngagementPoint[]; fanCountries: CountryPoint[];
  } | null>(null);
  const [engData, setEngData]       = useState<EngagementData | null>(null);
  const [platformFilter, setPlatformFilter]         = useState<'ig' | 'x' | 'tiktok' | 'weibo'>('ig');
  const [brandArtistFilter, setBrandArtistFilter]   = useState<Artist | 'all'>('all');
  const [brandCatFilter]                            = useState<string>('all');

  useEffect(() => {
    fetch('/api/social-stats?full=true').then(r => r.json()).then(setSocialData).catch(console.error);
    fetch('/api/engagement').then(r => r.json()).then(setEngData).catch(console.error);
  }, []);

  const latestSnap      = (engData?.latestSnapshots ?? {}) as Record<Artist, Record<string, number>>;
  const snapshotHistory = useMemo(() => engData?.snapshotHistory ?? [], [engData]);
  const igPosts         = (engData?.igPosts ?? { namtan: [], film: [], luna: [] }) as Record<Artist, IgPost[]>;
  const brandCollabs    = useMemo(() => engData?.brandCollabs ?? [], [engData]);
  const fanCountry      = socialData?.fanCountries ?? [];

  const platformChartData = useMemo(() =>
    snapshotHistory
      .map(row => ({
        date:   row.date as string,
        namtan: (row[`namtan_${platformFilter}`] as number | undefined) ?? null,
        film:   (row[`film_${platformFilter}`]   as number | undefined) ?? null,
        luna:   (row[`luna_${platformFilter}`]   as number | undefined) ?? null,
      }))
      .filter(r => r.namtan !== null || r.film !== null || r.luna !== null),
    [snapshotHistory, platformFilter]
  );

  const TOOLTIP_STYLE = {
    contentStyle: {
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      fontSize: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  };

  const filteredBrands = useMemo(() =>
    brandCollabs.filter(b => {
      const artistOk = brandArtistFilter === 'all' || b.artists.includes(brandArtistFilter);
      const catOk    = brandCatFilter    === 'all' || (b.category ?? 'Other') === brandCatFilter;
      return artistOk && catOk;
    }),
    [brandCollabs, brandArtistFilter, brandCatFilter]
  );
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
              <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">Analytics</p>
              <h1 className="text-5xl md:text-7xl font-display text-primary leading-tight font-light">
                Engagement <span className="nf-gradient-text italic">Report</span>
              </h1>
            </div>
            <p className="text-muted max-w-sm text-sm leading-relaxed font-body opacity-80">
              Live statistical overview of Namtan, Film, and Luna&apos;s digital footprint across social platforms.
            </p>
          </div>
        </header>

        {/* Artist Snapshot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {ARTIST_META.map((a, i) => {
            const snap       = latestSnap[a.value] ?? {};
            const posts      = igPosts[a.value] ?? [];
            const totalEmv   = posts.reduce((s, p) => s + Number(p.emv), 0);
            const brandCount = brandCollabs.filter(b => b.artists.includes(a.value)).length;
            const igFol      = snap.ig ?? 0;

            return (
              <motion.div
                key={a.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group bg-surface border border-theme/60 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-500 relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 opacity-40 group-hover:opacity-100 transition-opacity" style={{ background: a.color }} />
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                       <span className="text-3xl grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500">{a.emoji}</span>
                       <span className="font-display text-2xl font-light text-primary">{a.label}</span>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted/40">Latest Snapshot</div>
                  </div>

                  <div className="mb-10">
                    <div className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-2">Instagram Followers</div>
                    <div className="text-5xl font-display font-light tabular-nums tracking-tight" style={{ color: a.color }}>
                      {igFol > 0 ? fmtK(igFol) : <span className="text-muted opacity-20">—</span>}
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 pb-8 border-b border-theme/20">
                    {(['x', 'tiktok', 'weibo'] as const).map(p => {
                      const v    = snap[p];
                      const meta = PLATFORM_META.find(pm => pm.value === p)!;
                      return (
                        <div key={p} className="flex items-center justify-between group/row">
                          <span className="text-xs font-bold uppercase tracking-widest text-muted/60 flex items-center gap-3">
                            <span className="text-base grayscale group-hover/row:grayscale-0 transition-all">{meta.icon}</span> {meta.label}
                          </span>
                          <span className={`text-sm tabular-nums font-medium ${v ? 'text-primary' : 'text-muted/20'}`}>
                            {v ? fmtK(v) : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-1">Total EMV</div>
                      <div className="text-xl font-display font-light text-green-500">
                        {posts.length > 0 ? emvFmt(totalEmv) : '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted uppercase tracking-[0.2em] font-bold mb-1">Brands</div>
                      <div className="text-xl font-display font-light text-primary">
                        {brandCount > 0 ? brandCount : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tabbed Interface */}
        <div className="bg-surface border border-theme/60 rounded-[2.5rem] shadow-xl overflow-hidden mb-12">
          
          {/* Custom Tabs Navigation */}
          <div className="flex overflow-x-auto scrollbar-hide bg-panel/30 border-b border-theme/40 p-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap",
                  tab === t.id 
                    ? "bg-deep-dark text-white shadow-lg" 
                    : "text-muted hover:text-primary hover:bg-theme/10"
                )}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-12 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* ── FOLLOWERS PANEL ── */}
                {tab === 'followers' && (
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                      <div>
                         <h3 className="text-2xl font-display text-primary font-light mb-2">Growth Over Time</h3>
                         <p className="text-xs text-muted font-body">Historical follower data across major social platforms.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {PLATFORM_META.map(p => (
                          <button
                            key={p.value}
                            onClick={() => setPlatformFilter(p.value)}
                            className={cn(
                              "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-300",
                              platformFilter === p.value
                                ? "bg-accent text-deep-dark border-accent shadow-md"
                                : "bg-panel border-theme/40 text-muted hover:border-accent hover:text-accent"
                            )}
                          >
                            {p.short}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-[400px] w-full bg-panel/20 rounded-3xl p-6 border border-theme/30">
                      {platformChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={platformChartData}>
                            <defs>
                              {ARTIST_META.map(a => (
                                <linearGradient key={a.value} id={`grad_${a.value}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%"  stopColor={a.color} stopOpacity={0.2} />
                                  <stop offset="95%" stopColor={a.color} stopOpacity={0}    />
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.4} />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontWeight: 'bold' }} tickFormatter={fmtK} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip {...TOOLTIP_STYLE} formatter={((v: number) => fmtK(v)) as never} />
                            {ARTIST_META.map(a => (
                              <Area key={a.value} type="monotone" dataKey={a.value}
                                stroke={a.color} strokeWidth={3}
                                fill={`url(#grad_${a.value})`}
                                name={a.label} connectNulls dot={{ r: 4, strokeWidth: 2, fill: 'var(--color-surface)' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 gap-4">
                           <TrendingUp className="w-12 h-12" />
                           <p className="text-sm font-bold uppercase tracking-widest">No history recorded for this platform</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── IG POSTS PANEL ── */}
                {tab === 'igposts' && (
                  <div className="space-y-12">
                    {ARTIST_META.map(a => {
                      const posts = igPosts[a.value] ?? [];
                      if (posts.length === 0) return null;
                      const totalEmv = posts.reduce((s, p) => s + Number(p.emv), 0);
                      
                      return (
                        <div key={a.value} className="space-y-6">
                           <div className="flex items-center justify-between border-l-4 border-theme pl-6">
                              <div>
                                 <h3 className="text-xl font-display text-primary font-light flex items-center gap-3">
                                    <span className="text-2xl grayscale-[0.3]">{a.emoji}</span> {a.label}
                                 </h3>
                                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mt-1">{posts.length} Analyzed Posts</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted mb-1">Accumulated EMV</p>
                                 <p className="text-2xl font-display font-light text-green-500">{emvFmt(totalEmv)}</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {posts.map(p => (
                                <div key={p.id} className="group bg-panel/30 border border-theme/60 rounded-3xl p-6 hover:border-accent/40 hover:bg-surface transition-all duration-500">
                                   <div className="flex justify-between items-start mb-6">
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted/60">{p.post_date}</div>
                                      <div className="text-sm font-bold text-green-500">{emvFmt(Number(p.emv))}</div>
                                   </div>
                                   <div className="grid grid-cols-4 gap-4 text-center">
                                      <div>
                                         <p className="text-[8px] font-bold text-muted uppercase tracking-tighter mb-1">Likes</p>
                                         <p className="text-xs font-bold text-primary tabular-nums">{fmtK(p.likes)}</p>
                                      </div>
                                      <div>
                                         <p className="text-[8px] font-bold text-muted uppercase tracking-tighter mb-1">Comments</p>
                                         <p className="text-xs font-bold text-primary tabular-nums">{fmtK(p.comments)}</p>
                                      </div>
                                      <div>
                                         <p className="text-[8px] font-bold text-muted uppercase tracking-tighter mb-1">Saves</p>
                                         <p className="text-xs font-bold text-primary tabular-nums">{fmtK(p.saves)}</p>
                                      </div>
                                      <div>
                                         <p className="text-[8px] font-bold text-muted uppercase tracking-tighter mb-1">Reach</p>
                                         <p className="text-xs font-bold text-primary tabular-nums">{fmtK(p.reach)}</p>
                                      </div>
                                   </div>
                                   {p.post_url && (
                                     <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="mt-6 block text-center py-2 rounded-xl bg-theme/10 hover:bg-theme/20 text-[10px] font-bold uppercase tracking-widest text-muted transition-all">
                                        View Original Post ↗
                                     </a>
                                   )}
                                </div>
                              ))}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── BRANDS PANEL ── */}
                {tab === 'brands' && (
                  <div className="space-y-10">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                           <h3 className="text-2xl font-display text-primary font-light mb-2">Brand Partnerships</h3>
                           <p className="text-xs text-muted font-body">Curation of brand collaborations and endorsements.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           <button onClick={() => setBrandArtistFilter('all')} 
                              className={cn("px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all", brandArtistFilter === 'all' ? "bg-deep-dark text-white border-deep-dark" : "bg-panel border-theme/40 text-muted")}>
                              All
                           </button>
                           {ARTIST_META.map(a => (
                             <button key={a.value} onClick={() => setBrandArtistFilter(a.value)}
                               className={cn("px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all", brandArtistFilter === a.value ? "bg-accent text-deep-dark border-accent" : "bg-panel border-theme/40 text-muted")}>
                               {a.label}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBrands.map(b => (
                          <div key={b.id} className="group bg-panel/20 border border-theme/60 rounded-[2rem] p-6 hover:shadow-xl hover:border-accent/40 transition-all duration-500">
                             <div className="flex items-center gap-5 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-surface border border-theme/40 flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                   {b.brand_logo ? <Image src={b.brand_logo} alt="" width={56} height={56} className="object-contain w-full h-full" /> : <Award className="w-6 h-6 opacity-20" />}
                                </div>
                                <div className="min-w-0">
                                   <h4 className="text-base font-display text-primary truncate leading-tight">{b.brand_name}</h4>
                                   <p className="text-[9px] font-bold uppercase tracking-widest text-muted mt-1 opacity-60">{b.category || 'Lifestyle'}</p>
                                </div>
                             </div>
                             <div className="flex items-center justify-between pt-4 border-t border-theme/20">
                                <div className="flex -space-x-1">
                                   {b.artists.map(av => (
                                      <div key={av} className="w-5 h-5 rounded-full border border-surface flex items-center justify-center text-[10px] shadow-sm" 
                                        style={{ background: ARTIST_META.find(x => x.value === av)?.color || '#999' }}>
                                        {ARTIST_META.find(x => x.value === av)?.emoji}
                                      </div>
                                   ))}
                                </div>
                                <div className="text-[9px] font-bold text-muted uppercase tracking-widest opacity-40">
                                   {b.start_date || 'Ongoing'}
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {/* ── AUDIENCE PANEL ── */}
                {tab === 'audience' && (
                  <div className="space-y-12">
                     <div className="text-center max-w-2xl mx-auto">
                        <h3 className="text-3xl font-display text-primary font-light mb-4">Global Reach</h3>
                        <p className="text-sm text-muted font-body leading-relaxed opacity-70">Distribution of fan base across international markets, highlighting the growing global impact of NamtanFilm.</p>
                     </div>

                     <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
                        <div className="w-full max-w-[320px] aspect-square relative">
                           {fanCountry.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                               <PieChart>
                                 <Pie data={fanCountry} cx="50%" cy="50%" outerRadius="90%" innerRadius="65%" dataKey="value" stroke="none" paddingAngle={4}>
                                   {fanCountry.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                                 </Pie>
                                 <Tooltip {...TOOLTIP_STYLE} formatter={((v: number) => `${v}%`) as never} />
                               </PieChart>
                             </ResponsiveContainer>
                           ) : (
                             <div className="w-full h-full rounded-full border-8 border-theme/10 animate-pulse" />
                           )}
                           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-4xl font-display font-light text-primary">{fanCountry.length}</span>
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Countries</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 flex-1 max-w-xl">
                           {fanCountry.map(c => (
                             <div key={c.name} className="group flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                   <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-3">
                                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                                      {c.name}
                                   </span>
                                   <span className="text-sm font-display font-light text-muted group-hover:text-accent transition-colors">{c.value}%</span>
                                </div>
                                <div className="h-1 w-full bg-panel/40 rounded-full overflow-hidden">
                                   <motion.div initial={{ width: 0 }} whileInView={{ width: `${c.value}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full rounded-full" style={{ background: c.color }} />
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <footer className="text-center opacity-40">
           <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted">
              Verification Status: Real-time Data Sync from Supabase
           </p>
        </footer>

      </div>
    </main>
  );
}
