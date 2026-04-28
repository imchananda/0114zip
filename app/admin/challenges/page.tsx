'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: string;
  reward_points: number;
  questions: unknown[];
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  slug: '',
  title: '',
  description: '',
  type: 'quiz',
  reward_points: 10,
  questions_raw: '[]',
};

const TYPE_LABELS: Record<string, string> = {
  quiz: '🧠 Quiz',
  vote: '🗳️ Vote',
  trivia: '⭐ Trivia',
};

const TYPE_ICONS: Record<string, string> = {
  quiz: '🧠',
  vote: '🗳️',
  trivia: '⭐',
};

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/admin/challenges');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (Array.isArray(data)) setChallenges(data as Challenge[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChallenges(); }, []);

  const parseQuestions = (raw: string): unknown[] | null => {
    try { return JSON.parse(raw); } catch { return null; }
  };

  const handleCreate = async () => {
    setError('');
    if (!form.slug || !form.title) { setError('กรุณากรอก Slug และ Title ครับ'); return; }
    const questions = parseQuestions(form.questions_raw);
    if (questions === null) { setError('JSON ของ Questions ไม่ถูกต้องครับ'); return; }
    setSaving(true);
    const res = await fetch('/api/admin/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: form.slug,
        title: form.title,
        description: form.description,
        type: form.type,
        reward_points: form.reward_points,
        questions,
      }),
    });
    setSaving(false);
    if (!res.ok) { setError((await res.json()).error || 'บันทึกไม่สำเร็จ'); return; }
    setIsCreating(false);
    setForm(EMPTY_FORM);
    fetchChallenges();
  };

  const handleUpdate = async () => {
    setError('');
    if (!form.slug || !form.title) { setError('กรุณากรอก Slug และ Title ครับ'); return; }
    const questions = parseQuestions(form.questions_raw);
    if (questions === null) { setError('JSON ของ Questions ไม่ถูกต้องครับ'); return; }
    setSaving(true);
    const res = await fetch('/api/admin/challenges', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingId,
        slug: form.slug,
        title: form.title,
        description: form.description,
        type: form.type,
        reward_points: form.reward_points,
        questions,
      }),
    });
    setSaving(false);
    if (!res.ok) { setError((await res.json()).error || 'แก้ไขไม่สำเร็จ'); return; }
    setEditingId(null);
    setForm(EMPTY_FORM);
    fetchChallenges();
  };

  const handleToggle = async (id: string, current: boolean) => {
    await fetch('/api/admin/challenges', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current }),
    });
    fetchChallenges();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ลบ Challenge นี้?')) return;
    const res = await fetch(`/api/admin/challenges?id=${id}`, { method: 'DELETE' });
    if (!res.ok) { setError((await res.json()).error || 'ลบไม่สำเร็จ'); return; }
    fetchChallenges();
  };

  const startEdit = (ch: Challenge) => {
    setEditingId(ch.id);
    setIsCreating(false);
    setForm({
      slug: ch.slug,
      title: ch.title,
      description: ch.description ?? '',
      type: ch.type,
      reward_points: ch.reward_points,
      questions_raw: JSON.stringify(ch.questions, null, 2),
    });
    setError('');
  };

  const cancelForm = () => {
    setEditingId(null);
    setIsCreating(false);
    setForm(EMPTY_FORM);
    setError('');
  };

  const filtered = challenges.filter(ch =>
    (filterType === 'all' || ch.type === filterType) &&
    (filterStatus === 'all' || (filterStatus === 'active' ? ch.is_active : !ch.is_active))
  );

  const ChallengeForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-6">
      <h3 className="text-base font-normal text-[var(--color-text-primary)] mb-4">
        {editingId ? '✏️ แก้ไข Challenge' : '✨ สร้าง Challenge ใหม่'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-muted)]">Slug (URL) *</label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm"
            value={form.slug}
            onChange={e => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
            placeholder="my-quiz-slug"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-muted)]">ประเภท (Type)</label>
          <select
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
          >
            <option value="quiz">🧠 Quiz</option>
            <option value="vote">🗳️ Vote</option>
            <option value="trivia">⭐ Trivia</option>
          </select>
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs text-[var(--color-text-muted)]">หัวข้อ (Title) *</label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="ชื่อ Challenge..."
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs text-[var(--color-text-muted)]">คำอธิบาย (Description)</label>
          <textarea
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm min-h-[60px] resize-none"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="อธิบาย Challenge สักนิด..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-muted)]">แต้มรางวัล (Points)</label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm"
            value={form.reward_points}
            onChange={e => setForm({ ...form, reward_points: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs text-[var(--color-text-muted)]">
            Questions (JSON Array) —{' '}
            <span className="text-[#6cbfd0]">ดูตัวอย่างใน migration SQL ครับ</span>
          </label>
          <textarea
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-mono min-h-[120px] resize-y"
            value={form.questions_raw}
            onChange={e => setForm({ ...form, questions_raw: e.target.value })}
          />
        </div>
      </div>
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-[#6cbfd0] text-[#141413] text-sm font-medium flex items-center gap-2 disabled:opacity-50 hover:bg-[#4a9aab] transition-colors"
        >
          <Save className="w-4 h-4" /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm flex items-center gap-2 hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="w-4 h-4" /> ยกเลิก
        </button>
      </div>
    </div>
  );

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
          <h1 className="font-display text-2xl font-normal text-[var(--color-text-primary)] flex items-center gap-2">
            🎮 จัดการ Challenges
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">สร้าง/แก้ไขกิจกรรมและมินิเกม</p>
        </div>
        <div className="shrink-0">
          {!isCreating && !editingId && (
            <button
              onClick={() => { setIsCreating(true); setEditingId(null); setForm(EMPTY_FORM); setError(''); }}
              className="px-4 py-2 rounded-xl bg-[#6cbfd0] text-[#141413] font-medium text-sm flex items-center gap-1.5 hover:bg-[#4a9aab] transition-colors"
            >
              <Plus className="w-4 h-4" /> สร้างใหม่
            </button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {isCreating && <ChallengeForm onSave={handleCreate} onCancel={cancelForm} />}

      {/* Stats + Filters */}
      {!loading && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          {/* Stats */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span>🎮</span>
              <div>
                <div className="text-base font-medium text-[var(--color-text-primary)]">{challenges.length}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">ทั้งหมด</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <div>
                <div className="text-base font-medium text-[var(--color-text-primary)]">{challenges.filter(c => c.is_active).length}</div>
                <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">เปิดอยู่</div>
              </div>
            </div>
          </div>
          {/* Filters */}
          <div className="flex gap-2 flex-wrap ml-auto">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-sm focus:border-[#6cbfd0] focus:outline-none"
            >
              <option value="all">🎮 ทุกประเภท</option>
              <option value="quiz">🧠 Quiz</option>
              <option value="vote">🗳️ Vote</option>
              <option value="trivia">⭐ Trivia</option>
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-3 py-2 text-sm focus:border-[#6cbfd0] focus:outline-none"
            >
              <option value="all">📋 ทุกสถานะ</option>
              <option value="active">🟢 เปิดอยู่</option>
              <option value="inactive">⚫ ปิดอยู่</option>
            </select>
          </div>
        </div>
      )}

      {/* Challenges List */}
      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-muted)]">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-2xl border-dashed">
          <p className="text-4xl mb-2">🎮</p>
          <p>
            {challenges.length === 0
              ? 'ยังไม่มี Challenge — กดปุ่ม "สร้างใหม่" ด้านบนได้เลยครับ'
              : 'ไม่พบ Challenge ตาม filter ที่เลือก'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ch =>
            editingId === ch.id ? (
              <ChallengeForm key={ch.id} onSave={handleUpdate} onCancel={cancelForm} />
            ) : (
              <div
                key={ch.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${
                    ch.is_active ? 'bg-green-400/15' : 'bg-[var(--color-panel)]'
                  }`}
                >
                  {TYPE_ICONS[ch.type] ?? '🎮'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        ch.is_active ? 'bg-green-400' : 'bg-[#87867f]'
                      }`}
                    />
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{ch.title}</p>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {TYPE_LABELS[ch.type] ?? ch.type} · {ch.questions.length} คำถาม · +{ch.reward_points} pts · slug: {ch.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/challenges/${ch.slug}`}
                    target="_blank"
                    className="text-xs text-[#6cbfd0] hover:underline"
                  >
                    ดู
                  </Link>
                  <button
                    onClick={() => handleToggle(ch.id, ch.is_active)}
                    className={`text-[10px] px-2.5 py-1 rounded-full transition-colors ${
                      ch.is_active
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-[var(--color-panel)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                    }`}
                  >
                    {ch.is_active ? '🟢 เปิด' : '⚫ ปิด'}
                  </button>
                  <button
                    onClick={() => startEdit(ch)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-panel)] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ch.id)}
                    className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
