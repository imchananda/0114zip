'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Save, X, Trophy } from 'lucide-react';

interface Award {
  id: string;
  title: string;
  title_thai: string | null;
  show: string;
  year: number;
  category: string;
  artist: 'namtan' | 'film' | 'both';
  result: 'won' | 'nominated';
}

const EMPTY_FORM: Partial<Award> = {
  title: '',
  title_thai: '',
  show: '',
  year: new Date().getFullYear(),
  category: '',
  artist: 'both',
  result: 'won',
};

const ARTIST_LABELS: Record<string, string> = {
  namtan: '💙 น้ำตาล',
  film: '💛 ฟิล์ม',
  both: '💙💛 คู่จิ้น',
};
const RESULT_LABELS: Record<string, string> = {
  won: '🏆 Won',
  nominated: '🎯 Nominated',
};

export default function AdminAwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Award>>(EMPTY_FORM);
  const [filterArtist, setFilterArtist] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  const fetchAwards = async () => {
    try {
      const res = await fetch('/api/admin/awards');
      if (!res.ok) throw new Error(await res.text());
      setAwards(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAwards(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (award: Award) => {
    setEditingId(award.id);
    setForm({ ...award });
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    if (!form.title || !form.show || !form.year || !form.category) {
      setError('กรุณากรอกชื่อรางวัล งานประกาศรางวัล ปีที่ได้รับ และหมวดหมู่รางวัล');
      return;
    }
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...form } : form;
    const res = await fetch('/api/admin/awards', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { setError((await res.json()).error ?? 'บันทึกไม่สำเร็จ'); return; }
    closeModal();
    fetchAwards();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบรางวัลนี้?')) return;
    const res = await fetch(`/api/admin/awards?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { setError((await res.json()).error ?? 'ลบไม่สำเร็จ'); return; }
    fetchAwards();
  };

  const allYears = Array.from(new Set(awards.map(a => a.year))).sort((a, b) => b - a);
  const filtered = awards.filter(a =>
    (filterArtist === 'all' || a.artist === filterArtist) &&
    (filterYear === 'all' || a.year === Number(filterYear))
  );
  const yearGroups = Array.from(new Set(filtered.map(a => a.year))).sort((a, b) => b - a);

  const inputCls =
    'w-full px-3 py-2.5 rounded-xl bg-[var(--color-panel)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:border-[#6cbfd0] focus:ring-1 focus:ring-[#6cbfd0]/30 focus:outline-none transition-all';

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
            <Trophy className="w-6 h-6 text-yellow-400" /> จัดการรางวัล
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">เพิ่ม/แก้ไขรางวัลที่น้ำตาลและฟิล์มได้รับ</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-[#6cbfd0] text-[#141413] font-semibold text-sm flex items-center gap-1.5 hover:bg-[#4a9aab] transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> เพิ่มรางวัล
        </button>
      </div>

      {/* Stats + Filters */}
      {!loading && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span className="text-lg">🏆</span>
              <div>
                <div className="text-base font-semibold text-[var(--color-text-primary)]">
                  {awards.filter(a => a.result === 'won').length}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Won</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span className="text-lg">🎯</span>
              <div>
                <div className="text-base font-semibold text-[var(--color-text-primary)]">
                  {awards.filter(a => a.result === 'nominated').length}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Nominated</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap ml-auto">
            <select
              value={filterArtist}
              onChange={e => setFilterArtist(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-sm focus:border-[#6cbfd0] focus:outline-none"
            >
              <option value="all">👤 ทุกคน</option>
              <option value="both">💙💛 คู่จิ้น</option>
              <option value="namtan">💙 น้ำตาล</option>
              <option value="film">💛 ฟิล์ม</option>
            </select>
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-sm focus:border-[#6cbfd0] focus:outline-none"
            >
              <option value="all">📅 ทุกปี</option>
              {allYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Awards List */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] rounded-2xl">
          <p className="text-4xl mb-2">🏆</p>
          <p>
            {awards.length === 0
              ? 'ยังไม่มีรางวัล — กดปุ่ม "เพิ่มรางวัล" ด้านบนได้เลย'
              : 'ไม่พบรางวัลตามตัวกรองที่เลือก'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {yearGroups.map(year => {
            const yearAwards = filtered.filter(a => a.year === year);
            return (
              <div key={year}>
                <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
                  <span className="w-8 h-px bg-[var(--color-border)]" />
                  {year}
                  <span className="flex-1 h-px bg-[var(--color-border)]" />
                </h2>
                <div className="space-y-2">
                  {yearAwards.map(award => (
                    <div
                      key={award.id}
                      className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4 hover:border-[var(--color-text-muted)]/30 transition-colors"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
                          award.result === 'won' ? 'bg-yellow-400/15' : 'bg-[var(--color-panel)]'
                        }`}
                      >
                        {award.result === 'won' ? '🏆' : '🎯'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                          {award.title}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {award.show} · {award.category} · {ARTIST_LABELS[award.artist]}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border ${
                            award.result === 'won'
                              ? 'bg-green-500/15 text-green-400 border-green-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {RESULT_LABELS[award.result]}
                        </span>
                        <button
                          onClick={() => openEdit(award)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(award.id)}
                          className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-display text-xl font-medium text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              {editingId ? 'แก้ไขรางวัล' : 'เพิ่มรางวัลใหม่'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AwardField label="ชื่อรางวัล (ภาษาไทย) *" className="md:col-span-2">
                <input
                  className={inputCls}
                  value={form.title || ''}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="เช่น คู่จิ้นแห่งปี"
                />
              </AwardField>

              <AwardField label="ชื่อรางวัล (ภาษาอังกฤษ)" className="md:col-span-2">
                <input
                  className={inputCls}
                  value={form.title_thai || ''}
                  onChange={e => setForm({ ...form, title_thai: e.target.value })}
                  placeholder="e.g. Best Couple of the Year"
                />
              </AwardField>

              <AwardField label="งานประกาศรางวัล *">
                <input
                  className={inputCls}
                  value={form.show || ''}
                  onChange={e => setForm({ ...form, show: e.target.value })}
                  placeholder="เช่น Kazz Awards"
                />
              </AwardField>

              <AwardField label="ปีที่ได้รับ *">
                <input
                  type="number"
                  className={inputCls}
                  value={form.year || ''}
                  onChange={e =>
                    setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })
                  }
                />
              </AwardField>

              <AwardField label="หมวดหมู่รางวัล *">
                <input
                  className={inputCls}
                  value={form.category || ''}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="เช่น Best Couple"
                />
              </AwardField>

              <AwardField label="ผลการประกาศ">
                <select
                  className={inputCls}
                  value={form.result || 'won'}
                  onChange={e => setForm({ ...form, result: e.target.value as 'won' | 'nominated' })}
                >
                  <option value="won">🏆 Won — ได้รับรางวัล</option>
                  <option value="nominated">🎯 Nominated — เข้าชิง</option>
                </select>
              </AwardField>

              <AwardField label="นักแสดง" className="md:col-span-2">
                <select
                  className={inputCls}
                  value={form.artist || 'both'}
                  onChange={e =>
                    setForm({ ...form, artist: e.target.value as 'namtan' | 'film' | 'both' })
                  }
                >
                  <option value="both">💙💛 คู่จิ้น (ทั้งน้ำตาลและฟิล์ม)</option>
                  <option value="namtan">💙 น้ำตาล</option>
                  <option value="film">💛 ฟิล์ม</option>
                </select>
              </AwardField>
            </div>

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

            <div className="flex gap-3 mt-6 pt-5 border-t border-[var(--color-border)]">
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-[#6cbfd0] text-[#141413] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#4a9aab] transition-colors"
              >
                <Save className="w-4 h-4" /> บันทึก
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm flex items-center justify-center gap-2 hover:bg-[var(--color-panel)] transition-colors"
              >
                <X className="w-4 h-4" /> ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AwardField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}
