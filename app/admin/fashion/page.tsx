'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FASHION_CATEGORY_IDS, type FashionCategoryId } from '@/lib/fashion-constants';

type FashionEventRow = {
  id: string;
  event_name: string;
  title_thai: string | null;
  brands: string[];
  location: string | null;
  category: string;
  actors: string[];
  hashtag: string | null;
  engagement: number | null;
  emv: number | null;
  miv: number | null;
  event_date: string | null;
  image_url: string | null;
  look_count: number;
  in_highlight: boolean;
  sort_order: number;
  visible: boolean;
};

const emptyForm: Partial<FashionEventRow> = {
  event_name: '',
  title_thai: '',
  brands: [],
  location: '',
  category: 'runway',
  actors: ['both'],
  hashtag: '',
  engagement: null,
  emv: null,
  miv: null,
  event_date: '',
  image_url: '',
  look_count: 1,
  in_highlight: true,
  sort_order: 0,
  visible: true,
};

function brandsToInput(brands: string[] | undefined) {
  return (brands ?? []).join(', ');
}

function parseBrandsInput(s: string): string[] {
  return s.split(/[,，]/).map((x) => x.trim()).filter(Boolean);
}

function actorsFromChecks(namtan: boolean, film: boolean, together: boolean): string[] {
  if (together) return ['both'];
  if (namtan && film) return ['namtan', 'film'];
  if (namtan) return ['namtan'];
  if (film) return ['film'];
  return ['both'];
}

function checksFromActors(actors: string[] | undefined) {
  const a = (actors ?? []).map((x) => x.toLowerCase());
  if (a.includes('both')) {
    return { namtan: false, film: false, together: true };
  }
  return {
    namtan: a.includes('namtan'),
    film: a.includes('film'),
    together: false,
  };
}

export default function AdminFashionPage() {
  const [rows, setRows] = useState<FashionEventRow[]>([]);
  const [editing, setEditing] = useState<Partial<FashionEventRow> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [brandsText, setBrandsText] = useState('');
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [checks, setChecks] = useState({ namtan: false, film: false, together: true });

  const load = useCallback(() => {
    fetch('/api/admin/fashion-events')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRows(data as FashionEventRow[]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setIsCreating(true);
    setEditing({ ...emptyForm });
    setBrandsText('');
    setChecks({ namtan: false, film: false, together: true });
  };

  const openEdit = (row: FashionEventRow) => {
    setIsCreating(false);
    setEditing({ ...row });
    setBrandsText(brandsToInput(row.brands));
    setChecks(checksFromActors(row.actors));
  };

  const closeForm = () => {
    setEditing(null);
    setIsCreating(false);
  };

  const save = async () => {
    if (!editing?.event_name?.trim()) {
      setMsg('กรุณากรอกชื่องาน');
      return;
    }
    const actors = actorsFromChecks(checks.namtan, checks.film, checks.together);
    const payload = {
      event_name: editing.event_name,
      title_thai: editing.title_thai || null,
      brands: parseBrandsInput(brandsText),
      location: editing.location || null,
      category: (editing.category as FashionCategoryId) || 'runway',
      actors,
      hashtag: editing.hashtag || null,
      engagement: editing.engagement,
      emv: editing.emv,
      miv: editing.miv,
      event_date: editing.event_date || null,
      image_url: editing.image_url || null,
      look_count: editing.look_count ?? 1,
      in_highlight: Boolean(editing.in_highlight),
      sort_order: editing.sort_order ?? 0,
      visible: editing.visible !== false,
    };

    try {
      if (isCreating) {
        const res = await fetch('/api/admin/fashion-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const e = await res.json();
          setMsg(e.error ?? 'บันทึกไม่สำเร็จ');
          return;
        }
        setMsg('เพิ่มรายการแล้ว');
        load();
        closeForm();
      } else if (editing?.id) {
        const res = await fetch('/api/admin/fashion-events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editing.id }),
        });
        if (!res.ok) {
          const e = await res.json();
          setMsg(e.error ?? 'บันทึกไม่สำเร็จ');
          return;
        }
        setMsg('บันทึกแล้ว');
        load();
        closeForm();
      }
    } catch {
      setMsg('เกิดข้อผิดพลาด');
    }
    setTimeout(() => setMsg(''), 4000);
  };

  const remove = async (id: string) => {
    if (!confirm('ลบอีเว้นต์นี้?')) return;
    const res = await fetch(`/api/admin/fashion-events?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.id !== id));
      setMsg('ลบแล้ว');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.set('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const j = (await res.json()) as { url?: string; error?: string };
      if (j.url) {
        setEditing((e) => (e ? { ...e, image_url: j.url } : e));
        setMsg('อัปโหลดรูปแล้ว');
        setTimeout(() => setMsg(''), 2000);
      } else {
        setMsg(j.error ?? 'อัปโหลดไม่สำเร็จ');
      }
    } catch {
      setMsg('อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex flex-col gap-1 mb-6 pb-4 border-b border-[var(--color-border)]">
        <Link
          href="/admin/dashboard"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors w-fit"
        >
          ← Dashboard
        </Link>
        <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)]">👗 แฟชั่น & อีเว้นต์</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          กรอกข้อมูลอีเว้นต์แฟชั่นเพื่อแสดงบนหน้าแรก (ส่วน Fashion) หลังรัน SQL sync รายการจะสร้าง/อัปเดตแถวใน{' '}
          <strong className="text-[var(--color-text-primary)]">Schedule</strong> อัตโนมัติ
          (ตาราง <code className="text-xs">content_items</code> ประเภท <code className="text-xs">fashion</code>).
          หากลบเฉพาะใน Schedule แล้วลิงก์หลุด ให้กดบันทึกอีกครั้งในหน้านี้เพื่อสร้างคิวงานกลับ
        </p>
        {msg && <p className="text-sm text-amber-300/90 mt-2">{msg}</p>}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-sm text-cyan-100 hover:bg-cyan-600/30"
        >
          + เพิ่มอีเว้นต์
        </button>
      </div>

      {editing && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 mb-8 space-y-4">
          <h2 className="text-lg font-normal">{isCreating ? 'เพิ่มอีเว้นต์' : 'แก้ไขอีเว้นต์'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-[var(--color-muted)]">ชื่องาน *</label>
              <input
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.event_name ?? ''}
                onChange={(e) => setEditing({ ...editing, event_name: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[var(--color-muted)]">ชื่อ (ไทย) — ไม่บังคับ</label>
              <input
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.title_thai ?? ''}
                onChange={(e) => setEditing({ ...editing, title_thai: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[var(--color-muted)]">แบรนด์ที่ร่วม (คั่นด้วยจุลภาค)</label>
              <input
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                placeholder="เช่น Louis Vuitton, Dior"
                value={brandsText}
                onChange={(e) => setBrandsText(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)]">สถานที่</label>
              <input
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.location ?? ''}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)]">หมวดหมู่</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.category ?? 'runway'}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              >
                {FASHION_CATEGORY_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)]">วันที่ (อีเว้นต์)</label>
              <input
                type="date"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.event_date ? String(editing.event_date).slice(0, 10) : ''}
                onChange={(e) => setEditing({ ...editing, event_date: e.target.value || null })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[var(--color-muted)]">ศิลปิน</label>
              <div className="flex flex-wrap gap-3 mt-1">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checks.namtan}
                    onChange={() => {
                      const n = !checks.namtan;
                      setChecks((c) => {
                        if (c.together) return { ...c, together: false, namtan: n };
                        return { ...c, namtan: n };
                      });
                    }}
                  />
                  Namtan
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checks.film}
                    onChange={() => {
                      const f = !checks.film;
                      setChecks((c) => {
                        if (c.together) return { ...c, together: false, film: f };
                        return { ...c, film: f };
                      });
                    }}
                  />
                  Film
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checks.together}
                    onChange={() => {
                      const t = !checks.together;
                      if (t) {
                        setChecks({ namtan: false, film: false, together: true });
                      } else {
                        setChecks({ namtan: true, film: true, together: false });
                      }
                    }}
                  />
                  ร่วมกันคู่ (Together)
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)]">Hashtag ประจำงาน</label>
              <input
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.hashtag ?? ''}
                onChange={(e) => setEditing({ ...editing, hashtag: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)]">ยอดเอนเกจ (Engagement)</label>
              <input
                type="number"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.engagement ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setEditing({ ...editing, engagement: v === '' ? null : Number(v) });
                }}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)]">EMV (สรุป)</label>
              <input
                type="number"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.emv ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setEditing({ ...editing, emv: v === '' ? null : Number(v) });
                }}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)]">MIV (สรุป)</label>
              <input
                type="number"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.miv ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setEditing({ ...editing, miv: v === '' ? null : Number(v) });
                }}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)]">จำนวนลุค (Looks)</label>
              <input
                type="number"
                min={1}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.look_count ?? 1}
                onChange={(e) => setEditing({ ...editing, look_count: parseInt(e.target.value, 10) || 1 })}
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-muted)]">ลำดับ (sort)</label>
              <input
                type="number"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm"
                value={editing.sort_order ?? 0}
                onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-[var(--color-muted)]">URL รูปปก (หรืออัปโหลด)</label>
              <input
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm mb-2"
                value={editing.image_url ?? ''}
                onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                className="text-xs"
                disabled={uploading}
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(editing.in_highlight)}
                onChange={(e) => setEditing({ ...editing, in_highlight: e.target.checked })}
              />
              แสดงในแถบไฮไลต์ (carousel บน)
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.visible !== false}
                onChange={(e) => setEditing({ ...editing, visible: e.target.checked })}
              />
              แสดงบนเว็บ
            </label>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={save}
              className="px-4 py-2 rounded-lg bg-cyan-700/30 border border-cyan-500/50 text-sm"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 rounded-lg border border-white/10 text-sm text-muted"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50"
          >
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">{r.event_name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {r.event_date?.slice(0, 10) ?? '—'} · {(r.brands ?? []).join(', ') || '—'}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => openEdit(r)} className="text-sm text-cyan-300 hover:underline">
                แก้ไข
              </button>
              <button type="button" onClick={() => remove(r.id)} className="text-sm text-rose-300/80 hover:underline">
                ลบ
              </button>
            </div>
          </li>
        ))}
      </ul>

      {rows.length === 0 && !editing && (
        <p className="text-sm text-[var(--color-text-muted)] py-8 text-center border border-dashed border-[var(--color-border)] rounded-xl">
          ยังไม่มีรายการ — กด &quot;เพิ่มอีเว้นต์&quot; หรือรันคำสั่ง SQL สร้างตาราง <code className="text-xs">fashion_events</code> ใน Supabase
        </p>
      )}
    </div>
  );
}
