'use client';

import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Eye, FileText, Image as ImageIcon, BarChart3, ArrowRight, TrendingUp, Globe2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Analytics {
  totalViews: number;
  viewsByDay: Record<string, number>;
  topCountries: { country: string; count: number }[];
  topPages: { path: string; count: number }[];
  days: number;
}

interface ContentCount {
  total: number;
  series: number;
  variety: number;
  event: number;
  magazine: number;
  award: number;
}

function isContentType(value: unknown): value is keyof Omit<ContentCount, 'total'> {
  return value === 'series' || value === 'variety' || value === 'event' || value === 'magazine' || value === 'award';
}

interface SocialStat {
  platform: string;
  followers: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
  TH: '🇹🇭', US: '🇺🇸', GB: '🇬🇧', JP: '🇯🇵', KR: '🇰🇷', CN: '🇨🇳',
  SG: '🇸🇬', MY: '🇲🇾', PH: '🇵🇭', ID: '🇮🇩', VN: '🇻🇳', TW: '🇹🇼',
  IN: '🇮🇳', DE: '🇩🇪', FR: '🇫🇷', AU: '🇦🇺', CA: '🇨🇦', BR: '🇧🇷',
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: '📸', twitter: '🐦', tiktok: '🎵', youtube: '▶️',
  facebook: '📘', threads: '🧵', weibo: '🔴',
};

export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [content, setContent] = useState<ContentCount | null>(null);
  const [socialStats, setSocialStats] = useState<SocialStat[]>([]);
  const [galleryCount, setGalleryCount] = useState<number | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const analyticsRes = await fetch(`/api/admin/analytics?days=${days}`).catch(() => null);
        if (analyticsRes?.ok) setAnalytics(await analyticsRes.json());
      } catch {}

      try {
        const contentRes = await fetch('/api/admin/content').catch(() => null);
        if (contentRes?.ok) {
          const contentData = await contentRes.json();
          if (Array.isArray(contentData)) {
            const counts: ContentCount = { total: contentData.length, series: 0, variety: 0, event: 0, magazine: 0, award: 0 };
            contentData.forEach((item) => {
              const t = typeof item === 'object' && item && 'content_type' in item ? item.content_type : undefined;
              if (isContentType(t)) counts[t]++;
            });
            setContent(counts);
          }
        }
      } catch {}

      try {
        const socialRes = await fetch('/api/social-stats').catch(() => null);
        if (socialRes?.ok) {
          const data = await socialRes.json();
          if (Array.isArray(data)) setSocialStats(data);
        }
      } catch {}

      try {
        if (isSuperAdmin) {
          const usersRes = await fetch('/api/admin/users?page=1&limit=1').catch(() => null);
          if (usersRes?.ok) await usersRes.json();
        }
      } catch {}

      try {
        const galleryRes = await fetch('/api/gallery').catch(() => null);
        if (galleryRes?.ok) {
          const data = await galleryRes.json();
          if (Array.isArray(data)) setGalleryCount(data.length);
        }
      } catch {}

      setLoading(false);
    };

    load();
  }, [days, isSuperAdmin]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-theme border-t-accent animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  const totalFollowers = socialStats.reduce((sum, s) => sum + (s.followers || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-theme/40 pb-10">
        <div>
           <p className="text-overline text-accent font-bold mb-4 uppercase tracking-[0.4em]">Administration</p>
           <h1 className="text-4xl md:text-5xl font-display text-primary leading-tight font-light">
              System <span className="nf-gradient-text italic">Overview</span>
           </h1>
        </div>
        <div className="flex items-center gap-3">
           <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
           </span>
           <span className="text-[10px] text-muted font-bold tracking-[0.3em] uppercase">Live Sync Active</span>
        </div>
      </header>

      {/* Quick Summary Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard icon={Eye} label="Page Views" value={analytics?.totalViews?.toLocaleString() || '0'} trend={`${days}d span`} color="var(--namtan-teal)" />
        <SummaryCard icon={FileText} label="Content Pieces" value={String(content?.total || 0)} trend="Archive total" color="var(--film-gold)" />
        <SummaryCard icon={ImageIcon} label="Gallery Photos" value={String(galleryCount || 0)} trend="Assets stored" color="#F06292" />
        <SummaryCard icon={BarChart3} label="Total Followers" value={fmtK(totalFollowers)} trend={`${socialStats.length} platforms`} color="#8B5CF6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Views Main Chart Cell */}
        <div className="lg:col-span-2 group bg-surface border border-theme/60 rounded-[2.5rem] p-10 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
               <h2 className="font-display text-2xl font-light text-primary flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-accent" /> Traffic Analytics
               </h2>
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted mt-2 opacity-60">Visitor activity and reach</p>
            </div>
            <div className="flex p-1 bg-panel border border-theme/40 rounded-full">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    days === d ? "bg-deep-dark text-white shadow-md" : "text-muted hover:text-primary"
                  )}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="mb-12 relative z-10">
             <div className="text-5xl font-display font-light text-primary tabular-nums tracking-tighter">
                {analytics?.totalViews?.toLocaleString() || 0}
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted ml-4 opacity-40">Total Views</span>
             </div>
          </div>

          {/* Simple Chart Visualization */}
          {analytics?.viewsByDay && (
            <div className="flex items-end gap-1.5 h-48 relative z-10">
              {Object.entries(analytics.viewsByDay).map(([day, count]) => {
                const max = Math.max(...Object.values(analytics.viewsByDay), 1);
                const height = (count / max) * 100;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-3 group/bar">
                    <div
                      className="w-full bg-panel border-t border-accent/20 rounded-t-xl min-h-[4px] relative overflow-hidden transition-all duration-700"
                      style={{ height: `${height}%` }}
                      title={`${day}: ${count} views`}
                    >
                       <div className="absolute inset-0 bg-accent/5 group-hover/bar:bg-accent/20 transition-colors" />
                       <div className="absolute bottom-0 left-0 w-full h-1 bg-accent/40" />
                    </div>
                    <span className="text-[9px] font-bold text-muted/40 uppercase tracking-tighter">{day.slice(8)}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-display font-bold opacity-[0.02] pointer-events-none select-none">
             TRAFFIC
          </div>
        </div>

        {/* Content & Social Sidebar Column */}
        <div className="space-y-8">
           {/* Content Breakdown */}
           <div className="bg-surface border border-theme/60 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-display text-xl font-light text-primary flex items-center gap-3">
                    <Layers className="w-4 h-4 text-accent" /> Categories
                 </h3>
                 <Link href="/admin/content" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">Manage</Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 {content && (
                   <>
                     <StatTile label="Series" value={content.series} color="var(--namtan-teal)" />
                     <StatTile label="Variety" value={content.variety} color="var(--film-gold)" />
                     <StatTile label="Events" value={content.event} color="#FF7043" />
                     <StatTile label="Fashion" value={content.magazine} color="#F06292" />
                     <StatTile label="Awards" value={content.award} color="#4CAF50" />
                     <StatTile label="Total" value={content.total} color="var(--primary)" />
                   </>
                 )}
              </div>
           </div>

           {/* Social Snapshot */}
           <div className="bg-surface border border-theme/60 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-display text-xl font-light text-primary flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-accent" /> Platforms
                 </h3>
                 <Link href="/admin/social-stats" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">Sync</Link>
              </div>
              <div className="space-y-4">
                 {socialStats.length > 0 ? (
                    socialStats.map(s => (
                      <div key={s.platform} className="flex items-center justify-between group/p">
                         <div className="flex items-center gap-3">
                            <span className="text-lg grayscale group-hover/p:grayscale-0 transition-all">{PLATFORM_ICONS[s.platform] || '📱'}</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted">{s.platform}</span>
                         </div>
                         <span className="text-xs font-bold text-primary tabular-nums">{(s.followers || 0).toLocaleString()}</span>
                      </div>
                    ))
                 ) : <p className="text-[10px] text-muted uppercase font-bold tracking-widest text-center py-4">No data sync</p>}
              </div>
           </div>
        </div>
      </div>

      {/* Analytics Footer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-panel/30 border border-theme/60 rounded-[2.5rem] p-10">
          <h3 className="font-display text-xl font-light text-primary mb-8 flex items-center gap-3">
             <Globe2 className="w-5 h-5 text-accent" /> Geo-Distribution
          </h3>
          <div className="space-y-4">
             {analytics?.topCountries?.slice(0, 5).map(c => (
               <div key={c.country} className="flex items-center justify-between group/row">
                  <div className="flex items-center gap-4">
                     <span className="text-2xl grayscale-[0.5] group-hover/row:grayscale-0 transition-all">{COUNTRY_FLAGS[c.country] || '🏳️'}</span>
                     <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted">{c.country}</span>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="w-24 h-1 rounded-full bg-theme/20 overflow-hidden hidden sm:block">
                        <div className="h-full bg-accent/40" style={{ width: `${Math.min(100, (c.count / (analytics.totalViews || 1)) * 500)}%` }} />
                     </div>
                     <span className="text-xs font-bold text-primary tabular-nums">{c.count}</span>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-panel/30 border border-theme/60 rounded-[2.5rem] p-10">
          <h3 className="font-display text-xl font-light text-primary mb-8 flex items-center gap-3">
             <FileText className="w-5 h-5 text-accent" /> Entry Points
          </h3>
          <div className="space-y-4">
             {analytics?.topPages?.slice(0, 5).map(p => (
               <div key={p.path} className="flex items-center justify-between group/row">
                  <div className="min-w-0">
                     <code className="text-[10px] font-bold text-accent/60 group-hover/row:text-accent transition-colors block truncate">{p.path}</code>
                  </div>
                  <span className="text-xs font-bold text-primary tabular-nums ml-4">{p.count}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, trend, color }: { icon: ComponentType<{ className?: string }>; label: string; value: string; trend: string; color: string }) {
  return (
    <div className="group bg-surface border border-theme/60 rounded-[2rem] p-8 hover:shadow-xl transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 opacity-20 group-hover:opacity-100 transition-opacity" style={{ background: color }} />
      <div className="flex items-center justify-between mb-6">
         <div className="p-3 rounded-2xl bg-panel border border-theme/40 text-muted group-hover:text-accent transition-colors">
            <Icon className="w-5 h-5" />
         </div>
         <span className="text-accent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
            <ArrowRight className="w-4 h-4" />
         </span>
      </div>
      <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted mb-2">{label}</div>
      <div className="text-4xl font-display font-light text-primary tracking-tight mb-4 tabular-nums">{value}</div>
      <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted/40">{trend}</div>
    </div>
  );
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-panel/40 border border-theme/40 rounded-2xl p-5 group hover:bg-surface transition-all duration-300">
      <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted/60 mb-2">{label}</div>
      <div className="text-2xl font-display font-light tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}

function fmtK(n: number) {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}
