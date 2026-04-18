'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

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
  const [userCount, setUserCount] = useState<number | null>(null);
  const [galleryCount, setGalleryCount] = useState<number | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Analytics
        const analyticsRes = await fetch(`/api/admin/analytics?days=${days}`).catch(() => null);
        if (analyticsRes?.ok) setAnalytics(await analyticsRes.json());
      } catch {}

      try {
        // Content counts
        const contentRes = await fetch('/api/admin/content').catch(() => null);
        if (contentRes?.ok) {
          const contentData = await contentRes.json();
          if (Array.isArray(contentData)) {
            const counts: ContentCount = { total: contentData.length, series: 0, variety: 0, event: 0, magazine: 0, award: 0 };
            contentData.forEach((item: any) => {
              const t = item.content_type as keyof Omit<ContentCount, 'total'>;
              if (t in counts) counts[t]++;
            });
            setContent(counts);
          }
        }
      } catch {}

      try {
        // Social stats
        const socialRes = await fetch('/api/social-stats').catch(() => null);
        if (socialRes?.ok) {
          const data = await socialRes.json();
          if (Array.isArray(data)) setSocialStats(data);
        }
      } catch {}

      try {
        // User count (super admin only)
        if (isSuperAdmin) {
          const usersRes = await fetch('/api/admin/users?page=1&limit=1').catch(() => null);
          if (usersRes?.ok) {
            const data = await usersRes.json();
            setUserCount(data?.roleCounts?.total || 0);
          }
        }
      } catch {}

      try {
        // Gallery count
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[var(--color-text-secondary)]">กำลังโหลด...</div>
      </div>
    );
  }

  const totalFollowers = socialStats.reduce((sum, s) => sum + (s.followers || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div>
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">
            <span className="bg-gradient-to-r from-[#6cbfd0] to-[#fbdf74] bg-clip-text text-transparent">
              NamtanFilm
            </span>
            <span className="text-[var(--color-text-secondary)] ml-3 text-lg">Admin Dashboard</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">ภาพรวมระบบทั้งหมด</p>
        </div>
      </div>

      {/* Quick Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <SummaryCard icon="👁️" label="Page Views" value={analytics?.totalViews?.toLocaleString() || '0'} sublabel={`${days} วันล่าสุด`} color="#6cbfd0" />
        <SummaryCard icon="📝" label="เนื้อหาทั้งหมด" value={String(content?.total || 0)} sublabel="Content items" color="#4CAF50" />
        {userCount !== null && (
          <SummaryCard icon="👥" label="ผู้ใช้ทั้งหมด" value={String(userCount)} sublabel="Registered users" color="#8B5CF6" />
        )}
        <SummaryCard icon="🖼️" label="รูปในแกลเลอรี" value={String(galleryCount || 0)} sublabel="Gallery photos" color="#E91E63" />
        <SummaryCard icon="📊" label="Followers รวม" value={totalFollowers.toLocaleString()} sublabel={`${socialStats.length} platforms`} color="#FF9800" />
      </div>

      {/* Content Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {content && (
          <>
            <StatCard label="ทั้งหมด" value={content.total} color="#6cbfd0" />
            <StatCard label="Series" value={content.series} color="#4CAF50" />
            <StatCard label="Variety" value={content.variety} color="#FF9800" />
            <StatCard label="Events" value={content.event} color="#E91E63" />
            <StatCard label="Magazine" value={content.magazine} color="#9C27B0" />
            <StatCard label="Awards" value={content.award} color="#fbdf74" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Views chart */}
        <div className="lg:col-span-2 bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-normal">📊 Page Views</h2>
            <div className="flex gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    days === d ? 'bg-[#6cbfd0] text-[#141413]' : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="text-3xl font-light mb-4 text-[#6cbfd0]">
            {analytics?.totalViews?.toLocaleString() || 0}
            <span className="text-sm text-[var(--color-text-secondary)] ml-2">views</span>
          </div>

          {/* Simple bar chart */}
          {analytics?.viewsByDay && (
            <div className="flex items-end gap-1 h-32">
              {Object.entries(analytics.viewsByDay).map(([day, count]) => {
                const max = Math.max(...Object.values(analytics.viewsByDay), 1);
                const height = (count / max) * 100;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-[#6cbfd0] to-[#8ed0dd] rounded-t-sm min-h-[2px]"
                      style={{ height: `${height}%` }}
                      title={`${day}: ${count} views`}
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)]">{day.slice(8)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Social Stats Summary */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-normal">📱 Social Stats</h2>
            <Link href="/admin/social-stats" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
              แก้ไข →
            </Link>
          </div>
          <div className="space-y-3">
            {socialStats.length > 0 ? (
              socialStats.map((stat) => (
                <div key={stat.platform} className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <span>{PLATFORM_ICONS[stat.platform] || '🔗'}</span>
                    <span className="capitalize">{stat.platform}</span>
                  </span>
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    {(stat.followers || 0).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[var(--color-text-muted)] text-sm">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top countries */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="font-display text-lg font-normal mb-4">🌍 Top Countries</h2>
          <div className="space-y-3">
            {analytics?.topCountries?.length ? (
              analytics.topCountries.map(({ country, count }) => (
                <div key={country} className="flex items-center justify-between">
                  <span className="text-sm">
                    {COUNTRY_FLAGS[country] || '🏳️'} {country}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-[var(--color-text-muted)] text-sm">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-border)]">
          <h2 className="font-display text-lg font-normal mb-4">📄 Top Pages</h2>
          <div className="space-y-2">
            {analytics?.topPages?.length ? (
              analytics.topPages.map(({ path, count }) => (
                <div key={path} className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] last:border-0">
                  <code className="text-sm text-[var(--color-text-secondary)]">{path}</code>
                  <span className="text-sm text-[var(--color-text-secondary)]">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-[var(--color-text-muted)] text-sm">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

function SummaryCard({ icon, label, value, sublabel, color }: { icon: string; label: string; value: string; sublabel: string; color: string }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      </div>
      <div className="text-2xl font-display font-medium" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1">{sublabel}</div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]">
      <div className="text-2xl font-light" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--color-text-secondary)] mt-1">{label}</div>
    </div>
  );
}
