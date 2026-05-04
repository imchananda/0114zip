'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit2, Save, X, RefreshCw, TrendingUp, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

/* --- Field definitions --------------------------------------------------- */

type FieldType = 'int' | 'float';

interface FieldDef {
  key: StatsKey;
  label: string;
  labelTh: string;
  icon: string;
  type: FieldType;
  unit?: string;
}

interface FieldGroup {
  label: string;
  fields: FieldDef[];
}

const GROUPS: FieldGroup[] = [
  {
    label: 'โซเชียลมีเดีย',
    fields: [
      { key: 'ig_followers',     label: 'Instagram Followers',   labelTh: 'ผู้ติดตาม Instagram', icon: '📸', type: 'int' },
      { key: 'x_followers',      label: 'X (Twitter) Followers', labelTh: 'ผู้ติดตาม X',          icon: '🐦', type: 'int' },
      { key: 'tiktok_followers', label: 'TikTok Followers',      labelTh: 'ผู้ติดตาม TikTok',    icon: '🎵', type: 'int' },
    ],
  },
  {
    label: 'ชุมชนแฟนคลับ',
    fields: [
      { key: 'community_members', label: 'Community Members', labelTh: 'สมาชิกชุมชน',      icon: '👥', type: 'int' },
      { key: 'countries_reached', label: 'Countries Reached', labelTh: 'ประเทศที่เข้าถึง', icon: '🌏', type: 'int' },
    ],
  },
  {
    label: 'กิจกรรม & การมีส่วนร่วม',
    fields: [
      { key: 'posts_today',         label: 'Posts Today',         labelTh: 'โพสต์วันนี้',               icon: '📝', type: 'int' },
      { key: 'hashtag_uses',        label: 'Hashtag Uses',        labelTh: 'การใช้ Hashtag',             icon: '#️⃣', type: 'int' },
      { key: 'avg_engagement_rate', label: 'Avg Engagement Rate', labelTh: 'อัตราการมีส่วนร่วมเฉลี่ย', icon: '📊', type: 'float', unit: '%' },
    ],
  },
];

const ALL_FIELDS = GROUPS.flatMap(g => g.fields);

/* --- Types --------------------------------------------------------------- */

type StatsKey =
  | 'ig_followers' | 'x_followers' | 'tiktok_followers'
  | 'community_members' | 'countries_reached'
  | 'posts_today' | 'hashtag_uses' | 'avg_engagement_rate';

type Stats = Record<StatsKey, number>;
type HiddenMap = Partial<Record<StatsKey, boolean>>;

const HIDDEN_LS_KEY = 'ntf_social_stats_hidden';

const DEFAULTS: Stats = {
  ig_followers: 10832, x_followers: 5412, tiktok_followers: 8261,
  community_members: 2847, countries_reached: 6,
  posts_today: 156, hashtag_uses: 4230, avg_engagement_rate: 4.6,
};

/* --- Component ----------------------------------------------------------- */

export default function SocialStatsAdmin() {
  const [loading, setLoading]       = useState(true);
  const [stats, setStats]           = useState<Stats>({ ...DEFAULTS });
  const [hidden, setHidden]         = useState<HiddenMap>(() => {
    try {
      const saved = localStorage.getItem(HIDDEN_LS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [editingKey, setEditingKey] = useState<StatsKey | null>(null);
  const [editValue, setEditValue]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState<{ text: string; ok: boolean } | null>(null);

  /* fetch stats */
  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await fetch('/api/social-stats').then(r => r.json());
      if (!data.error) {
        setStats({
          ig_followers:        data.ig_followers        ?? DEFAULTS.ig_followers,
          x_followers:         data.x_followers         ?? DEFAULTS.x_followers,
          tiktok_followers:    data.tiktok_followers    ?? DEFAULTS.tiktok_followers,
          community_members:   data.community_members   ?? DEFAULTS.community_members,
          countries_reached:   data.countries_reached   ?? DEFAULTS.countries_reached,
          posts_today:         data.posts_today         ?? DEFAULTS.posts_today,
          hashtag_uses:        data.hashtag_uses        ?? DEFAULTS.hashtag_uses,
          avg_engagement_rate: data.avg_engagement_rate ?? DEFAULTS.avg_engagement_rate,
        });
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(() => { void fetchStats(); }, 0);
    return () => window.clearTimeout(id);
  }, []);

  /* helpers */
  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 4000);
  };

  const startEdit = (key: StatsKey) => {
    setEditingKey(key);
    setEditValue(String(stats[key]));
  };

  const cancelEdit = () => { setEditingKey(null); setEditValue(''); };

  /* save a single field */
  const saveField = async (field: FieldDef) => {
    const raw = editValue.trim();
    const num = field.type === 'float' ? parseFloat(raw) : parseInt(raw, 10);
    if (isNaN(num) || num < 0) {
      showMsg('ค่าไม่ถูกต้อง กรุณากรอกตัวเลขที่ถูกต้อง', false);
      return;
    }
    setSaving(true);
    const newStats: Stats = { ...stats, [field.key]: num };
    try {
      const res  = await fetch('/api/social-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStats),
      });
      const data = await res.json();
      if (data.success) {
        setStats(newStats);
        setEditingKey(null);
        showMsg('บันทึกข้อมูลสำเร็จ', true);
      } else {
        showMsg(data.error || 'เกิดข้อผิดพลาด', false);
      }
    } catch {
      showMsg('Network error', false);
    } finally {
      setSaving(false);
    }
  };

  /* reset a single field to default */
  const resetField = async (key: StatsKey) => {
    const label = ALL_FIELDS.find(f => f.key === key)?.labelTh ?? key;
    if (!confirm(`รีเซ็ต "${label}" กลับเป็นค่าเริ่มต้น?`)) return;
    const newStats: Stats = { ...stats, [key]: DEFAULTS[key] };
    setSaving(true);
    try {
      const res  = await fetch('/api/social-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStats),
      });
      const data = await res.json();
      if (data.success) {
        setStats(newStats);
        showMsg('รีเซ็ตค่าสำเร็จ', true);
      } else {
        showMsg(data.error || 'เกิดข้อผิดพลาด', false);
      }
    } catch {
      showMsg('Network error', false);
    } finally {
      setSaving(false);
    }
  };

  /* toggle visibility — stored in localStorage for dashboard display */
  const toggleHidden = (key: StatsKey) => {
    const next: HiddenMap = { ...hidden, [key]: !hidden[key] };
    setHidden(next);
    try { localStorage.setItem(HIDDEN_LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const formatValue = (key: StatsKey, type: FieldType, unit?: string) => {
    const v = stats[key];
    return type === 'float'
      ? `${v.toFixed(1)}${unit ?? ''}`
      : `${v.toLocaleString('th-TH')}${unit ?? ''}`;
  };

  const hiddenCount = (Object.values(hidden) as boolean[]).filter(Boolean).length;

  /* --- Render ------------------------------------------------------------- */
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 pb-4 border-b border-[var(--color-border)] gap-4">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/dashboard"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5 w-fit"
          >
            ← Dashboard
          </Link>
          <h1 className="font-display text-2xl font-medium text-[var(--color-text-primary)] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#6cbfd0]" /> จัดการ Social Stats
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            อัปเดตตัวเลข Social Media และชุมชนแฟนคลับสำหรับ Live Dashboard
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/admin/live-dashboard"
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium text-sm flex items-center gap-1.5 hover:text-[#6cbfd0] hover:border-[#6cbfd0]/30 hover:bg-[#6cbfd0]/5 transition-all"
          >
            🔲 จัดการ Layout
          </Link>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] font-medium text-sm flex items-center gap-1.5 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {msg && (
        <div className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium ${
          msg.ok
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-red-500/10  border-red-500/30  text-red-400'
        }`}>
          {msg.ok ? '✅' : '❌'} {msg.text}
        </div>
      )}

      {/* Stats bar */}
      {!loading && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span>📊</span>
              <div>
                <div className="text-base font-medium text-[var(--color-text-primary)]">{ALL_FIELDS.length}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">ฟิลด์ทั้งหมด</div>
              </div>
            </div>
            {hiddenCount > 0 && (
              <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
                <span>🙈</span>
                <div>
                  <div className="text-base font-medium text-[var(--color-text-primary)]">{hiddenCount}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">ซ่อนใน Dashboard</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-24">
          <LoadingFallback message="กำลังโหลด..." />
        </div>
      ) : (
        <div className="space-y-8">
          {GROUPS.map(group => (
            <div key={group.label}>
              {/* group header */}
              <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-[var(--color-border)]" />
                {group.label}
                <span className="flex-1 h-px bg-[var(--color-border)]" />
              </h2>

              <div className="space-y-2">
                {group.fields.map(field => {
                  const isEditing = editingKey === field.key;
                  const isHidden  = !!hidden[field.key];

                  return (
                    <div
                      key={field.key}
                      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 transition-opacity ${isHidden ? 'opacity-50' : ''}`}
                    >
                      {isEditing ? (
                        /* Inline edit */
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 bg-[#6cbfd0]/15">
                            {field.icon}
                          </div>
                          <div className="flex-1 min-w-[160px]">
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">{field.labelTh}</p>
                            <input
                              type="number"
                              min="0"
                              step={field.type === 'float' ? '0.1' : '1'}
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter')  saveField(field);
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              autoFocus
                              className="w-full max-w-xs px-3 py-1.5 rounded-lg bg-[var(--color-bg)] border border-[#6cbfd0] text-[var(--color-text-primary)] text-sm focus:outline-none"
                            />
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => saveField(field)}
                              disabled={saving}
                              className="px-4 py-1.5 rounded-lg bg-[#6cbfd0] text-[#141413] text-sm font-medium flex items-center gap-1.5 hover:bg-[#4a9aab] disabled:opacity-50 transition-colors"
                            >
                              <Save className="w-3.5 h-3.5" />
                              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-4 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm flex items-center gap-1.5 hover:bg-[var(--color-panel)] transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display row */
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${isHidden ? 'bg-[var(--color-panel)]' : 'bg-[#6cbfd0]/15'}`}>
                            {field.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{field.labelTh}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{field.label}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-base font-medium text-[var(--color-text-primary)] tabular-nums">
                              {formatValue(field.key, field.type, field.unit)}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              isHidden
                                ? 'bg-[var(--color-panel)] text-[var(--color-text-muted)]'
                                : 'bg-[#6cbfd0]/20 text-[#6cbfd0]'
                            }`}>
                              {isHidden ? '🙈 ซ่อน' : '👁 แสดง'}
                            </span>
                            {/* toggle visibility */}
                            <button
                              onClick={() => toggleHidden(field.key)}
                              title={isHidden ? 'แสดงบน Dashboard' : 'ซ่อนจาก Dashboard'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isHidden
                                  ? 'text-[var(--color-text-muted)] hover:text-yellow-400 hover:bg-yellow-400/10'
                                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)]'
                              }`}
                            >
                              {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            {/* edit */}
                            <button
                              onClick={() => startEdit(field.key)}
                              title="แก้ไข"
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {/* reset to default */}
                            <button
                              onClick={() => resetField(field.key)}
                              title="รีเซ็ตเป็นค่าเริ่มต้น"
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}