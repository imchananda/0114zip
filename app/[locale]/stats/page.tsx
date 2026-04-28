'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

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
  { value: 'namtan', label: 'น้ำตาล', color: '#6cbfd0', emoji: '💙' },
  { value: 'film',   label: 'ฟิล์ม',  color: '#fbdf74', emoji: '💛' },
  { value: 'luna',   label: 'ลูน่า',  color: '#c084fc', emoji: '💜' },
];
const PLATFORM_META = [
  { value: 'ig'     as const, label: 'Instagram', icon: '📸', short: 'IG'     },
  { value: 'x'      as const, label: 'X',         icon: '𝕏',  short: 'X'      },
  { value: 'tiktok' as const, label: 'TikTok',    icon: '🎵', short: 'TikTok' },
  { value: 'weibo'  as const, label: 'Weibo',     icon: '🌐', short: 'Weibo'  },
];
const CATEGORY_COLORS: Record<string, string> = {
  Beauty: '#F06292', Fashion: '#AB47BC', Food: '#FF7043',
  Tech: '#42A5F5', Lifestyle: '#26A69A', Entertainment: '#FFCA28', Other: '#78909C',
};
const COLLAB_LABELS: Record<string, string> = {
  ambassador: '⭐ Ambassador', endorsement: '📢 Endorsement',
  one_time: '🤝 One-time', event: '🎪 Event',
};
const TABS: [Tab, string, string][] = [
  ['followers',  '📈', 'Followers'],
  ['igposts',    '📸', 'IG Posts'],
  ['brands',     '🏷️', 'Brands'],
  ['engagement', '⚡', 'Engagement'],
  ['audience',   '🌍', 'Audience'],
  ['works',      '🎬', 'Works'],
  ['awards',     '🏆', 'Awards'],
];
const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    fontSize: '12px',
  },
};

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
  const [realData, setRealData]     = useState<{ works: any[]; awards: any[] } | null>(null);
  const [socialData, setSocialData] = useState<{
    stats: SocialStats; followerHistory: FollowerPoint[];
    engagementData: EngagementPoint[]; fanCountries: CountryPoint[];
  } | null>(null);
  const [engData, setEngData]       = useState<EngagementData | null>(null);
  const [platformFilter, setPlatformFilter]         = useState<'ig' | 'x' | 'tiktok' | 'weibo'>('ig');
  const [brandArtistFilter, setBrandArtistFilter]   = useState<Artist | 'all'>('all');
  const [brandCatFilter, setBrandCatFilter]         = useState<string>('all');

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setRealData).catch(console.error);
    fetch('/api/social-stats?full=true').then(r => r.json()).then(setSocialData).catch(console.error);
    fetch('/api/engagement').then(r => r.json()).then(setEngData).catch(console.error);
  }, []);

  const latestSnap      = (engData?.latestSnapshots ?? {}) as Record<Artist, Record<string, number>>;
  const snapshotHistory = engData?.snapshotHistory ?? [];
  const igPosts         = (engData?.igPosts ?? { namtan: [], film: [], luna: [] }) as Record<Artist, IgPost[]>;
  const brandCollabs    = engData?.brandCollabs ?? [];
  const fanCountry      = socialData?.fanCountries ?? [];

  // Platform chart data (per-platform, 3 artist lines)
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

  // IG Engagement rate computed from posts
  const igEngRate = useMemo(() =>
    ARTIST_META.map(a => {
      const posts = igPosts[a.value] ?? [];
      const valid = posts.filter(p => p.reach > 0);
      const rate  = valid.length > 0
        ? valid.reduce((s, p) => s + (p.likes + p.comments + p.saves) / p.reach * 100, 0) / valid.length
        : 0;
      return { ...a, rate: parseFloat(rate.toFixed(2)) };
    }),
    [igPosts]
  );

  // Filtered brands
  const filteredBrands = useMemo(() =>
    brandCollabs.filter(b => {
      const artistOk = brandArtistFilter === 'all' || b.artists.includes(brandArtistFilter);
      const catOk    = brandCatFilter    === 'all' || (b.category ?? 'Other') === brandCatFilter;
      return artistOk && catOk;
    }),
    [brandCollabs, brandArtistFilter, brandCatFilter]
  );
  const brandCategories = useMemo(() =>
    Array.from(new Set(brandCollabs.map(b => b.category ?? 'Other'))),
    [brandCollabs]
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--color-bg)] pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4">

          {/* ── Page Header ──────────────────────────────────── */}
          <div className="flex items-center justify-between py-7">
            <div>
              <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">Engagement Dashboard</h1>
              <p className="text-sm text-[var(--color-muted)] mt-0.5">น้ำตาล · ฟิล์ม · ลูน่า</p>
            </div>
            <Link href="/" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">← กลับ</Link>
          </div>

          {/* ── Artist Hero Cards ────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  transition={{ delay: i * 0.07 }}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden"
                >
                  <div className="h-[3px]" style={{ background: a.color }} />
                  <div className="p-5">
                    {/* Name */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">{a.emoji}</span>
                      <span className="font-display text-base font-semibold text-[var(--color-text)]">{a.label}</span>
                    </div>

                    {/* IG big number */}
                    <div className="mb-4">
                      <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest mb-0.5">📸 Instagram</div>
                      <div className="text-3xl font-light tabular-nums" style={{ color: a.color }}>
                        {igFol > 0 ? fmtK(igFol) : <span className="text-[var(--color-muted)] text-lg">—</span>}
                      </div>
                    </div>

                    {/* Other platforms */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-[var(--color-border)]">
                      {(['x', 'tiktok', 'weibo'] as const).map(p => {
                        const v    = snap[p];
                        const meta = PLATFORM_META.find(pm => pm.value === p)!;
                        return (
                          <div key={p} className="flex items-center justify-between">
                            <span className="text-xs text-[var(--color-muted)]">{meta.icon} {meta.label}</span>
                            <span className={`text-xs tabular-nums font-medium ${v ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)] opacity-40'}`}>
                              {v ? fmtK(v) : '—'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* EMV + Brands footer */}
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest">EMV รวม</div>
                        <div className="text-sm font-semibold text-green-400 mt-0.5">
                          {posts.length > 0 ? emvFmt(totalEmv) : '—'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest">Brands</div>
                        <div className="text-sm font-semibold text-[var(--color-text)] mt-0.5">
                          {brandCount > 0 ? brandCount : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Tab Navigation ───────────────────────────────── */}
          <div className="flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-1 mb-6 overflow-x-auto">
            {TABS.map(([key, icon, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-1 ${
                  tab === key
                    ? 'bg-[#6cbfd0] text-[#141413] shadow-sm'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                <span>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* ── Tab Panels ───────────────────────────────────── */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >

            {/* ── FOLLOWERS ── */}
            {tab === 'followers' && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
                {/* Platform filter */}
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <span className="text-xs text-[var(--color-muted)] font-medium">แพลตฟอร์ม:</span>
                  {PLATFORM_META.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPlatformFilter(p.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                        platformFilter === p.value
                          ? 'bg-[#6cbfd0] text-[#141413]'
                          : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {p.icon} {p.short}
                    </button>
                  ))}
                  <div className="ml-auto flex gap-4">
                    {ARTIST_META.map(a => (
                      <span key={a.value} className="text-xs text-[var(--color-muted)] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: a.color }} /> {a.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                {platformChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={platformChartData} margin={{ top: 5, right: 10, bottom: 0, left: 5 }}>
                      <defs>
                        {ARTIST_META.map(a => (
                          <linearGradient key={a.value} id={`grad_${a.value}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={a.color} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={a.color} stopOpacity={0}    />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickFormatter={fmtK} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={((v: number) => fmtK(v)) as never} />
                      {ARTIST_META.map(a => (
                        <Area key={a.value} type="monotone" dataKey={a.value}
                          stroke={a.color} strokeWidth={2.5}
                          fill={`url(#grad_${a.value})`}
                          name={a.label} connectNulls dot={false} />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : platformFilter === 'ig' ? (
                  /* Fallback seed data (IG only) */
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={socialData?.followerHistory ?? []} margin={{ top: 5, right: 10, bottom: 0, left: 5 }}>
                      <defs>
                        {[['namtan','#6cbfd0'],['film','#fbdf74']].map(([k,c]) => (
                          <linearGradient key={k} id={`fg_${k}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={c} stopOpacity={0.25} />
                            <stop offset="95%" stopColor={c} stopOpacity={0}    />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickFormatter={fmtK} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={((v: number) => fmtK(v)) as never} />
                      <Area type="monotone" dataKey="namtan_ig" stroke="#6cbfd0" strokeWidth={2.5} fill="url(#fg_namtan)" name="น้ำตาล" dot={false} />
                      <Area type="monotone" dataKey="film_ig"   stroke="#fbdf74" strokeWidth={2.5} fill="url(#fg_film)"   name="ฟิล์ม"  dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-sm text-[var(--color-muted)]">
                    ยังไม่มีข้อมูล {PLATFORM_META.find(p => p.value === platformFilter)?.label} — กรุณากรอกข้อมูลใน Admin
                  </div>
                )}
              </div>
            )}

            {/* ── IG POSTS ── */}
            {tab === 'igposts' && (
              <div className="space-y-5">
                {ARTIST_META.map(a => {
                  const posts     = igPosts[a.value] ?? [];
                  const totalEmv  = posts.reduce((s, p) => s + Number(p.emv), 0);
                  const totalLike = posts.reduce((s, p) => s + p.likes, 0);
                  const avgReach  = posts.length > 0
                    ? Math.round(posts.reduce((s, p) => s + p.reach, 0) / posts.length) : 0;
                  const emvBarData = posts.map(p => ({
                    date: p.post_date.slice(5),
                    emv:  Number(p.emv),
                  }));

                  return (
                    <div key={a.value} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                      {/* Section header */}
                      <div
                        className="px-5 py-4 flex items-center justify-between border-b border-[var(--color-border)]"
                        style={{ background: a.color + '0d' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{a.emoji}</span>
                          <span className="font-medium text-[var(--color-text)]">{a.label}</span>
                          <span className="text-xs text-[var(--color-muted)]">({posts.length} โพส)</span>
                        </div>
                        {posts.length > 0 && (
                          <div className="flex items-center gap-5">
                            <div className="text-right">
                              <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">EMV รวม</div>
                              <div className="text-sm font-semibold text-green-400">{emvFmt(totalEmv)}</div>
                            </div>
                            <div className="text-right hidden sm:block">
                              <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">Total Likes</div>
                              <div className="text-sm font-semibold text-[var(--color-text)]">{totalLike.toLocaleString()}</div>
                            </div>
                            <div className="text-right hidden sm:block">
                              <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">Avg Reach</div>
                              <div className="text-sm font-semibold text-[var(--color-text)]">{fmtK(avgReach)}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {posts.length === 0 ? (
                        <div className="flex items-center justify-center h-20 text-sm text-[var(--color-muted)]">ยังไม่มีข้อมูล</div>
                      ) : (
                        <div className="p-5">
                          {/* EMV bar chart */}
                          <div className="mb-4">
                            <p className="text-[11px] text-[var(--color-muted)] mb-2">EMV ต่อโพส</p>
                            <ResponsiveContainer width="100%" height={100}>
                              <BarChart data={emvBarData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip {...TOOLTIP_STYLE} formatter={((v: number) => emvFmt(v)) as never} />
                                <Bar dataKey="emv" fill={a.color} radius={[4, 4, 0, 0]} name="EMV" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Detail table */}
                          <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-[var(--color-panel)] border-b border-[var(--color-border)]">
                                  <th className="text-left px-3 py-2 text-[var(--color-muted)] font-medium">วันที่</th>
                                  <th className="text-right px-3 py-2 text-[var(--color-muted)] font-medium">❤️ Likes</th>
                                  <th className="text-right px-3 py-2 text-[var(--color-muted)] font-medium">💬 Cmts</th>
                                  <th className="text-right px-3 py-2 text-[var(--color-muted)] font-medium">🔖 Saves</th>
                                  <th className="text-right px-3 py-2 text-[var(--color-muted)] font-medium">👁️ Reach</th>
                                  <th className="text-right px-3 py-2 text-[var(--color-muted)] font-medium">💰 EMV</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--color-border)]">
                                {posts.map(p => (
                                  <tr key={p.id} className="hover:bg-[var(--color-panel)] transition-colors">
                                    <td className="px-3 py-2.5 text-[var(--color-text-secondary)]">
                                      {p.post_url
                                        ? <a href={p.post_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#6cbfd0] underline underline-offset-2">{p.post_date}</a>
                                        : p.post_date}
                                      {p.note && <span className="ml-1.5 text-[var(--color-muted)] opacity-60 italic">{p.note}</span>}
                                    </td>
                                    <td className="px-3 py-2.5 text-right tabular-nums text-[var(--color-text)]">{p.likes.toLocaleString()}</td>
                                    <td className="px-3 py-2.5 text-right tabular-nums text-[var(--color-text)]">{p.comments.toLocaleString()}</td>
                                    <td className="px-3 py-2.5 text-right tabular-nums text-[var(--color-text)]">{p.saves.toLocaleString()}</td>
                                    <td className="px-3 py-2.5 text-right tabular-nums text-[var(--color-text)]">{p.reach.toLocaleString()}</td>
                                    <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-green-400">{emvFmt(Number(p.emv))}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── BRANDS ── */}
            {tab === 'brands' && (
              <div className="space-y-5">
                {/* Summary numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-center">
                    <div className="text-3xl font-light text-[var(--color-text)]">{brandCollabs.length}</div>
                    <div className="text-[10px] text-[var(--color-muted)] mt-1 uppercase tracking-wider">Total Brands</div>
                  </div>
                  {ARTIST_META.map(a => (
                    <div key={a.value} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-center">
                      <div className="text-3xl font-light tabular-nums" style={{ color: a.color }}>
                        {brandCollabs.filter(b => b.artists.includes(a.value)).length}
                      </div>
                      <div className="text-[10px] text-[var(--color-muted)] mt-1 uppercase tracking-wider">{a.emoji} {a.label}</div>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-[var(--color-muted)]">ศิลปิน:</span>
                    {[{ value: 'all' as const, label: 'ทั้งหมด' }, ...ARTIST_META.map(a => ({ value: a.value, label: a.label }))].map(opt => (
                      <button key={opt.value} onClick={() => setBrandArtistFilter(opt.value)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${brandArtistFilter === opt.value ? 'bg-[#6cbfd0] text-[#141413]' : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {brandCategories.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[var(--color-muted)]">หมวด:</span>
                      <button onClick={() => setBrandCatFilter('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${brandCatFilter === 'all' ? 'bg-[#6cbfd0] text-[#141413]' : 'border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}>
                        ทั้งหมด
                      </button>
                      {brandCategories.map(cat => (
                        <button key={cat} onClick={() => setBrandCatFilter(cat)}
                          className="px-3 py-1 rounded-lg text-xs font-medium border transition-all"
                          style={brandCatFilter === cat
                            ? { background: CATEGORY_COLORS[cat] ?? '#78909C', color: '#141413', borderColor: 'transparent' }
                            : { borderColor: (CATEGORY_COLORS[cat] ?? '#78909C') + '55', color: CATEGORY_COLORS[cat] ?? '#78909C', background: (CATEGORY_COLORS[cat] ?? '#78909C') + '15' }}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brand cards */}
                {filteredBrands.length === 0 ? (
                  <div className="flex items-center justify-center h-32 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-sm text-[var(--color-muted)]">
                    ไม่พบข้อมูล
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredBrands.map(b => (
                      <div key={b.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-3 hover:border-[var(--color-text-muted)] transition-colors">
                        {/* Identity row */}
                        <div className="flex items-center gap-3">
                          {b.brand_logo
                            ? <img src={b.brand_logo} alt={b.brand_name} className="w-10 h-10 rounded-xl object-contain bg-white p-1 shrink-0 border border-[var(--color-border)]" />
                            : <div className="w-10 h-10 rounded-xl bg-[var(--color-panel)] flex items-center justify-center shrink-0 text-base">🏷️</div>
                          }
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[var(--color-text)] truncate">{b.brand_name}</div>
                            {b.collab_type && <div className="text-[10px] text-[var(--color-muted)]">{COLLAB_LABELS[b.collab_type] ?? b.collab_type}</div>}
                          </div>
                          {b.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0"
                              style={{ background: (CATEGORY_COLORS[b.category] ?? '#78909C') + '22', color: CATEGORY_COLORS[b.category] ?? '#78909C' }}>
                              {b.category}
                            </span>
                          )}
                        </div>
                        {/* Artists + date */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {b.artists.map(av => {
                            const meta = ARTIST_META.find(x => x.value === av);
                            return (
                              <span key={av} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{ background: (meta?.color ?? '#78909C') + '22', color: meta?.color ?? '#78909C' }}>
                                {meta?.emoji} {meta?.label ?? av}
                              </span>
                            );
                          })}
                          {(b.start_date || b.end_date) && (
                            <span className="text-[10px] text-[var(--color-muted)] ml-auto">
                              {b.start_date ?? '?'}{b.end_date ? ` → ${b.end_date}` : ' → ปัจจุบัน'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ENGAGEMENT ── */}
            {tab === 'engagement' && (
              <div className="space-y-4">
                {/* IG rate from posts */}
                <div className="grid grid-cols-3 gap-4">
                  {igEngRate.map(a => (
                    <div key={a.value} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 text-center">
                      <div className="text-[10px] text-[var(--color-muted)] uppercase tracking-widest mb-2">📸 IG Eng. Rate</div>
                      <div className="text-3xl font-light tabular-nums" style={{ color: a.color }}>
                        {a.rate > 0 ? `${a.rate}%` : <span className="text-xl text-[var(--color-muted)]">—</span>}
                      </div>
                      <div className="text-xs text-[var(--color-muted)] mt-1.5">{a.emoji} {a.label}</div>
                      <div className="text-[10px] text-[var(--color-muted)] opacity-60 mt-0.5">เฉลี่ย 6 โพสล่าสุด</div>
                    </div>
                  ))}
                </div>

                {/* Platform comparison bar */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
                  <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">Engagement Rate เปรียบเทียบรายแพลตฟอร์ม (%)</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={socialData?.engagementData ?? []} barGap={4} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="platform" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={((v: number) => `${v}%`) as never} />
                      <Bar dataKey="namtan" fill="#6cbfd0" radius={[4,4,0,0]} name="น้ำตาล" />
                      <Bar dataKey="film"   fill="#fbdf74" radius={[4,4,0,0]} name="ฟิล์ม"  />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-5 mt-3 justify-center">
                    <span className="text-xs text-[var(--color-muted)] flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#6cbfd0] inline-block" /> น้ำตาล</span>
                    <span className="text-xs text-[var(--color-muted)] flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#fbdf74] inline-block" /> ฟิล์ม</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── AUDIENCE ── */}
            {tab === 'audience' && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-6">สัดส่วนแฟนคลับแยกตามประเทศ</h3>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={fanCountry} cx="50%" cy="50%" outerRadius={95} innerRadius={55} dataKey="value" stroke="none" paddingAngle={2}>
                        {fanCountry.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} formatter={((v: number) => `${v}%`) as never} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 min-w-[180px]">
                    {fanCountry.map(c => (
                      <div key={c.name} className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
                        <span className="text-sm text-[var(--color-text)] flex-1">{c.name}</span>
                        <span className="text-sm font-medium tabular-nums text-[var(--color-text)]">{c.value}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── WORKS ── */}
            {tab === 'works' && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">ผลงานแยกตามปี</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={realData?.works || []} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="series"   stackId="a" fill="#6cbfd0" name="Series"   />
                    <Bar dataKey="variety"  stackId="a" fill="#fbdf74" name="Variety"  />
                    <Bar dataKey="event"    stackId="a" fill="#4CAF50" name="Events"   />
                    <Bar dataKey="magazine" stackId="a" fill="#E91E63" name="Magazine" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                  {[['#6cbfd0','Series'],['#fbdf74','Variety'],['#4CAF50','Events'],['#E91E63','Magazine']].map(([c,l]) => (
                    <span key={l} className="text-xs text-[var(--color-muted)] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} /> {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── AWARDS ── */}
            {tab === 'awards' && (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">รางวัลแยกตามปี</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={realData?.awards || []} barGap={4} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="both"   fill="#E91E63" radius={[4,4,0,0]} name="ผลงานคู่" />
                    <Bar dataKey="namtan" fill="#6cbfd0" radius={[4,4,0,0]} name="น้ำตาล"   />
                    <Bar dataKey="film"   fill="#fbdf74" radius={[4,4,0,0]} name="ฟิล์ม"    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                  {[['#E91E63','ผลงานคู่'],['#6cbfd0','น้ำตาล'],['#fbdf74','ฟิล์ม']].map(([c,l]) => (
                    <span key={l} className="text-xs text-[var(--color-muted)] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} /> {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </motion.div>

          <p className="text-center mt-6 text-xs text-[var(--color-muted)]">
            อัพเดตตามข้อมูลจริงจาก Supabase
          </p>
        </div>
      </div>
    </>
  );
}
