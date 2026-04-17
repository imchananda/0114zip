'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronDown, ChevronRight, Plus, Edit2, Trash2,
  Eye, EyeOff, Star, Save, X, ArrowUpRight,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

type Platform = 'instagram' | 'x' | 'tiktok' | 'facebook' | 'youtube' | 'threads' | 'weibo' | 'rednote';
type Artist   = 'namtan' | 'film' | 'both';

interface MediaEvent {
  id: string;
  title: string;
  description: string | null;
  hashtags: string[];
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  // schedule sync fields
  actors: string[];
  event_type: string;
  venue: string | null;
  link: string | null;
  content_item_id: string | null;
  brand_collab_id: number | null;
  media_posts?: MediaPost[];
}

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
  brand_collab_id: number | null;
}

interface BrandSimple {
  id: number;
  brand_name: string;
  brand_logo: string | null;
  artists: string[];
}

// ── Constants ──────────────────────────────────────────────────────────────────

const PLATFORMS: { id: Platform; label: string; icon: string; color: string }[] = [
  { id: 'instagram', label: 'Instagram',    icon: '📸', color: 'bg-[#E4405F]/20 text-[#E4405F]' },
  { id: 'x',         label: 'X (Twitter)',  icon: '✕',  color: 'bg-sky-500/20 text-sky-400' },
  { id: 'tiktok',    label: 'TikTok',       icon: '🎵', color: 'bg-[#FF0050]/20 text-[#FF0050]' },
  { id: 'youtube',   label: 'YouTube',      icon: '▶️', color: 'bg-red-600/20 text-red-400' },
  { id: 'facebook',  label: 'Facebook',     icon: '👍', color: 'bg-blue-600/20 text-blue-400' },
  { id: 'threads',   label: 'Threads',      icon: '🧵', color: 'bg-neutral-400/20 text-neutral-300' },
  { id: 'weibo',     label: 'Weibo',        icon: '🌐', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'rednote',   label: 'RedNote',      icon: '📕', color: 'bg-rose-500/20 text-rose-400' },
];
const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map(p => [p.id, p]));

const ARTIST_OPTIONS = [
  { id: 'both',   label: '💙💛 คู่จิ้น' },
  { id: 'namtan', label: '💙 น้ำตาล' },
  { id: 'film',   label: '💛 ฟิล์ม' },
];

const METRICS: { icon: string; key: keyof MediaPost; goalKey: keyof MediaPost; label: string }[] = [
  { icon: '👁',  key: 'views',    goalKey: 'goal_views',    label: 'Views' },
  { icon: '❤️',  key: 'likes',    goalKey: 'goal_likes',    label: 'Likes' },
  { icon: '💬',  key: 'comments', goalKey: 'goal_comments', label: 'Comments' },
  { icon: '🔁',  key: 'shares',   goalKey: 'goal_shares',   label: 'Shares' },
  { icon: '🔖',  key: 'saves',    goalKey: 'goal_saves',    label: 'Saves' },
];

const EVENT_TYPES = [
  { id: 'event',   label: '📅 Event' },
  { id: 'show',    label: '🎬 Show' },
  { id: 'concert', label: '🎤 Concert' },
  { id: 'fanmeet', label: '💙 Fan Meet' },
  { id: 'live',    label: '📱 Live' },
  { id: 'release', label: '🎬 Release' },
];

const EMPTY_EVENT: Partial<MediaEvent> = {
  title: '', description: '', hashtags: [], start_date: null, end_date: null, is_active: true,
  actors: ['both'], event_type: 'event', venue: null, link: null, content_item_id: null,
  brand_collab_id: null,
};

const EMPTY_POST: Partial<MediaPost> = {
  platform: 'instagram', title: '', post_url: '', caption: '', artist: 'both',
  post_date: new Date().toISOString().split('T')[0],
  views: 0, likes: 0, comments: 0, shares: 0, saves: 0,
  goal_views: 0, goal_likes: 0, goal_comments: 0, goal_shares: 0, goal_saves: 0,
  hashtags: [], is_focus: false, is_visible: true,
  brand_collab_id: null,
};

const IC = 'px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:border-[#6cbfd0] focus:outline-none';

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseTags(input: string): string[] {
  return input.split(/[\s,]+/).map(t => t.trim()).filter(Boolean);
}
function fmtTags(tags: string[]): string { return tags.join(' '); }

function MetricBar({ icon, value, goal }: { icon: string; value: number; goal: number }) {
  const pct  = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const done = goal > 0 && value >= goal;
  return (
    <div className="space-y-0.5 min-w-0">
      <div className="flex justify-between text-[10px] gap-1">
        <span>{icon}</span>
        <span className={`tabular-nums truncate ${done ? 'text-green-400' : 'text-[var(--color-text-muted)]'}`}>
          {value.toLocaleString()}{goal > 0 ? `/${goal.toLocaleString()}` : ''}
        </span>
      </div>
      {goal > 0 && (
        <div className="h-1 bg-[var(--color-panel)] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${done ? 'bg-green-500' : 'bg-[#6cbfd0]'}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminMediaPage() {
  const [events,   setEvents]  = useState<MediaEvent[]>([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Brands list for linking
  const [brands, setBrands] = useState<BrandSimple[]>([]);
  const [newBrandName, setNewBrandName] = useState('');  // inline brand creation

  // Event form state
  const [showEventForm,   setShowEventForm]   = useState(false);
  const [editingEvent,    setEditingEvent]    = useState<MediaEvent | null>(null);
  const [eventForm,       setEventForm]       = useState<Partial<MediaEvent>>(EMPTY_EVENT);
  const [eventTagsInput,  setEventTagsInput]  = useState('');

  // Post form state
  const [creatingPostFor, setCreatingPostFor] = useState<string | null>(null); // event_id
  const [editingPost,     setEditingPost]     = useState<MediaPost | null>(null);
  const [postForm,        setPostForm]        = useState<Partial<MediaPost>>(EMPTY_POST);
  const [postTagsInput,   setPostTagsInput]   = useState('');

  // ── Data fetch ──────────────────────────────────────────────────────────────

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media-events');
      if (!res.ok) throw new Error(await res.text());
      setEvents(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'โหลดล้มเหลว');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Load brands for the link dropdown
  useEffect(() => {
    fetch('/api/brands')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d?.brands)) setBrands(d.brands); })
      .catch(() => {});
  }, []);

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  // ── Event CRUD ──────────────────────────────────────────────────────────────

  function openCreateEvent() {
    setEditingEvent(null); setEventForm(EMPTY_EVENT); setEventTagsInput('');
    setShowEventForm(true); setError('');
  }
  function openEditEvent(ev: MediaEvent) {
    setEditingEvent(ev); setEventForm({ ...ev }); setEventTagsInput(fmtTags(ev.hashtags ?? []));
    setShowEventForm(true); setError('');
  }
  function cancelEventForm() {
    setShowEventForm(false); setEditingEvent(null); setEventForm(EMPTY_EVENT);
    setEventTagsInput(''); setNewBrandName(''); setError('');
  }
  async function handleSaveEvent() {
    if (!eventForm.title?.trim()) { setError('กรุณาใส่ชื่อกิจกรรม'); return; }
    let brandId = eventForm.brand_collab_id ?? null;

    // Inline brand creation: if user typed a new brand name, create it first
    if (newBrandName.trim()) {
      const actors = eventForm.actors?.filter(a => a !== 'both') ?? [];
      const res = await fetch('/api/admin/brand-collabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: newBrandName.trim(),
          artists: actors.length ? actors : ['namtan', 'film'],
          category: 'Other',
          collab_type: 'event',
          visible: true,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        brandId = created.id;
        // Refresh brand list so badge appears immediately
        setBrands(prev => [...prev, { id: created.id, brand_name: created.brand_name, brand_logo: created.brand_logo ?? null, artists: created.artists ?? [] }]);
        setNewBrandName('');
      } else {
        setError('สร้างแบรนด์ล้มเหลว: ' + ((await res.json()).error ?? ''));
        return;
      }
    }

    const payload = { ...eventForm, brand_collab_id: brandId, hashtags: parseTags(eventTagsInput) };
    try {
      const res = await fetch('/api/admin/media-events', {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEvent ? { ...payload, id: editingEvent.id } : payload),
      });
      if (!res.ok) { setError((await res.json()).error ?? 'บันทึกล้มเหลว'); return; }
      cancelEventForm(); await fetchEvents();
    } catch { setError('เกิดข้อผิดพลาด'); }
  }
  async function handleDeleteEvent(id: string) {
    if (!confirm('ลบกิจกรรมนี้? โพสต์จะถูกยกเลิกการเชื่อมโยงแต่ไม่ถูกลบ')) return;
    await fetch(`/api/admin/media-events?id=${id}`, { method: 'DELETE' });
    await fetchEvents();
  }
  async function toggleEventActive(ev: MediaEvent) {
    await fetch('/api/admin/media-events', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ev.id, is_active: !ev.is_active }),
    });
    await fetchEvents();
  }

  // ── Post CRUD ───────────────────────────────────────────────────────────────

  function openCreatePost(eventId: string, eventHashtags: string[], eventBrandId?: number | null) {
    setEditingPost(null);
    setPostForm({ ...EMPTY_POST, event_id: eventId, hashtags: eventHashtags, brand_collab_id: eventBrandId ?? null });
    setPostTagsInput(fmtTags(eventHashtags));
    setCreatingPostFor(eventId); setError('');
    setExpanded(prev => new Set([...prev, eventId]));
  }
  function openEditPost(post: MediaPost) {
    setEditingPost(post); setPostForm({ ...post });
    setPostTagsInput(fmtTags(post.hashtags ?? []));
    setCreatingPostFor(null); setError('');
  }
  function cancelPostForm() {
    setCreatingPostFor(null); setEditingPost(null);
    setPostForm(EMPTY_POST); setPostTagsInput(''); setError('');
  }
  async function handleSavePost() {
    if (!postForm.post_url?.trim()) { setError('กรุณาใส่ URL'); return; }
    const payload = { ...postForm, hashtags: parseTags(postTagsInput) };
    try {
      const res = await fetch('/api/admin/media', {
        method: editingPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPost ? { ...payload, id: editingPost.id } : payload),
      });
      if (!res.ok) { setError((await res.json()).error ?? 'บันทึกล้มเหลว'); return; }
      cancelPostForm(); await fetchEvents();
    } catch { setError('เกิดข้อผิดพลาด'); }
  }
  async function handleDeletePost(id: string) {
    if (!confirm('ลบโพสต์นี้?')) return;
    await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
    await fetchEvents();
  }
  async function togglePostFlag(post: MediaPost, field: 'is_visible' | 'is_focus') {
    await fetch('/api/admin/media', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, [field]: !post[field] }),
    });
    await fetchEvents();
  }

  // ── Sub-forms (render functions, not components) ───────────────────────────

  function renderEventForm() {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--namtan-teal)]/40 rounded-2xl p-5 mb-6">
        <h3 className="text-base font-medium text-[var(--color-text-primary)] mb-4">
          {editingEvent ? '✏️ แก้ไขกิจกรรม' : '🎯 สร้างกิจกรรมใหม่'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Brand link — at top, most prominent */}
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
              🏢 เชื่อมโยงแบรนด์
              <span className="opacity-50 font-normal">— สื่อใหม่ใน event นี้จะ inherit brand อัตโนมัติ</span>
            </label>
            <div className="flex gap-2">
              <select
                className={IC + ' flex-1'}
                value={newBrandName !== '' ? '__new__' : (eventForm.brand_collab_id ?? '')}
                onChange={e => {
                  if (e.target.value === '__new__') {
                    setNewBrandName(' '); // trigger inline input (will be trimmed on save)
                    setEventForm({ ...eventForm, brand_collab_id: null });
                  } else {
                    setNewBrandName('');
                    setEventForm({ ...eventForm, brand_collab_id: e.target.value ? parseInt(e.target.value, 10) : null });
                  }
                }}
              >
                <option value="">— ไม่เชื่อมโยงกับแบรนด์ —</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.brand_name}{b.artists?.length ? ` (${b.artists.join(', ')})` : ''}
                  </option>
                ))}
                <option value="__new__">➕ สร้างแบรนด์ใหม่...</option>
              </select>
            </div>
            {/* Inline new brand name input — only shown when __new__ selected */}
            {newBrandName !== '' && (
              <div className="mt-1.5">
                <input
                  type="text"
                  className={IC + ' w-full'}
                  placeholder="พิมพ์ชื่อแบรนด์ — จะสร้าง Brand Collab อัตโนมัติเมื่อบันทึก"
                  autoFocus
                  value={newBrandName.trimStart()}
                  onChange={e => setNewBrandName(e.target.value || ' ')}
                />
                {newBrandName.trim() && (
                  <p className="text-[10px] text-purple-300 mt-1">
                    ✨ จะสร้าง &ldquo;{newBrandName.trim()}&rdquo; ใน Brand Collaborations อัตโนมัติ
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">ชื่อกิจกรรม *</label>
            <input type="text" className={IC} placeholder="เช่น Namtan at Prada BKK 2026"
              value={eventForm.title ?? ''}
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">คำอธิบาย (ไม่บังคับ)</label>
            <input type="text" className={IC} placeholder="รายละเอียดเพิ่มเติม"
              value={eventForm.description ?? ''}
              onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
          </div>
          {/* Schedule fields */}
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">ประเภทงาน</label>
            <select className={IC + ' w-full'}
              value={eventForm.event_type ?? 'event'}
              onChange={e => setEventForm({ ...eventForm, event_type: e.target.value })}>
              {EVENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">ศิลปิน</label>
            <div className="flex gap-3 pt-2">
              {[{id:'namtan',label:'💙 น้ำตาล'},{id:'film',label:'💛 ฟิล์ม'},{id:'both',label:'💙💛 คู่จิ้น'}].map(a => (
                <label key={a.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[#6cbfd0]"
                    checked={(eventForm.actors ?? []).includes(a.id)}
                    onChange={e => {
                      const cur = eventForm.actors ?? [];
                      setEventForm({ ...eventForm, actors: e.target.checked ? [...cur.filter(x=>x!==a.id), a.id] : cur.filter(x=>x!==a.id) });
                    }} />
                  {a.label}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">สถานที่ / Venue</label>
            <input type="text" className={IC + ' w-full'} placeholder="เช่น Icon Siam, Bangkok"
              value={eventForm.venue ?? ''}
              onChange={e => setEventForm({ ...eventForm, venue: e.target.value || null })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">ลิงก์กิจกรรม (ไม่บังคับ)</label>
            <input type="url" className={IC + ' w-full'} placeholder="https://..."
              value={eventForm.link ?? ''}
              onChange={e => setEventForm({ ...eventForm, link: e.target.value || null })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">วันเริ่มต้น</label>
            <input type="date" className={IC + ' w-full'}
              value={eventForm.start_date ?? ''}
              onChange={e => setEventForm({ ...eventForm, start_date: e.target.value || null })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">วันสิ้นสุด</label>
            <input type="date" className={IC + ' w-full'}
              value={eventForm.end_date ?? ''}
              onChange={e => setEventForm({ ...eventForm, end_date: e.target.value || null })} />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">Hashtags ของกิจกรรม (คั่นด้วย space หรือ comma)</label>
            <textarea rows={3} className={IC + ' w-full font-mono resize-none'}
              placeholder="#namtatprada #ilonaprada2026 #prada"
              value={eventTagsInput}
              onChange={e => setEventTagsInput(e.target.value)} />
            <p className="text-[10px] text-[var(--color-text-muted)]">{parseTags(eventTagsInput).length} hashtags · จะดึงเป็น default ให้กับทุกสื่อในกิจกรรมนี้</p>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" id="ev-active" className="w-4 h-4 accent-[#6cbfd0]"
              checked={eventForm.is_active !== false}
              onChange={e => setEventForm({ ...eventForm, is_active: e.target.checked })} />
            <label htmlFor="ev-active" className="text-sm text-[var(--color-text-primary)]">เปิดใช้งานกิจกรรม</label>
          </div>
        </div>
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
        <div className="flex gap-2 mt-5 pt-4 border-t border-[var(--color-border)]">
          <button onClick={handleSaveEvent}
            className="px-5 py-2 rounded-lg bg-[#6cbfd0] text-[#141413] text-sm font-medium flex items-center gap-2 hover:bg-[#4a9aab] transition-colors">
            <Save className="w-4 h-4" /> บันทึก
          </button>
          <button onClick={cancelEventForm}
            className="px-5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm flex items-center gap-2 hover:text-[var(--color-text-primary)] transition-colors">
            <X className="w-4 h-4" /> ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  function renderPostForm() {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-3">
        <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-4">
          {editingPost ? '✏️ แก้ไขสื่อ' : '➕ เพิ่มสื่อใหม่'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">แพลตฟอร์ม</label>
            <select className={IC + ' w-full'}
              value={postForm.platform ?? 'instagram'}
              onChange={e => setPostForm({ ...postForm, platform: e.target.value as Platform })}>
              {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">ศิลปิน</label>
            <select className={IC + ' w-full'}
              value={postForm.artist ?? 'both'}
              onChange={e => setPostForm({ ...postForm, artist: e.target.value as Artist })}>
              {ARTIST_OPTIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-xs text-[var(--color-text-muted)]">ชื่อสื่อ (ไม่บังคับ)</label>
            <input type="text" className={IC + ' w-full'} placeholder="เช่น ลุคที่1 งาน Prada"
              value={postForm.title ?? ''}
              onChange={e => setPostForm({ ...postForm, title: e.target.value })} />
          </div>
          <div className="col-span-2 sm:col-span-3 space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">URL *</label>
            <input type="url" className={IC + ' w-full'} placeholder="https://..."
              value={postForm.post_url ?? ''}
              onChange={e => setPostForm({ ...postForm, post_url: e.target.value })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">วันที่โพสต์</label>
            <input type="date" className={IC + ' w-full'}
              value={postForm.post_date ? postForm.post_date.split('T')[0] : ''}
              onChange={e => setPostForm({ ...postForm, post_date: e.target.value })} />
          </div>
          <div className="col-span-2 sm:col-span-4 space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">Caption</label>
            <textarea rows={2} className={IC + ' w-full resize-none'} placeholder="ข้อความในโพสต์..."
              value={postForm.caption ?? ''}
              onChange={e => setPostForm({ ...postForm, caption: e.target.value })} />
          </div>

          {/* Engagement & Goals */}
          <div className="col-span-2 sm:col-span-4">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Engagement & เป้าหมาย <span className="opacity-60">(บน = ยอดจริง · ล่าง = เป้าหมาย)</span></p>
            <div className="grid grid-cols-5 gap-2">
              {METRICS.map(({ icon, key, goalKey, label }) => (
                <div key={String(key)} className="space-y-1">
                  <label className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">{icon} {label}</label>
                  <input type="number" min={0} placeholder="0" className={IC + ' w-full text-xs py-1.5'}
                    value={(postForm as Record<string, unknown>)[key as string] as number ?? 0}
                    onChange={e => setPostForm({ ...postForm, [key]: parseInt(e.target.value) || 0 })} />
                  <input type="number" min={0} placeholder="เป้า" className={`${IC} w-full text-xs py-1.5 border-dashed opacity-70`}
                    value={(postForm as Record<string, unknown>)[goalKey as string] as number ?? 0}
                    onChange={e => setPostForm({ ...postForm, [goalKey]: parseInt(e.target.value) || 0 })} />
                </div>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div className="col-span-2 sm:col-span-4 space-y-1">
            <label className="text-xs text-[var(--color-text-muted)]">Hashtags <span className="opacity-60">(ดึงมาจากกิจกรรม — แก้ไขได้)</span></label>
            <textarea rows={2} className={IC + ' w-full font-mono text-xs resize-none'}
              value={postTagsInput}
              onChange={e => setPostTagsInput(e.target.value)} />
            <p className="text-[10px] text-[var(--color-text-muted)]">{parseTags(postTagsInput).length} hashtags</p>
          </div>

          {/* Flags */}
          <div className="col-span-2 sm:col-span-4 flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-amber-400"
                checked={postForm.is_focus === true}
                onChange={e => setPostForm({ ...postForm, is_focus: e.target.checked })} />
              <Star className="w-3.5 h-3.5 text-amber-400" /> Focus (อันดับ 1)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-[#6cbfd0]"
                checked={postForm.is_visible !== false}
                onChange={e => setPostForm({ ...postForm, is_visible: e.target.checked })} />
              <Eye className="w-3.5 h-3.5" /> แสดงผล
            </label>
          </div>

          {/* Brand link */}
          <div className="col-span-2 sm:col-span-4 space-y-1">
            <label className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
              🏢 เชื่อมโยงแบรนด์
              <span className="opacity-50 font-normal">— สื่อนี้จะถูก sync อัตโนมัติไปยัง Brand Collaborations</span>
            </label>
            <select
              className={IC + ' w-full'}
              value={postForm.brand_collab_id ?? ''}
              onChange={e => setPostForm({
                ...postForm,
                brand_collab_id: e.target.value ? parseInt(e.target.value, 10) : null,
              })}
            >
              <option value="">— ไม่เชื่อมโยงกับแบรนด์ —</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.brand_name}
                  {b.artists?.length ? ` (${b.artists.join(', ')})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
        <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
          <button onClick={handleSavePost}
            className="px-4 py-2 rounded-lg bg-[#6cbfd0] text-[#141413] text-sm font-medium flex items-center gap-2 hover:bg-[#4a9aab] transition-colors">
            <Save className="w-4 h-4" /> บันทึก
          </button>
          <button onClick={cancelPostForm}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm flex items-center gap-2 hover:text-[var(--color-text-primary)] transition-colors">
            <X className="w-4 h-4" /> ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 pb-4 border-b border-[var(--color-border)] gap-4">
        <div>
          <Link href="/admin/dashboard"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-1.5 w-fit mb-1">
            ← Dashboard
          </Link>
          <h1 className="font-display text-2xl font-medium text-[var(--color-text-primary)] flex items-center gap-2">
            🎞️ Media & Engagement
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">จัดการกิจกรรมและสื่อโซเชียลมีเดีย</p>
        </div>
        {!showEventForm && (
          <button onClick={openCreateEvent}
            className="px-4 py-2 rounded-xl bg-[#6cbfd0] text-[#141413] font-medium text-sm flex items-center gap-1.5 hover:bg-[#4a9aab] transition-colors shrink-0">
            <Plus className="w-4 h-4" /> สร้างกิจกรรม
          </button>
        )}
      </div>

      {/* Event Form */}
      {showEventForm && renderEventForm()}

      {/* Loading */}
      {loading && <div className="text-center py-16 text-[var(--color-text-muted)]">กำลังโหลด...</div>}

      {/* Empty state */}
      {!loading && events.length === 0 && !showEventForm && (
        <div className="text-center py-20 border border-[var(--color-border)] rounded-2xl border-dashed text-[var(--color-text-muted)]">
          <p className="text-5xl mb-3">🎯</p>
          <p className="text-sm mb-1 font-medium">ยังไม่มีกิจกรรม</p>
          <p className="text-xs">กดปุ่ม &quot;สร้างกิจกรรม&quot; ด้านบนเพื่อเริ่มต้น</p>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-4">
        {events.map(ev => {
          const isOpen  = expanded.has(ev.id);
          const posts   = ev.media_posts ?? [];
          const focused = posts.filter(p => p.is_focus).length;

          return (
            <div key={ev.id}
              className={`bg-[var(--color-surface)] border rounded-2xl overflow-hidden ${
                ev.is_active ? 'border-[var(--color-border)]' : 'border-[var(--color-border)] opacity-60'
              }`}>

              {/* Event Header Row */}
              <div className="flex items-start gap-3 px-4 py-4">
                <button onClick={() => toggleExpand(ev.id)}
                  className="mt-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors shrink-0">
                  {isOpen
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[var(--color-text-primary)]">{ev.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      ev.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-[var(--color-panel)] text-[var(--color-text-muted)]'
                    }`}>{ev.is_active ? '● active' : '○ inactive'}</span>
                    <span className="text-[10px] bg-[var(--color-panel)] text-[var(--color-text-muted)] px-2 py-0.5 rounded-full">
                      {posts.length} สื่อ{focused > 0 ? ` · ⭐ ${focused} focus` : ''}
                    </span>
                    {ev.brand_collab_id && (() => {
                      const b = brands.find(x => x.id === ev.brand_collab_id);
                      return b ? (
                        <span className="text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/25">
                          🏢 {b.brand_name}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  {(ev.start_date || ev.end_date) && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      📅 {ev.start_date ?? '?'} → {ev.end_date ?? '?'}
                    </p>
                  )}
                  {ev.description && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{ev.description}</p>
                  )}
                  {(ev.hashtags?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ev.hashtags.slice(0, 7).map(tag => (
                        <span key={tag} className="text-[10px] bg-[#6cbfd0]/10 text-[#6cbfd0] px-1.5 py-0.5 rounded border border-[#6cbfd0]/20">
                          {tag}
                        </span>
                      ))}
                      {ev.hashtags.length > 7 && (
                        <span className="text-[10px] text-[var(--color-text-muted)]">+{ev.hashtags.length - 7}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Event Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!creatingPostFor && !editingPost && (
                    <button
                      onClick={() => { openCreatePost(ev.id, ev.hashtags ?? [], ev.brand_collab_id); setExpanded(prev => new Set([...prev, ev.id])); }}
                      className="px-3 py-1.5 rounded-lg bg-[#6cbfd0]/15 border border-[#6cbfd0]/40 text-[#6cbfd0] text-xs font-medium flex items-center gap-1.5 hover:bg-[#6cbfd0]/25 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> เพิ่มสื่อ
                    </button>
                  )}
                  <button onClick={() => toggleEventActive(ev)}
                    title={ev.is_active ? 'ปิดกิจกรรม' : 'เปิดกิจกรรม'}
                    className={`p-1.5 rounded-lg transition-colors ${
                      ev.is_active
                        ? 'text-green-400 hover:bg-green-400/10'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-panel)]'
                    }`}>
                    {ev.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEditEvent(ev)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteEvent(ev.id)}
                    className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Posts Panel (expanded) */}
              {isOpen && (
                <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-2 bg-[var(--color-bg)]/30">

                  {/* Post form (create or edit within this event) */}
                  {(creatingPostFor === ev.id ||
                    (editingPost && editingPost.event_id === ev.id)) &&
                    renderPostForm()}

                  {/* Empty posts */}
                  {posts.length === 0 && creatingPostFor !== ev.id && !editingPost && (
                    <p className="text-xs text-[var(--color-text-muted)] text-center py-4">
                      ยังไม่มีสื่อ — กดปุ่ม &quot;+ เพิ่มสื่อ&quot; ด้านล่าง
                    </p>
                  )}

                  {/* Post list */}
                  {posts.map(post => {
                    const plat     = PLATFORM_MAP[post.platform];
                    const hasGoals = METRICS.some(m =>
                      ((post as Record<string, unknown>)[m.goalKey as string] as number) > 0
                    );
                    const isEditingThis = editingPost?.id === post.id;

                    if (isEditingThis) return null; // form shown above

                    return (
                      <div key={post.id}
                        className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 ${
                          !post.is_visible ? 'opacity-50' : ''
                        }`}>
                        <div className="flex items-start gap-3">
                          {/* Platform icon */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${plat?.color ?? 'bg-neutral-500/20 text-neutral-300'}`}>
                            {plat?.icon ?? '📱'}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Badges row */}
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${plat?.color}`}>{plat?.label}</span>
                              {post.title && (
                                <span className="text-sm font-medium text-[var(--color-text-primary)]">{post.title}</span>
                              )}
                              {post.is_focus && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" /> Focus
                                </span>
                              )}
                              {!post.is_visible && (
                                <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">ซ่อน</span>
                              )}
                              {post.brand_collab_id && (() => {
                                const b = brands.find(x => x.id === post.brand_collab_id);
                                return b ? (
                                  <span className="text-[10px] bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/25 flex items-center gap-0.5">
                                    🏢 {b.brand_name}
                                  </span>
                                ) : null;
                              })()}
                            </div>

                            {post.caption && (
                              <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mb-1.5">{post.caption}</p>
                            )}

                            {/* Metrics */}
                            {hasGoals ? (
                              <div className="grid grid-cols-5 gap-2 mt-1">
                                {METRICS.map(({ icon, key, goalKey }) => (
                                  <MetricBar key={String(key)} icon={icon}
                                    value={(post as Record<string, number>)[key as string] ?? 0}
                                    goal={(post as Record<string, number>)[goalKey as string] ?? 0} />
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[var(--color-text-muted)] tabular-nums">
                                👁 {(post.views ?? 0).toLocaleString()} · ❤️ {(post.likes ?? 0).toLocaleString()} · 💬 {(post.comments ?? 0).toLocaleString()} · 🔁 {(post.shares ?? 0).toLocaleString()} · 🔖 {(post.saves ?? 0).toLocaleString()}
                              </p>
                            )}

                            {/* Hashtags preview */}
                            {(post.hashtags?.length ?? 0) > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {post.hashtags.slice(0, 4).map(t => (
                                  <span key={t} className="text-[9px] px-1.5 py-0.5 bg-black/20 text-neutral-400 rounded border border-white/5">{t}</span>
                                ))}
                                {post.hashtags.length > 4 && (
                                  <span className="text-[9px] text-[var(--color-text-muted)]">+{post.hashtags.length - 4}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Post actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <a href={post.post_url} target="_blank" rel="noreferrer"
                              className="p-1.5 text-[#6cbfd0] hover:bg-[#6cbfd0]/10 rounded-lg transition-colors" title="เปิด URL">
                              <ArrowUpRight className="w-4 h-4" />
                            </a>
                            <button onClick={() => togglePostFlag(post, 'is_focus')}
                              title={post.is_focus ? 'ยกเลิก Focus' : 'ตั้งเป็น Focus'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                post.is_focus
                                  ? 'text-amber-400 hover:bg-amber-400/10'
                                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-panel)]'
                              }`}>
                              <Star className={`w-4 h-4 ${post.is_focus ? 'fill-amber-400' : ''}`} />
                            </button>
                            <button onClick={() => togglePostFlag(post, 'is_visible')}
                              title={post.is_visible ? 'ซ่อน' : 'แสดง'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                post.is_visible
                                  ? 'text-green-400 hover:bg-green-400/10'
                                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-panel)]'
                              }`}>
                              {post.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button onClick={() => openEditPost(post)}
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}


                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}