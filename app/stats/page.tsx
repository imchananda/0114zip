'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Header } from '@/components/navigation/Header';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

/* ── Sample data (จะเปลี่ยนเป็นดึงจาก DB ทีหลัง) ── */
const followerHistory = [
  { month: 'Sep', namtan_ig: 2100, film_ig: 1800, namtan_x: 980, film_x: 850 },
  { month: 'Oct', namtan_ig: 2400, film_ig: 2000, namtan_x: 1100, film_x: 920 },
  { month: 'Nov', namtan_ig: 2900, film_ig: 2300, namtan_x: 1350, film_x: 1050 },
  { month: 'Dec', namtan_ig: 3500, film_ig: 2800, namtan_x: 1600, film_x: 1200 },
  { month: 'Jan', namtan_ig: 4200, film_ig: 3400, namtan_x: 2000, film_x: 1500 },
  { month: 'Feb', namtan_ig: 5100, film_ig: 4100, namtan_x: 2500, film_x: 1900 },
  { month: 'Mar', namtan_ig: 6000, film_ig: 4800, namtan_x: 3100, film_x: 2300 },
];

const engagementData = [
  { platform: 'IG', namtan: 4.2, film: 3.8 },
  { platform: 'X', namtan: 5.1, film: 4.6 },
  { platform: 'TikTok', namtan: 7.8, film: 6.5 },
  { platform: 'FB', namtan: 2.1, film: 1.8 },
  { platform: 'YT', namtan: 3.5, film: 3.2 },
];

const fanCountry = [
  { name: 'Thailand', value: 45, color: '#1E88E5' },
  { name: 'China', value: 20, color: '#FDD835' },
  { name: 'Philippines', value: 12, color: '#66BB6A' },
  { name: 'Indonesia', value: 8, color: '#EF5350' },
  { name: 'Japan', value: 6, color: '#AB47BC' },
  { name: 'Others', value: 9, color: '#78909C' },
];

const quickStats = [
  { label: 'IG Total', value: '10.8K', sub: '+23% this month', icon: '📷' },
  { label: 'X Total', value: '5.4K', sub: '+18% this month', icon: '𝕏' },
  { label: 'TikTok Total', value: '8.2K', sub: '+31% this month', icon: '🎵' },
  { label: 'Avg Engagement', value: '4.6%', sub: 'Above industry avg', icon: '📊' },
];

type Tab = 'followers' | 'engagement' | 'audience';

export default function StatsPage() {
  const [tab, setTab] = useState<Tab>('followers');

  const formatK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[var(--color-bg)] pt-24 px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-medium text-[var(--color-text)]">📊 NamtanFilm Stats</h1>
            <Link href="/" className="text-[var(--color-muted)] text-sm hover:text-[var(--color-text)]">← กลับ</Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {quickStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4"
              >
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="text-xl font-light text-[var(--color-text)]">{s.value}</div>
                <div className="text-xs text-[var(--color-muted)]">{s.label}</div>
                <div className="text-[10px] text-green-400 mt-1">{s.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[var(--color-surface)] rounded-xl p-1 border border-[var(--color-border)] mb-6">
            {([
              ['followers', '📈 Followers'],
              ['engagement', '⚡ Engagement'],
              ['audience', '🌍 Audience'],
            ] as [Tab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  tab === key
                    ? 'bg-[#1E88E5] text-white shadow-sm'
                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Charts */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
            {tab === 'followers' && (
              <>
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">Follower Growth (x1000)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={followerHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickFormatter={formatK} />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
                      formatter={((v: number) => formatK(v)) as never}
                    />
                    <Area type="monotone" dataKey="namtan_ig" stroke="#1E88E5" fill="#1E88E5" fillOpacity={0.15} strokeWidth={2} name="น้ำตาล IG" />
                    <Area type="monotone" dataKey="film_ig" stroke="#FDD835" fill="#FDD835" fillOpacity={0.15} strokeWidth={2} name="ฟิล์ม IG" />
                    <Area type="monotone" dataKey="namtan_x" stroke="#42A5F5" fill="none" strokeWidth={1.5} strokeDasharray="5 3" name="น้ำตาล X" />
                    <Area type="monotone" dataKey="film_x" stroke="#FFB300" fill="none" strokeWidth={1.5} strokeDasharray="5 3" name="ฟิล์ม X" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-3 justify-center">
                  <span className="text-xs text-[var(--color-muted)] flex items-center gap-1"><span className="w-3 h-0.5 bg-[#1E88E5] inline-block" /> น้ำตาล IG</span>
                  <span className="text-xs text-[var(--color-muted)] flex items-center gap-1"><span className="w-3 h-0.5 bg-[#FDD835] inline-block" /> ฟิล์ม IG</span>
                  <span className="text-xs text-[var(--color-muted)] flex items-center gap-1"><span className="w-3 h-0.5 bg-[#42A5F5] inline-block border-dashed border-t" /> น้ำตาล X</span>
                  <span className="text-xs text-[var(--color-muted)] flex items-center gap-1"><span className="w-3 h-0.5 bg-[#FFB300] inline-block border-dashed border-t" /> ฟิล์ม X</span>
                </div>
              </>
            )}

            {tab === 'engagement' && (
              <>
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">Engagement Rate by Platform (%)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="platform" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
                      formatter={((v: number) => `${v}%`) as never}
                    />
                    <Bar dataKey="namtan" fill="#1E88E5" radius={[4, 4, 0, 0]} name="น้ำตาล" />
                    <Bar dataKey="film" fill="#FDD835" radius={[4, 4, 0, 0]} name="ฟิล์ม" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-3 justify-center">
                  <span className="text-xs text-[var(--color-muted)] flex items-center gap-1"><span className="w-3 h-3 bg-[#1E88E5] rounded-sm inline-block" /> น้ำตาล</span>
                  <span className="text-xs text-[var(--color-muted)] flex items-center gap-1"><span className="w-3 h-3 bg-[#FDD835] rounded-sm inline-block" /> ฟิล์ม</span>
                </div>
              </>
            )}

            {tab === 'audience' && (
              <>
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">Fan Distribution by Country</h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={fanCountry}
                        cx="50%" cy="50%"
                        outerRadius={90}
                        innerRadius={55}
                        dataKey="value"
                        stroke="none"
                      >
                        {fanCountry.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '12px' }}
                        formatter={((v: number) => `${v}%`) as never}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 min-w-[140px]">
                    {fanCountry.map((c) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                        <span className="text-xs text-[var(--color-text)]">{c.name}</span>
                        <span className="text-xs text-[var(--color-muted)] ml-auto">{c.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="text-center mt-4 text-xs text-[var(--color-muted)]">
            ข้อมูลเป็นตัวอย่าง — จะเชื่อมต่อ live data เมื่อพร้อม
          </p>
        </div>
      </div>
    </>
  );
}
