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

const COUNTRY_FLAGS: Record<string, string> = {
  TH: '🇹🇭', US: '🇺🇸', GB: '🇬🇧', JP: '🇯🇵', KR: '🇰🇷', CN: '🇨🇳',
  SG: '🇸🇬', MY: '🇲🇾', PH: '🇵🇭', ID: '🇮🇩', VN: '🇻🇳', TW: '🇹🇼',
  IN: '🇮🇳', DE: '🇩🇪', FR: '🇫🇷', AU: '🇦🇺', CA: '🇨🇦', BR: '🇧🇷',
};

export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [content, setContent] = useState<ContentCount | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/analytics?days=${days}`).then((r) => r.json()),
      fetch('/api/admin/content').then((r) => r.json()),
    ]).then(([analyticsData, contentData]) => {
      setAnalytics(analyticsData);
      if (Array.isArray(contentData)) {
        const counts: ContentCount = { total: contentData.length, series: 0, variety: 0, event: 0, magazine: 0, award: 0 };
        contentData.forEach((item: any) => {
          const t = item.content_type as keyof Omit<ContentCount, 'total'>;
          if (t in counts) counts[t]++;
        });
        setContent(counts);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-neutral-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wider">
            <span className="bg-gradient-to-r from-[#1E88E5] to-[#FDD835] bg-clip-text text-transparent">
              NamtanFilm
            </span>
            <span className="text-neutral-500 ml-3 text-lg">Admin</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Link href="/admin/users" className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors">
              👥 จัดการผู้ใช้
            </Link>
          )}
          <Link href="/admin/content" className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors">
            📝 จัดการเนื้อหา
          </Link>
          <Link href="/" className="px-4 py-2 text-neutral-500 hover:text-white text-sm transition-colors">
            ← เว็บหลัก
          </Link>
        </div>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {content && (
          <>
            <StatCard label="ทั้งหมด" value={content.total} color="#1E88E5" />
            <StatCard label="Series" value={content.series} color="#4CAF50" />
            <StatCard label="Variety" value={content.variety} color="#FF9800" />
            <StatCard label="Events" value={content.event} color="#E91E63" />
            <StatCard label="Magazine" value={content.magazine} color="#9C27B0" />
            <StatCard label="Awards" value={content.award} color="#FDD835" />
          </>
        )}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Views chart */}
        <div className="lg:col-span-2 bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">📊 Page Views</h2>
            <div className="flex gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    days === d ? 'bg-[#1E88E5] text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="text-3xl font-light mb-4 text-[#1E88E5]">
            {analytics?.totalViews?.toLocaleString() || 0}
            <span className="text-sm text-neutral-500 ml-2">views</span>
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
                      className="w-full bg-gradient-to-t from-[#1E88E5] to-[#64B5F6] rounded-t-sm min-h-[2px]"
                      style={{ height: `${height}%` }}
                      title={`${day}: ${count} views`}
                    />
                    <span className="text-[9px] text-neutral-600">{day.slice(8)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top countries */}
        <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
          <h2 className="text-lg font-medium mb-4">🌍 Top Countries</h2>
          <div className="space-y-3">
            {analytics?.topCountries?.length ? (
              analytics.topCountries.map(({ country, count }) => (
                <div key={country} className="flex items-center justify-between">
                  <span className="text-sm">
                    {COUNTRY_FLAGS[country] || '🏳️'} {country}
                  </span>
                  <span className="text-sm text-neutral-500">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-neutral-600 text-sm">ยังไม่มีข้อมูล</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="mt-6 bg-neutral-900 rounded-xl p-6 border border-neutral-800">
        <h2 className="text-lg font-medium mb-4">📄 Top Pages</h2>
        <div className="space-y-2">
          {analytics?.topPages?.length ? (
            analytics.topPages.map(({ path, count }) => (
              <div key={path} className="flex items-center justify-between py-1.5 border-b border-neutral-800 last:border-0">
                <code className="text-sm text-neutral-300">{path}</code>
                <span className="text-sm text-neutral-500">{count}</span>
              </div>
            ))
          ) : (
            <p className="text-neutral-600 text-sm">ยังไม่มีข้อมูล</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-neutral-800">
      <div className="text-2xl font-light" style={{ color }}>{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}
